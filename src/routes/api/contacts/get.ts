import { authenticate } from "../../../modules/Auth.js";
import { Router } from "express";
import { MongoClient } from "mongodb";
import {
  getAll,
  isOrdered,
  isValid,
  updateAll,
} from "../../../modules/Cache.js";
import { expectAll } from "../../../utils/TypeGuards.js";
import PBData from "../../../structures/PBData.js";
import PBPartialData from "../../../structures/PBPartialData.js";

export default function (router: Router, client: MongoClient): Router {
  return router.get("/", authenticate, async (req, res) => {
    console.log("contacts get");
    try {
      // get data from cache
      let data = getAll();

      // check if cache is invalid
      if (!isValid() || !isOrdered()) {
        // get data from the db
        const result = await client
          .db("phonebook")
          .collection("contacts")
          .find()
          .sort({ first_name: 1, last_name: 1 })
          .toArray();

        // construct
        data = result.map((value) => {
          const this_data = {
            id: value._id?.toString(),
            first_name: value?.first_name,
            last_name: value?.last_name,
            phone_numbers: value?.phone_numbers,
          } as PBData;

          // check data
          expectAll(this_data, "UNEXPECTED_RESULT");
          return this_data;
        });

        // update cache
        updateAll(data);
      }

      // send data without phone numbers
      await res.json(
        data.map((this_data) => {
          return {
            id: this_data.id,
            first_name: this_data.first_name,
            last_name: this_data.last_name,
          } as PBPartialData;
        })
      );
    } catch (error) {
      console.error(error);
      res.status(400).send(String(error));
    }
  });
}
