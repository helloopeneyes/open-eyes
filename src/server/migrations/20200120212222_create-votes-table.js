exports.up = function(knex) {
  return knex.schema.createTable("votes", table => {
    table.increments();
    table.timestamps();
    table
      .string("item", 64)
      .notNullable()
      .index();
  });
};

exports.down = function() {};
