import express from "express";

import db from "../db.js";
import { getUserEmail } from "../utils.js";

const router = express.Router();
export default router;

router.get("/items", async (req, res) => {
  res.send(await db.getItems(getUserEmail(req.user)));
});

router.post("/votes/:item", async (req, res) => {
  if (!req.user) {
    res.sendStatus(401);
    return;
  }
  await db.vote(req.params.item, req.body.upvote, getUserEmail(req.user));
  res.send("");
});

router.delete("/votes/:item", async (req, res) => {
  if (!req.user) {
    res.sendStatus(401);
    return;
  }
  await db.deleteVote(req.params.item, getUserEmail(req.user));
  res.send("");
});
