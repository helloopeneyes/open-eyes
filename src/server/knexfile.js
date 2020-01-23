module.exports = {
  client: "sqlite3",
  connection: { filename: __dirname + "/open-eyes.db" },
  migrations: { directory: __dirname + "/migrations" },
  useNullAsDefault: true
};
