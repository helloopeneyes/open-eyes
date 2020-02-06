exports.up = function(knex) {
  return knex.schema.createTable("users", table => {
    table.increments();
    table.timestamps(false, true);
    table
      .string("identifier", 64)
      .unique()
      .notNullable();
  });
};

exports.down = function() {};
