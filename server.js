import fs from 'fs';
import https from 'https';

import app from './app';


const { PORT: port = 3000, HOST: host = 'tic.tac.toe' } = process.env;

https.createServer({
  key: fs.readFileSync('tic.tac.toe-key.pem', 'utf8').toString(),
  cert: fs.readFileSync('tic.tac.toe.pem', 'utf8').toString()
}, app)
  .listen(port, host, () => {
    process.stdout.write(`Listening on: https://${host}:${port}/\n`);
  });
