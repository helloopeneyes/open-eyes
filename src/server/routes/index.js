import { promises as fs } from "fs";
import express from "express";
import React from "react";
import ReactDOMServer from "react-dom/server.js";
import { ServerStyleSheet } from "styled-components";

import db from "../db.js";
import { getUserEmail } from "../utils.js";
import Main from "../../client/main.js";
import About from "../../client/about.js";

const router = express.Router();
export default router;

router.get("/about", async (req, res) => {
  const styles = new ServerStyleSheet();
  const reactRoot = ReactDOMServer.renderToString(styles.collectStyles(React.createElement(About)));
  const styleTags = styles.getStyleTags();
  styles.seal();

  res.render("about", { styleTags, reactRoot });
});

router.get("/", async (req, res) => {
  const email = getUserEmail(req.user);
  const metaLines = (await fs.readFile(__dirname + "/../items/meta.md", "utf8")).trim().split("\n");
  const metaDates = metaLines[metaLines.length - 1].split(",").map(date => date.trim());
  const meta = { content: metaLines.slice(0, -1), startDate: metaDates[0], endDate: metaDates[1] };
  const label = req.query.label;
  const initialState = { isClient: false, label, email, meta, items: await db.getItems(email) };

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
