import db from "../db.js";
import express from "express";

const router = express.Router();
export default router;

router.get("/api/items", async (req, res) => {
  res.send(await db.getItems());
});

router.post("/api/votes/:item", async (req, res) => {
  await db.vote(req.params.item, req.body.upvote);
  res.send("");
});
