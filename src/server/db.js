import { promises as fs } from "fs";
import knex from "knex";

import knexConfig from "./knexfile.js";

const db = knex(knexConfig);

async function getItems() {
  const upvotes = await db
    .from("votes")
    .count({ count: "item" })
    .select("item")
    .where("upvote", "=", true)
    .groupBy("item")
    .then();

  const downvotes = await db
    .from("votes")
    .count({ count: "item" })
    .select("item")
    .where("upvote", "=", false)
    .groupBy("item")
    .then();

  const votesFromItem = {};
  for (const votes of upvotes) {
    votesFromItem[votes.item] = { upvotes: votes.count, downvotes: 0 };
  }
  for (const votes of downvotes) {
    if (!votesFromItem[votes.item]) votesFromItem[votes.item] = { upvotes: 0, downvotes: 0 };
    votesFromItem[votes.item].downvotes = votes.count;
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
          downvotes: (votesFromItem[name] && votesFromItem[name].downvotes) || 0
        };
      })
  );
}

function vote(item, upvote) {
  return db
    .insert({ item, upvote })
    .into("votes")
    .return();
}

export default { getItems, vote };
