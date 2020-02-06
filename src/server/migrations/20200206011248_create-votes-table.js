exports.up = function(knex) {
  return knex.schema.createTable("votes", table => {
    table.increments();
    table.timestamps(false, true);
    table.string("item", 64).notNullable();
    table.boolean("upvote").notNullable();
    table
      .integer("user_id")
      .references("id")
      .inTable("users")
      .notNullable();

    table.index(["item", "upvote"]);
    table.unique(["item", "user_id"]);
  });
};

exports.down = function() {};
