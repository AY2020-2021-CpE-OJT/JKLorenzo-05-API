import { Router } from "express";
import express, { MongoClient } from "mongodb";
import { authenticate } from "../../../modules/Auth.js";
import { remove } from "../../../modules/Cache.js";
import { expect, expectAll } from "../../../utils/TypeGuards.js";
import PBData from "../../../structures/PBData.js";

export default function (router: Router, client: MongoClient): Router {
  return router.delete("/:id", authenticate, async (req, res) => {
    console.log("contact delete");
    try {
      // expect a valid id
      try {
        expect(req.params, ["id"]);
      } catch (error) {
        return res.status(400).send(error);
      }

      // update contact
      const operation = await client
        .db("phonebook")
        .collection("contacts")
        .findOneAndDelete({ _id: new express.ObjectID(req.params.id) });

      // expect a valid output
      if (!operation.value) {
        return res.status(409).send("Failed to delete contact");
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

      // update cache
      remove(data.id);

      // 205 Reset Content
      await res.sendStatus(205);
    } catch (error) {
      console.error(error);
      await res.sendStatus(500);
    }
  });
}
