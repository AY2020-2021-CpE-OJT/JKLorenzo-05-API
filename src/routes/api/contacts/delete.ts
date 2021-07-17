import { Router } from "express";
import express, { MongoClient } from "mongodb";
import CacheManager from "../../../modules/CacheManager.js";
import { PBPartialData } from "../../../structures/PBData.js";
import { expect } from "../../../utils/TypeGuards.js";

export default function (router: Router, client: MongoClient): Router {
  return router.delete("/", async (req, res) => {
    console.log("contacts delete");
    try {
      const partial_data = req.body as PBPartialData[];

      // expect valid ids
      for (const this_data of partial_data) expect(this_data, ["id"]);

      // delete contacts
      const operation = await client
        .db("phonebook")
        .collection("contacts")
        .deleteMany({
          _id: {
            $in: partial_data.map((data) => new express.ObjectID(data.id)),
          },
        });

      // check operation status
      if (!operation.result.ok) {
        throw new Error("OPERATION_FAILED");
      }

      // get delete count
      const delete_count = operation.deletedCount ?? 0;

      // invalidate cache if atleast 1 contact is deleted
      if (delete_count > 0) {
        CacheManager.invalidateCache();
      }

      // send delete count
      await res.send(delete_count.toString());
    } catch (error) {
      console.error(error);
      res.status(400).send(String(error));
    }
  });
}
