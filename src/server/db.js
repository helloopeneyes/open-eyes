import { promises as fs } from "fs";
import knex from "knex";
import dotenv from "dotenv";

import knexConfig from "./knexfile.js";

dotenv.config();

const db = knex(knexConfig);

async function getItems() {
  const upvotes = await db
    .from("votes")
    .count({ count: "item" })
    .select("item")
    .where({ upvote: true })
    .groupBy("item")
    .then();

  const downvotes = await db
    .from("votes")
    .count({ count: "item" })
    .select("item")
    .where({ upvote: false })
    .groupBy("item")
    .then();

  const votesFromItem = {};
  for (const votes of upvotes) {
    votesFromItem[votes.item] = { upvotes: votes.count, downvotes: 0, totalvotes: votes.count };
  }
  for (const votes of downvotes) {
    if (!votesFromItem[votes.item]) votesFromItem[votes.item] = { upvotes: 0, downvotes: 0 };
    votesFromItem[votes.item].downvotes = votes.count;
    votesFromItem[votes.item].totalvotes = votesFromItem[votes.item].upvotes + votes.count;
  }

  const items = await fs.readdir(__dirname + "/items");

  return await Promise.all(
    items
      .filter(filename => filename.endsWith(".md"))
      .map(async filename => {
        const contents = await fs.readFile(__dirname + "/items/" + filename, "utf8");
        const name = filename
          .split(".")
          .slice(0, -1)
          .join(".");

        return {
          name,
          contents,
          upvotes: (votesFromItem[name] && votesFromItem[name].upvotes) || 0,
          downvotes: (votesFromItem[name] && votesFromItem[name].downvotes) || 0,
          totalvotes: (votesFromItem[name] && votesFromItem[name].totalvotes) || 0
        };
      })
  );
}

function getIdentifier(email) {
  return crypto
    .createHash("sha256")
    .update(
      crypto
        .createHash("sha256")
        .update(email + process.env.BASE_SECRET)
        .digest()
    )
    .digest("base64");
}

async function getUserIdForEmail(email) {
  const identifier = getIdentifier(email);
  const user = await db
    .from("users")
    .where({ identifier })
    .first("id")
    .then();
  return user.id;
}

async function vote(item, upvote, email) {
  const user_id = await getUserIdForEmail(email);
  const existing = await db
    .from("votes")
    .where({ item, user_id })
    .first();
  if (existing) {
    return db("votes")
      .update({ upvote })
      .where({ item, user_id })
      .return();
  } else {
    return db
      .insert({ item, upvote, user_id })
      .into("votes")
      .return();
  }
}

async function deleteVote(item, email) {
  const user_id = await getUserIdForEmail(email);
  await db("votes")
    .where({ item, user_id })
    .delete();
}

async function ensureUser(email) {
  const identifier = getIdentifier(email);
  const user = await db
    .from("users")
    .where({ identifier })
    .first()
    .then();
  if (!user) {
    return await db
      .insert({ identifier })
      .into("users")
      .return();
  }
  return user;
}

export default { getItems, vote, deleteVote, ensureUser };
