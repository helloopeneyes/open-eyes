import webpack from "webpack";
import middleware from "webpack-dev-middleware";
import express from "express";
import compression from "compression";
import dotenv from "dotenv";
import passport from "passport";
import Auth0Strategy from "passport-auth0";
import session from "express-session";
import knexSession from "connect-session-knex";

import indexRouter from "./routes/index.js";
import authRouter from "./routes/auth.js";
import apiRouter from "./routes/api.js";
import webpackConfig from "../../webpack.config.js";

dotenv.config();

const app = express();

app.set("views", __dirname + "/views");
app.set("view engine", "hbs");

app.use(express.json());
app.use(compression());

const KnexSession = knexSession(session);
const sessionStore = new KnexSession();
const sess = {
  secret: process.env.SESSION_SECRET,
  cookie: {},
  resave: false,
  saveUninitialized: true,
  store: sessionStore
};
if (app.get("env") === "production") {
  sess.cookie.secure = true;
  // app.set('trust proxy', 1);
}
app.use(session(sess));

const strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: process.env.AUTH0_CALLBACK_URL || "http://localhost:3000/callback"
  },
  (accessToken, refreshToken, extraParams, profile, done) => done(null, profile)
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
passport.use(strategy);

app.use(passport.initialize());
app.use(passport.session());

if (app.get("env") === "development") {
  const compiler = webpack(webpackConfig);
  app.use(middleware(compiler, { publicPath: "/" }));
}

app.use("/", indexRouter);
app.use("/", apiRouter);
app.use("/", authRouter);

app.listen(3000);
