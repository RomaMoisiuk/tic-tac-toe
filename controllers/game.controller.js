import v from 'validator';
import uuidv4 from 'uuid/v4';


export const getAllGames = async (req, res) => {
  try {
    const games = await req.db('games').select('id', 'board', 'status');

    res.json({ games });
  } catch (error) {
    res.status(500)
      .json('Internal Server Error');
  }
};

export const getGameById = async (req, res) => {
  try {
    const { game_id: gameId } = req.params;

    if (!gameId || !v.isUUID(gameId)) {
      res.status(400)
        .send('Bad request. Invalid game id');

      return;
    }

    const [game] = await req
      .db('games')
      .where({ id: gameId })
      .select('id', 'board', 'status');

    if (game) {
      res.json({ game });

      return;
    }

    res.status(404)
      .send('Resource not found');

    return;
  } catch (error) {
    res.status(500)
      .send('Internal Server Error');

    return;
  }
};

export const deleteGameById = async (req, res) => {
  try {
    const { game_id: gameId } = req.params;

    if (!gameId || !v.isUUID(gameId)) {
      res.status(400)
        .send('Bad request. Invalid game id');

      return;
    }

    const [game] = await req.db('games').where({ id: gameId });

    if (game) {
      await req.db('games').where({ id: gameId }).del();

      res.send('Game successfully deleted');

      return;
    }

    res.status(404)
      .send('Resource not found');

    return;
  } catch (error) {
    res.status(500)
      .send('Internal Server Error');

    return;
  }
};

export const createNewGame = async (req, res) => {
  try {
    const { game } = req.body;

    if (!game) {
      res.status(400)
        .json({ reason: 'The game parameter must exist' });

      return;
    }

    if (typeof game !== 'object' || !game.hasOwnProperty('board')) {
      res.status(400)
        .json({ reason: 'The game must be an object with property \'board\'' });

      return;
    }

    const { board } = game;

    if (!v.matches(board, /[XO-]{9}/)) {
      res.status(400)
        .json({ reason: 'Invalid board format' });

      return;
    }

    const userChoice = board.replace(new RegExp(/[-]/, 'g'), '');

    if (userChoice.length !== 1) {
      res.status(400)
        .json({ reason: 'Please make your move' });

      return;
    }

    const boardArr = board.split('');

    const idx = generateMoveIndex([boardArr.indexOf(userChoice)]);
    boardArr[idx] = userChoice === 'X' ? 'O' : 'X';

    const id = await req.db('games').insert({
      id: uuidv4(),
      board: boardArr.join(''),
      status: 'RUNNING',
      // eslint-disable-next-line camelcase
      user_choice: userChoice
    }, 'id');

    const { PORT: port = 3000, HOST: host = 'tic.tac.toe' } = process.env;

    res.status(201)
      .json({ location: `https://${host}:${port}/api/v1/games/${id}` });
  } catch (error) {
    res.status(500)
      .json('Internal Server Error');
  }
};

export const editGame = async (req, res) => {
  try {
    const { game_id: gameId } = req.params;
    const { game } = req.body;

    if (!gameId || !v.isUUID(gameId)) {
      res.status(400)
        .send('Bad request. Invalid game id');

      return;
    }

    if (!game) {
      res.status(400)
        .json({ reason: 'The game parameter must exist' });

      return;
    }

    if (typeof game !== 'object' || !game.hasOwnProperty('board')) {
      res.status(400)
        .json({ reason: 'The game must be an object with property \'board\'' });

      return;
    }

    const { board } = game;

    if (!v.matches(board, /[XO-]{9}/)) {
      res.status(400)
        .json({ reason: 'Invalid board format' });

      return;
    }

    const [gameFromDB] = await req.db('games').where({ id: gameId });

    if (!gameFromDB) {
      res.status(404)
        .send('Resource not found');

      return;
    }

    const { board: oldBoard, user_choice: userChoice } = gameFromDB;

    if (board === oldBoard) {
      res.status(400)
        .json({ reason: 'You did not move' });

      return;
    }

    const gotBoardArr = board.split('');
    const oldBoardArr = oldBoard.split('');
    const countXs = gotBoardArr.filter((val) => val === 'X').length;
    const countOs = gotBoardArr.filter((val) => val === 'O').length;

    const hasRepleacing = gotBoardArr.some((val, idx) => {
      return oldBoardArr[idx] !== '-' && val !== oldBoardArr[idx];
    });

    if (hasRepleacing) {
      res.status(400)
        .json({ reason: 'Unable to replace values' });

      return;
    }

    if (Math.abs(countXs - countOs) > 1) {
      res.status(400)
        .json({ reason: 'Move only once!' });

      return;
    }

    // eslint-disable-next-line no-extra-parens
    if ((userChoice === 'X' && countXs - countOs !== 1) || (userChoice === 'O' && countOs - countXs !== 1)) {
      res.status(400)
        .json({ reason: 'It is not your move!' });

      return;
    }

    let status = getGameStatus(gotBoardArr);

    if (status === 'RUNNING') {
      const indexesOfMovements = [];

      gotBoardArr.forEach((val, idx) => {
        if (val !== '-') {
          indexesOfMovements.push(idx);
        }
      });

      const index = generateMoveIndex(indexesOfMovements);
      gotBoardArr[index] = userChoice === 'X' ? 'O' : 'X';
      status = getGameStatus(gotBoardArr);
    }

    const [latestGame] = await req
      .db('games')
      .where({ id: gameId })
      .update({
        board: gotBoardArr.join(''),
        status
      }, ['id', 'board', 'status']);

    res.status(200)
      .json(latestGame);
  } catch (error) {
    res.status(500)
      .json('Internal Server Error');
  }
};


function getGameStatus(arr) {
  const movementsCount = arr.join('').replace(new RegExp(/[-]/, 'g'), '').length;

  if (movementsCount < 5) {
    return 'RUNNING';
  }

  let xIndexes = '';
  let oIndexes = '';

  arr.forEach((val, idx) => {
    if (val === 'X') {
      xIndexes += idx;
    } else if (val === 'O') {
      oIndexes += idx;
    }
  });

  if (
    xIndexes.includes('012')
    || xIndexes.includes('048')
    || xIndexes.includes('036')
    || xIndexes.includes('147')
    || xIndexes.includes('258')
    || xIndexes.includes('345')
    || xIndexes.includes('678')
    || xIndexes.includes('246')
  ) {
    return 'X_WON';
  }

  if (
    oIndexes.includes('012')
    || oIndexes.includes('048')
    || oIndexes.includes('036')
    || oIndexes.includes('147')
    || oIndexes.includes('258')
    || oIndexes.includes('345')
    || oIndexes.includes('678')
    || oIndexes.includes('246')
  ) {
    return 'O_WON';
  }

  if (arr.length == 9) {
    return 'DRAW';
  }

  return 'RUNNING';
}

function generateMoveIndex(excludes) {
  const num = Math.floor(Math.random() * 10);
  return excludes.includes(num) ? generateMoveIndex(excludes) : num;
}
