module.exports = {
  client: "sqlite3",
  connection: { filename: process.env.DB || __dirname + "/open-eyes.db" },
  migrations: { directory: __dirname + "/migrations" },
  useNullAsDefault: true
};
