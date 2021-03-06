import { Router } from "express";
import { MongoClient } from "mongodb";
import { authenticate } from "../../../modules/Auth.js";
import { invalidateOrder, update } from "../../../modules/Cache.js";
import { expect, expectAll } from "../../../utils/TypeGuards.js";
import PBData from "../../../structures/PBData.js";
import PBPartialData from "../../../structures/PBPartialData.js";

export default function (router: Router, client: MongoClient): Router {
  return router.put("/", authenticate, async (req, res) => {
    console.log("contact put");
    try {
      // construct data
      const insert_data = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        phone_numbers: req.body.phone_numbers ?? [],
      } as PBPartialData;

      // expect a partial data with firstname, lastname and phone numbers
      try {
        expect(insert_data, ["first_name", "last_name", "phone_numbers"]);
      } catch (error) {
        return res.status(400).send(error);
      }

      // insert contact
      const operation = await client
        .db("phonebook")
        .collection("contacts")
        .insertOne(insert_data);

      // check insert count
      if (operation.insertedCount === 0) {
        return res.status(409).send("Failed to create contact");
      }

      // construct data
      const data = {
        id: operation.insertedId?.toString(),
        first_name: insert_data.first_name,
        last_name: insert_data.last_name,
        phone_numbers: insert_data.phone_numbers,
      } as PBData;

      // check data
      expectAll(data);

      // update cache
      update(data);

      // invalidate cache order
      invalidateOrder();

      // 201 Created
      await res.status(201).json(data);
    } catch (error) {
      console.error(error);
      await res.sendStatus(500);
    }
  });
}
