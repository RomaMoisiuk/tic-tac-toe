exports.up = function (knex) {
  return knex.schema.createTable('games', (table) => {
    table.uuid('id').notNullable();
    table.string('board').notNullable();
    table.enu(
      'status',
      ['RUNNING', 'X_WON', 'O_WON', 'DRAW'],
      { useNative: true, enumName: 'games_status_type' }
    ).notNullable();
    table.enu(
      'user_choice',
      ['X', 'O'],
      { useNative: true, enumName: 'games_user_choice_type' }
    ).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('games')
    .raw('DROP TYPE "games_status_type"')
    .raw('DROP TYPE "games_user_choice_type"');
};
