import path from "path";
import { promises as fs } from "fs";
import webpack from "webpack";
import middleware from "webpack-dev-middleware";
import express from "express";
import compression from "compression";
import React from "react";
import ReactDOMServer from "react-dom/server.js";
import { ServerStyleSheet } from "styled-components";

import webpackConfig from "../../webpack.config.js";
import Main from "../client/main.js";

const app = express();

app.set("views", __dirname + "/views");
app.set("view engine", "hbs");
const compiler = webpack(webpackConfig);
app.use(compression());
app.use(middleware(compiler, { publicPath: "/" }));

async function getItems() {
  const items = await fs.readdir(__dirname + "/items");
  return await Promise.all(
    items
      .filter(f => f.endsWith(".md"))
      .map(async f => {
        const contents = await fs.readFile(__dirname + "/items/" + f, "utf8");
        return {
          name: f,
          contents
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
      .replace(/\\n/g, '\\\\n')
      .replace(/"/g, '\\"'),
    reactRoot
  });
});

app.listen(3000);
