import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import bodyParser from 'body-parser';
import { Account } from './interfaces';

const host = process.env.HOST ?? 'localhost';
const port = (process.env.PORT != null) ? Number(process.env.PORT) : 3000;

const app = express();
const accounts: Account[] = [];

app.use('*', (req, res, next) => {
  console.log(req.headers);
  next();
});

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.post('/accounts', (req, res) => {
  if ((Object.keys(req.body).length > 1) || (req.body.name == null)) {
    return res.status(400).send({});
  }
  try {
    console.log(req.body);
    const newAccount: Account = {
      id: uuidv4(),
      name: req.body.name,
      balance: 0,
    };

    accounts.push(newAccount);
    return res.send(newAccount);
  } catch {
    // ideally this should be 5xx
    return res.status(400).send({});
  }
});

app.get('/accounts', (req, res) => {
  try {
    return res.status(201).send(accounts);
  } catch {
    // in case of any error: internal server error
    return res.status(500).send({});
  }
});

app.get('/accounts/:accountId', (req, res) => {
  try {
    const account = accounts.filter((singleAccount) => singleAccount.id === req.params.accountId);
    if (account.length === 0) {
      return res.status(404).send();
    }
    return res.send(account[0]);
  } catch {
    // ideally this should be 5xx
    return res.status(404).send();
  }
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
