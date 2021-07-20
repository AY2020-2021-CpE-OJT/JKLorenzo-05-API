import { Router } from "express";
import express, { MongoClient } from "mongodb";
import { authenticate } from "../../../modules/Auth.js";
import { get, isValid } from "../../../modules/Cache.js";
import { expect, expectAll } from "../../../utils/TypeGuards.js";
import PBData from "../../../structures/PBData.js";

export default function (router: Router, client: MongoClient): Router {
  return router.get("/:id", authenticate, async (req, res) => {
    console.log("contact get");
    try {
      // expect a valid id
      try {
        expect(req.params, ["id"]);
      } catch (error) {
        return res.status(400).send(error);
      }

      // Get data from cache
      let data = get(req.params.id);

      // Check if cache is not valid
      if (!isValid()) {
        // get data from db
        const result = await client
          .db("phonebook")
          .collection("contacts")
          .findOne({ _id: new express.ObjectID(req.params.id) });

        // construct
        data = {
          id: result?._id?.toString(),
          first_name: result.first_name,
          last_name: result.last_name,
          phone_numbers: result.phone_numbers,
        } as PBData;

        // check data
        expectAll(data);
      }

      // expect a valid output
      if (!data) {
        return res.status(404).send("Contact not found");
      }

      // send data
      await res.json(data);
    } catch (error) {
      console.error(error);
      await res.sendStatus(500);
    }
  });
}
