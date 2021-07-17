import { Router } from "express";
import express, { MongoClient } from "mongodb";
import CacheManager from "../../../modules/CacheManager.js";
import { PBData } from "../../../structures/PBData.js";
import { expect, expectAll } from "../../../utils/TypeGuards.js";

export default function (router: Router, client: MongoClient): Router {
  return router.delete("/:id", async (req, res) => {
    console.log("contact delete");
    try {
      // expect a valid id
      expect(req.params, ["id"]);

      // update contact
      const operation = await client
        .db("phonebook")
        .collection("contacts")
        .findOneAndDelete({ _id: new express.ObjectID(req.params.id) });

      // expect a valid output
      if (!operation.value) {
        throw new Error("CONTACT_NOT_FOUND");
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

      // update cache
      CacheManager.delete(data.id);

      // ack request
      await res.send("OK");
    } catch (error) {
      console.error(error);
      res.status(400).send(String(error));
    }
  });
}
