import { Router } from "express";
import express, { MongoClient } from "mongodb";
import { authenticate } from "../../../modules/Auth.js";
import { invalidateCache } from "../../../modules/Cache.js";
import { expect } from "../../../utils/TypeGuards.js";
import PBPartialData from "../../../structures/PBPartialData.js";

export default function (router: Router, client: MongoClient): Router {
  return router.delete("/", authenticate, async (req, res) => {
    console.log("contacts delete");
    try {
      const partial_data = req.body as PBPartialData[];

      // expect valid ids
      for (const this_data of partial_data) {
        try {
          expect(this_data, ["id"]);
        } catch (error) {
          return res.status(400).send(error);
        }
      }

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
        return res.status(409).send("Failed to delete contacts");
      }

      // get delete count
      const delete_count = operation.deletedCount ?? 0;

      // invalidate cache if atleast 1 contact is deleted
      if (delete_count > 0) {
        invalidateCache();
      }

      // send delete result
      if (delete_count === 0) {
        await res.send(`No contact was deleted`);
      } else if (delete_count === 1) {
        await res.send(`${delete_count} contact deleted`);
      } else {
        await res.send(`${delete_count} contacts deleted`);
      }
    } catch (error) {
      console.error(error);
      await res.sendStatus(500);
    }
  });
}
