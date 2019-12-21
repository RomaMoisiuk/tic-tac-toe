import { Router as expressRouter } from 'express';

import {
  getAllGames,
  getGameById,
  deleteGameById,
  createNewGame,
  editGame
} from '../controllers/game.controller';

const router = expressRouter();

router.get('/games', getAllGames);

router.post('/games', createNewGame);

router.get('/games/:game_id', getGameById);

router.put('/games/:game_id', editGame);

router.delete('/games/:game_id', deleteGameById);

export default router;
