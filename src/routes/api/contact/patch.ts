import { Router } from "express";
import express, { MongoClient } from "mongodb";
import CacheManager from "../../../modules/CacheManager.js";
import { PBData, PBPartialData } from "../../../structures/PBData.js";
import { expect, expectAll } from "../../../utils/TypeGuards.js";

export default function (router: Router, client: MongoClient): Router {
  return router.patch("/:id", async (req, res) => {
    console.log("contact patch");
    try {
      const raw_data = req.body as PBPartialData;
      const update_data = {} as PBPartialData;

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
        throw new Error("OPERATION_FAILED");
      }

      // construct
      const data = {
        id: operation.value._id?.toString(),
        first_name: operation.value.first_name,
        last_name: operation.value.last_name,
        phone_numbers: operation.value.phone_numbers,
      } as PBData;

      // check data
      expectAll(data, "UNEXPECTED_RESULT");

      // invalidate cache order on name change
      const previous_data = CacheManager.get(data.id);
      if (
        previous_data?.first_name !== data.first_name ||
        previous_data?.last_name !== data.last_name
      ) {
        CacheManager.invalidateOrder();
      }

      // update cache
      CacheManager.update(data);

      // ack request
      await res.send("OK");
    } catch (error) {
      console.error(error);
      res.status(400).send(String(error));
    }
  });
}
