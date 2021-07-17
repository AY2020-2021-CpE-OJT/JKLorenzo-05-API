import { Router } from "express";
import { MongoClient } from "mongodb";
import CacheManager from "../../../modules/CacheManager.js";
import { PBData, PBPartialData } from "../../../structures/PBData.js";
import { expect, expectAll } from "../../../utils/TypeGuards.js";

export default function (router: Router, client: MongoClient): Router {
  return router.put("/", async (req, res) => {
    console.log("contact put");
    try {
      // construct data
      const insert_data = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        phone_numbers: req.body.phone_numbers ?? [],
      } as PBPartialData;

      // expect a partial data with firstname, lastname and phone numbers
      expect(insert_data, ["first_name", "last_name", "phone_numbers"]);

      // insert contact
      const operation = await client
        .db("phonebook")
        .collection("contacts")
        .insertOne(insert_data);

      // check insert count
      if (operation.insertedCount === 0) {
        throw new Error("OPERATION_FAILED");
      }

      // construct data
      const data = {
        id: operation.insertedId?.toString(),
        first_name: insert_data.first_name,
        last_name: insert_data.last_name,
        phone_numbers: insert_data.phone_numbers,
      } as PBData;

      // check data
      expectAll(data, "UNEXPECTED_RESULT");

      // update cache
      CacheManager.update(data);

      // invalidate cache order
      CacheManager.invalidateOrder();

      // send data
      await res.json(data);
    } catch (error) {
      console.error(error);
      res.status(400).send(String(error));
    }
  });
}
