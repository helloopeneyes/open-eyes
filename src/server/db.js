import { promises as fs } from "fs";
import knex from "knex";
import dotenv from "dotenv";

import knexConfig from "./knexfile.js";

dotenv.config();

const db = knex(knexConfig);

function getHashedIdentifier(identifier) {
  return crypto
    .createHash("sha256")
    .update(
      crypto
        .createHash("sha256")
        .update(identifier + process.env.BASE_SECRET)
        .digest()
    )
    .digest("base64");
}

async function getUserIdForIdentifier(identifier) {
  const hashedIdentifier = getHashedIdentifier(identifier);
  const user = await db
    .from("users")
    .where({ identifier: hashedIdentifier })
    .first("id")
    .then();
  return user && user.id;
}

async function getItems(identifier) {
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

  const user_id = await getUserIdForIdentifier(identifier);

  let userVotesFromItem = {};
  if (user_id) {
    const userVotes = await db
      .from("votes")
      .select("item", "upvote")
      .where({ user_id });
    userVotesFromItem = userVotes.reduce((acc, vote) => {
      const { item } = vote;
      delete vote.item;
      acc[item] = vote;
      return acc;
    }, {});
  }

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
      .filter(filename => filename.endsWith(".md") && filename !== "meta.md")
      .map(async filename => {
        const lines = (await fs.readFile(__dirname + "/items/" + filename, "utf8")).trim().split("\n");
        const title = lines[0];
        const contents = lines.slice(1, -1).join("\n");
        const labels = lines[lines.length - 1].split(",").map(label => label.trim());

        const name = filename
          .split(".")
          .slice(0, -1)
          .join(".");

        return {
          name,
          title,
          contents,
          labels,
          upvotes: (votesFromItem[name] && votesFromItem[name].upvotes) || 0,
          downvotes: (votesFromItem[name] && votesFromItem[name].downvotes) || 0,
          totalvotes: (votesFromItem[name] && votesFromItem[name].totalvotes) || 0,
          userVote: userVotesFromItem[name] || { upvote: null }
        };
      })
  );
}

async function vote(item, upvote, identifier) {
  const user_id = await getUserIdForIdentifier(identifier);
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

async function deleteVote(item, identifier) {
  const user_id = await getUserIdForIdentifier(identifier);
  await db("votes")
    .where({ item, user_id })
    .delete();
}

async function ensureUser(identifier) {
  const hashedIdentifier = getHashedIdentifier(identifier);
  const user = await db
    .from("users")
    .where({ identifier: hashedIdentifier })
    .first()
    .then();
  if (!user) {
    return await db
      .insert({ identifier: hashedIdentifier })
      .into("users")
      .return();
  }
  return user;
}

export default { getItems, vote, deleteVote, ensureUser };
