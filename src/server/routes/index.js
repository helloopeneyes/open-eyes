import express from "express";
import React from "react";
import ReactDOMServer from "react-dom/server.js";
import { ServerStyleSheet } from "styled-components";

import db from "../db.js";
import Main from "../../client/main.js";

const router = express.Router();
export default router;

router.get("/", async (req, res) => {
  const email = req.user && req.user.emails && req.user.emails.length && req.user.emails[0].value;
  const initialState = { email, items: await db.getItems() };

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
