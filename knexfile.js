// Update with your config settings.
require("@babel/register")();

module.exports = {

  development: {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      user: 'roman',
      password: '',
      database: 'tic_tac_toe',
      charset: 'utf8'
    },
    migrations: {
      directory: './db/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './db/seeds'
    }
  },

  test: {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      user: 'roman',
      password: '',
      database: 'tic_tac_toe_test',
      charset: 'utf8'
    },
    migrations: {
      directory: './db/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './db/seeds'
    }
  }
};
