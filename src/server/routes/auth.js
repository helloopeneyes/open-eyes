import express from "express";
import passport from "passport";
import dotenv from "dotenv";
import url from "url";
import querystring from "querystring";

dotenv.config();

const router = express.Router();
export default router;

router.get("/login", passport.authenticate("auth0", { scope: "openid email" }), (req, res) => {
  res.redirect("/");
});

router.get("/callback", (req, res, next) => {
  passport.authenticate("auth0", (err, user) => {
    if (err) return next(err);
    if (!user) return res.redirect("/");

    req.logIn(user, err => {
      if (err) return next(err);

      const returnTo = req.session.returnTo;
      delete req.session.returnTo;
      res.redirect(returnTo || "/");
    });
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout();

  let returnTo = req.protocol + "://" + req.hostname;
  const port = req.connection.localPort;
  if (port !== undefined && port !== 80 && port !== 443) {
    returnTo += ":" + port;
  }
  const logoutURL = new url.URL(`https://${process.env.AUTH0_DOMAIN}/v2/logout`);
  const searchString = querystring.stringify({
    client_id: process.env.AUTH0_CLIENT_ID,
    returnTo
  });
  logoutURL.search = searchString;

  res.redirect(logoutURL);
});
