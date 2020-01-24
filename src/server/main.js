import path from "path";
import { promises as fs } from "fs";
import knex from "knex";
import webpack from "webpack";
import middleware from "webpack-dev-middleware";
import express from "express";
import compression from "compression";
import React from "react";
import ReactDOMServer from "react-dom/server.js";
import { ServerStyleSheet } from "styled-components";

import webpackConfig from "../../webpack.config.js";
import knexConfig from "./knexfile.js";
import Main from "../client/main.js";

const db = knex(knexConfig);

const app = express();

app.set("views", __dirname + "/views");
app.set("view engine", "hbs");
app.use(express.json());
app.use(compression());
const compiler = webpack(webpackConfig);
app.use(middleware(compiler, { publicPath: "/" }));

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

app.get("/", async (req, res) => {
  const initialState = { items: await getItems() };

  const styles = new ServerStyleSheet();
  const reactRoot = ReactDOMServer.renderToString(styles.collectStyles(React.createElement(Main, initialState)));
  const styleTags = styles.getStyleTags();
  styles.seal();

  res.render("index", {
    styleTags,
    initialState: JSON.stringify(initialState)
      .replace(/\\n/g, "\\\\n")
      .replace(/"/g, '\\"'),
    reactRoot
  });
});

app.get("/api/items", async (req, res) => {
  res.send(await getItems());
});

app.post("/api/votes/:item", async (req, res) => {
  await db
    .insert({ item: req.params.item, upvote: req.body.upvote })
    .into("votes")
    .return();
  res.send("");
});

app.listen(3000);
