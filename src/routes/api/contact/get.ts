import { Router } from "express";
import express, { MongoClient } from "mongodb";
import CacheManager from "../../../modules/CacheManager.js";
import { PBData } from "../../../structures/PBData.js";
import { expect, expectAll } from "../../../utils/TypeGuards.js";

export default function (router: Router, client: MongoClient): Router {
  return router.get("/:id", async (req, res) => {
    console.log("contact get");
    try {
      // expect a valid id
      expect(req.params, ["id"]);

      // Get data from cache
      let data = CacheManager.get(req.params.id);

      // Check if cache is not valid
      if (!CacheManager.isValid()) {
        // get data from db
        const result = await client
          .db("phonebook")
          .collection("contacts")
          .findOne({ _id: new express.ObjectID(req.params.id) });

        // expect a valid output
        if (!result) {
          throw new Error("CONTACT_NOT_FOUND");
        }

        // construct
        data = {
          id: result._id?.toString(),
          first_name: result.first_name,
          last_name: result.last_name,
          phone_numbers: result.phone_numbers,
        } as PBData;

        // check data
        expectAll(data, "UNEXPECTED_RESULT");
      }

      // send data
      await res.json(data);
    } catch (error) {
      console.error(error);
      res.status(400).send(String(error));
    }
  });
}
