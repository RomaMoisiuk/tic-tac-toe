
import request from 'supertest';
import { expect } from 'chai';
import Knex from 'knex';
import uuidv4 from 'uuid/v4';

import app from '../../app';
import knexConfig from '../../knexfile';
// import startServer, { localGet, localPost, localPut, localDelete } from '../server';


const knex = Knex(knexConfig.test);

describe('controllers/game', () => {
  afterEach(async () => {
    await knex('games').delete();
  });

  describe('getAllGames', () => {
    it('return all games', async () => {
      const gamesToInsert = [
        {
          id: uuidv4(),
          board: '--X--O-XO',
          status: 'RUNNING',
          user_choice: 'O'
        },
        {
          id: uuidv4(),
          board: 'XXX-O-O-O',
          status: 'X_WON',
          user_choice: 'X'
        }
      ];

      await knex('games').insert(gamesToInsert);

      return request(app)
        .get('/api/v1/games')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, {
          games: [
            {
              id: gamesToInsert[0].id,
              board: gamesToInsert[0].board,
              status: gamesToInsert[0].status
            },
            {
              id: gamesToInsert[1].id,
              board: gamesToInsert[1].board,
              status: gamesToInsert[1].status
            }
          ]
        });
    });
  });

  describe('getGameById', () => {
    it('return single game', async () => {
      const id = uuidv4();
      const gamesToInsert = [
        {
          id,
          board: '--X--O-XO',
          status: 'RUNNING',
          user_choice: 'O'
        },
        {
          id: uuidv4(),
          board: 'XXX-O-O-O',
          status: 'X_WON',
          user_choice: 'X'
        }
      ];

      await knex('games').insert(gamesToInsert);

      return request(app)
        .get(`/api/v1/games/${id}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, {
          game: {
            id: gamesToInsert[0].id,
            board: gamesToInsert[0].board,
            status: gamesToInsert[0].status
          }
        });
    });

    it('return 404', async () => {
      const id = uuidv4();
      const gamesToInsert = [
        {
          id,
          board: '--X--O-XO',
          status: 'RUNNING',
          user_choice: 'O'
        },
        {
          id: uuidv4(),
          board: 'XXX-O-O-O',
          status: 'X_WON',
          user_choice: 'X'
        }
      ];

      await knex('games').insert(gamesToInsert);

      return request(app)
        .get('/api/v1/games/17d270d6-ed7e-4713-abb8-20322f24427d')
        .set('Accept', 'application/json')
        .expect(404);
    });

    it('return 400 on invalid id', async () => {
      const id = uuidv4();
      const gamesToInsert = [
        {
          id,
          board: '--X--O-XO',
          status: 'RUNNING',
          user_choice: 'O'
        },
        {
          id: uuidv4(),
          board: 'XXX-O-O-O',
          status: 'X_WON',
          user_choice: 'X'
        }
      ];

      await knex('games').insert(gamesToInsert);

      return request(app)
        .get('/api/v1/games/123')
        .set('Accept', 'application/json')
        .expect(400);
    });
  });

  describe('deleteGame', () => {
    it('delete game by id', async () => {
      const id = uuidv4();
      const gamesToInsert = [
        {
          id,
          board: '--X--O-XO',
          status: 'RUNNING',
          user_choice: 'O'
        },
        {
          id: uuidv4(),
          board: 'XXX-O-O-O',
          status: 'X_WON',
          user_choice: 'X'
        }
      ];

      await knex('games').insert(gamesToInsert);

      await request(app)
        .delete(`/api/v1/games/${id}`)
        .set('Accept', 'application/json')
        .expect(200);

      const games = await knex('games').where({ id });

      expect(games.length).to.eql(0);
    });

    it('return 404', async () => {
      const id = uuidv4();
      const gamesToInsert = [
        {
          id,
          board: '--X--O-XO',
          status: 'RUNNING',
          user_choice: 'O'
        },
        {
          id: uuidv4(),
          board: 'XXX-O-O-O',
          status: 'X_WON',
          user_choice: 'X'
        }
      ];

      await knex('games').insert(gamesToInsert);

      return request(app)
        .delete('/api/v1/games/17d270d6-ed7e-4713-abb8-20322f24427d')
        .set('Accept', 'application/json')
        .expect(404);
    });

    it('return 400', async () => {
      const id = uuidv4();
      const gamesToInsert = [
        {
          id,
          board: '--X--O-XO',
          status: 'RUNNING',
          user_choice: 'O'
        },
        {
          id: uuidv4(),
          board: 'XXX-O-O-O',
          status: 'X_WON',
          user_choice: 'X'
        }
      ];

      await knex('games').insert(gamesToInsert);

      return request(app)
        .delete('/api/v1/games/17')
        .set('Accept', 'application/json')
        .expect(400);
    });
  });

  describe('createNewGame', () => {
    it('create and return new game', async () => {
      const res = await request(app)
        .post('/api/v1/games')
        .send({ game: { board: '-X-------' }})
        .set('Accept', 'application/json')
        .expect(201);

      expect(res.body).to.have.key('location');
    });

    it('return 400 without game parameter', async () => {
      return request(app)
        .post('/api/v1/games')
        .set('Accept', 'application/json')
        .expect(400, {
          reason: 'The game parameter must exist'
        });
    });

    it('return 400 without board parameter', async () => {
      return request(app)
        .post('/api/v1/games')
        .send({ game: {}})
        .set('Accept', 'application/json')
        .expect(400, {
          reason: 'The game must be an object with property \'board\''
        });
    });

    it('return 400 with invalid board format', async () => {
      return request(app)
        .post('/api/v1/games')
        .send({ game: { board: '-' }})
        .set('Accept', 'application/json')
        .expect(400, {
          reason: 'Invalid board format'
        });
    });

    it('return 400 when user does not make a move', async () => {
      return request(app)
        .post('/api/v1/games')
        .send({ game: { board: '---------' }})
        .set('Accept', 'application/json')
        .expect(400, {
          reason: 'Please make your move'
        });
    });
  });

  describe('editGame', () => {
    it('successfully make a move', async () => {
      const id = uuidv4();
      const gameToInsert = {
        id,
        board: '-------XO',
        status: 'RUNNING',
        user_choice: 'O'
      };

      await knex('games').insert(gameToInsert);

      const res = await request(app)
        .put(`/api/v1/games/${id}`)
        .send({ game: { board: '-O-----XO' }})
        .set('Accept', 'application/json')
        .expect(200);

      expect(res.body).to.have.all.keys('id', 'board', 'status');
      expect(res.body).to.not.have.key('user_choice');
    });

    it('makes X win', async () => {
      const id = uuidv4();
      const gameToInsert = {
        id,
        board: 'XX--O-OXO',
        status: 'RUNNING',
        user_choice: 'X'
      };

      await knex('games').insert(gameToInsert);

      const res = await request(app)
        .put(`/api/v1/games/${id}`)
        .send({ game: { board: 'XXX-O-OXO' }})
        .set('Accept', 'application/json')
        .expect(200);

      expect(res.body).to.have.all.keys('id', 'board', 'status');
      expect(res.body).to.not.have.key('user_choice');
      expect(res.body.status).to.equal('X_WON');
    });

    it('makes DRAW win', async () => {
      const id = uuidv4();
      const gameToInsert = {
        id,
        board: 'OO-XOXX--',
        status: 'RUNNING',
        user_choice: 'X'
      };

      await knex('games').insert(gameToInsert);

      const res = await request(app)
        .put(`/api/v1/games/${id}`)
        .send({ game: { board: 'OO-XOXX-X' }})
        .set('Accept', 'application/json')
        .expect(200);

      expect(res.body).to.have.all.keys('id', 'board', 'status');
      expect(res.body).to.not.have.key('user_choice');
      expect(res.body.status).to.equal('DRAW');
    });

    it('return 400 when invalid id format', async () => {
      return request(app)
        .put(`/api/v1/games/123`)
        .set('Accept', 'application/json')
        .expect(400);
    });

    it('return 400 without game parameter', async () => {
      const id = uuidv4();
      const gameToInsert = {
        id,
        board: '-------XO',
        status: 'RUNNING',
        user_choice: 'O'
      };

      await knex('games').insert(gameToInsert);

      return request(app)
        .put(`/api/v1/games/${id}`)
        .set('Accept', 'application/json')
        .expect(400, {
          reason: 'The game parameter must exist'
        });
    });

    it('return 400 without board parameter', async () => {
      const id = uuidv4();
      const gameToInsert = {
        id,
        board: '-------XO',
        status: 'RUNNING',
        user_choice: 'O'
      };

      await knex('games').insert(gameToInsert);

      return request(app)
        .put(`/api/v1/games/${id}`)
        .send({ game: {}})
        .set('Accept', 'application/json')
        .expect(400, {
          reason: 'The game must be an object with property \'board\''
        });
    });

    it('return 400 with invalid board format', async () => {
      const id = uuidv4();
      const gameToInsert = {
        id,
        board: '-------XO',
        status: 'RUNNING',
        user_choice: 'O'
      };

      await knex('games').insert(gameToInsert);

      return request(app)
        .put(`/api/v1/games/${id}`)
        .send({ game: { board: '-' }})
        .set('Accept', 'application/json')
        .expect(400, {
          reason: 'Invalid board format'
        });
    });

    it('return 400 when user did not make a move', async () => {
      const id = uuidv4();
      const gameToInsert = {
        id,
        board: '-------XO',
        status: 'RUNNING',
        user_choice: 'O'
      };

      await knex('games').insert(gameToInsert);

      return request(app)
        .put(`/api/v1/games/${id}`)
        .send({ game: { board: '-------XO' }})
        .set('Accept', 'application/json')
        .expect(400, {
          reason: 'You did not move'
        });
    });

    it('return 400 when trying to replace move', async () => {
      const id = uuidv4();
      const gameToInsert = {
        id,
        board: '-------XO',
        status: 'RUNNING',
        user_choice: 'O'
      };

      await knex('games').insert(gameToInsert);

      return request(app)
        .put(`/api/v1/games/${id}`)
        .send({ game: { board: '-------OO' }})
        .set('Accept', 'application/json')
        .expect(400, {
          reason: 'Unable to replace values'
        });
    });

    it('return 400 when trying ot make multiple moves', async () => {
      const id = uuidv4();
      const gameToInsert = {
        id,
        board: '-------XO',
        status: 'RUNNING',
        user_choice: 'O'
      };

      await knex('games').insert(gameToInsert);

      return request(app)
        .put(`/api/v1/games/${id}`)
        .send({ game: { board: '---X---XO' }})
        .set('Accept', 'application/json')
        .expect(400, {
          reason: 'It is not your move!'
        });
    });

    it('return 404', async () => {
      return request(app)
        .put('/api/v1/games/17d270d6-ed7e-4713-abb8-20322f24427d')
        .send({ game: { board: '---------' }})
        .set('Accept', 'application/json')
        .expect(404);
    });
  });
});
