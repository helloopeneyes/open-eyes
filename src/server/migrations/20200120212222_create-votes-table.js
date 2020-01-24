exports.up = function(knex) {
  return knex.schema.createTable("votes", table => {
    table.increments();
    table.timestamps();
    table.string("item", 64).notNullable();
    table.boolean("upvote").notNullable();
    table.index(["item", "upvote"]);
  });
};

exports.down = function() {};
