import path from "path";
import { promises as fs } from "fs";
import webpack from "webpack";
import middleware from "webpack-dev-middleware";
import express from "express";
import compression from "compression";
import React from "react";
import ReactDOMServer from "react-dom/server.js";

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
  const reactRoot = ReactDOMServer.renderToString(React.createElement(Main, initialState));
  res.render("index", {
    initialState: JSON.stringify(initialState)
      .replace(/\\n/g, '\\\\n')
      .replace(/"/g, '\\"'),
    reactRoot
  });
});

app.listen(3000);
