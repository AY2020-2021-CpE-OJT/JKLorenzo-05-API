import { Router } from "express";
import express, { MongoClient } from "mongodb";
import { authenticate } from "../../../modules/Auth.js";
import { get, invalidateOrder, update } from "../../../modules/Cache.js";
import { expect, expectAll } from "../../../utils/TypeGuards.js";
import PBData from "../../../structures/PBData.js";
import PBPartialData from "../../../structures/PBPartialData.js";

export default function (router: Router, client: MongoClient): Router {
  return router.patch("/:id", authenticate, async (req, res) => {
    console.log("contact patch");
    try {
      const raw_data = req.body as PBPartialData;
      const update_data = {} as PBPartialData;

      try {
        // expect valid id
        expect(req.params, ["id"]);

        // expect valid data
        if ("first_name" in raw_data) {
          expect(raw_data, ["first_name"]);
          update_data.first_name = raw_data.first_name;
        }
        if ("last_name" in raw_data) {
          expect(raw_data, ["last_name"]);
          update_data.last_name = raw_data.last_name;
        }
        if ("phone_numbers" in raw_data) {
          expect(raw_data, ["phone_numbers"]);
          update_data.phone_numbers = raw_data.phone_numbers;
        }

        // check if there's at least 1 property to be updated
        if (Object.keys(update_data).length === 0) {
          throw "No update data";
        }
      } catch (error) {
        return res.status(400).send(error);
      }

      // update contact
      const operation = await client
        .db("phonebook")
        .collection("contacts")
        .findOneAndUpdate(
          { _id: new express.ObjectID(req.params.id) },
          {
            $set: update_data,
          },
          { returnDocument: "after" }
        );

      // expect a valid output
      if (!operation.value) {
        return res.status(409).send("Failed to update contact");
      }

      // construct
      const data = {
        id: operation.value._id?.toString(),
        first_name: operation.value.first_name,
        last_name: operation.value.last_name,
        phone_numbers: operation.value.phone_numbers,
      } as PBData;

      // check data
      expectAll(data);

      // invalidate cache order on name change
      const previous_data = get(data.id);
      if (
        previous_data?.first_name !== data.first_name ||
        previous_data?.last_name !== data.last_name
      ) {
        invalidateOrder();
      }

      // update cache
      update(data);

      // 205 Reset Content
      await res.sendStatus(205);
    } catch (error) {
      console.error(error);
      await res.sendStatus(500);
    }
  });
}
