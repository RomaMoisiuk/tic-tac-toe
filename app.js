import 'dotenv/config';
import express from 'express';
import Knex from 'knex';
import bodyParser from 'body-parser';
import cors from 'cors';

import knexConfig from './knexfile';
import v1 from './routes/v1';


const app = express();
const environment = process.env.MOCHA_ENV || 'development';
const knex = Knex(knexConfig[environment]);

(async function checkDBConnection() {
  await knex.raw('select 1+1 as result');
})();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  req.db = knex;

  next();
});

// CORS
app.use(cors());

// routes
app.use('/api/v1', v1);

app.use('/', (req, res) => {
  res.statusCode = 200;//send the appropriate status code

  res.send('Tic Tac Toe');
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  process.stderr.write(err.message);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
