import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import bodyParser from 'body-parser';
import {
  Account, DayDeposit, Product, ProductHistory,
} from './interfaces';
import initialProducts from './initialProducts';

const host = process.env.HOST ?? 'localhost';
const port = (process.env.PORT != null) ? Number(process.env.PORT) : 3000;

const app = express();
const accounts: Account[] = [];
const products: Product[] = initialProducts.initialProducts;
const productHistory: ProductHistory[] = [{ simulationDay: 0, products }];
let dayDeposits: DayDeposit[] = [];
let simulatedDay = 0;

app.use('*', (req, res, next) => {
  console.log(req.headers);
  if (parseInt(req.headers['simulated-day'] as string, 10) > simulatedDay) {
    // push products in History at the end of the day
    productHistory.push({ simulationDay: 0, products });

    // NEW DAY
    simulatedDay += 1;
    // push all deposits to accounts
    for (let i = 0; i < dayDeposits.length; i += 1) {
      for (let j = 0; j < accounts.length; j += 1) { // TODO: use filter
        if (accounts[j].id === dayDeposits[i].accountId) {
          accounts[j].balance += dayDeposits[i].deposit;
        }
      }
    }
    dayDeposits = []; // clear array
  } else if (parseInt(req.headers['simulated-day'] as string, 10) === simulatedDay) {
    // return res.status(400).send("simulated-day is smaller than the server's day");
  }
  next();
});

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.post('/accounts', (req, res) => {
  if ((Object.keys(req.body).length > 1) || (req.body.name == null)) {
    return res.status(400).send();
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
    return res.status(400).send();
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

// PART B
app.post('/accounts/:accountId/deposits', (req, res) => {
  console.log(req.headers['simulated-day']);
  const depositedAmount: number = parseInt(req.body.amount, 10); // check if number can be float
  if (depositedAmount <= 0) {
    return res.status(400).send();
  }
  try {
    const account = accounts.filter((singleAccount) => singleAccount.id === req.params.accountId);
    if (account.length === 0) {
      return res.status(400).send();
    }

    const newDeposit: DayDeposit = {
      id: uuidv4(),
      accountId: account[0].id,
      deposit: depositedAmount,
    };

    dayDeposits.push(newDeposit);

    // accountWithDeposits.todayDeposits += depositedAmount;
    const responseBody = {
      id: newDeposit.id,
      name: account[0].name,
      balance: account[0].balance,
    };

    return res.status(201).send(responseBody);
  } catch {
    // ideally this should be 5xx
    return res.status(404).send();
  }
});

app.post('/accounts/:accountId/purchases', (req, res) => {
  console.log('purchases request');
  console.log(req.headers);
  const requestedProduct = req.body.productId;

  try {
    const product = products.filter((singleProduct) => singleProduct.id === requestedProduct)[0];

    // Invalid input (product not found)
    if (product === null) {
      return res.status(400).send();
    }
    // not enough stock
    if (product.stock <= 0) {
      return res.status(409).send();
    }
    // Not enough funds
    if (product.price <= 0) {
      return res.status(409).send();
    }
    // Illegal simulation day
    if (parseInt(req.headers['simulated-day'] as string, 10) <= simulatedDay) {
      return res.status(400).send();
    }

    // proceed with purchase
    product.stock -= 1;

    return res.status(200).send();
  } catch {
    // ideally this should be 5xx
    return res.status(404).send();
  }
});

app.post('/products', (req, res) => {
  console.log('adding new product...');
  console.log(req.headers);

  try {
    const product: Product = {
      id: uuidv4(),
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
    };

    products.push(product);
    return res.status(200).send(product);
  } catch {
    return res.status(400).send();
  }
});

app.get('/products', (req, res) => {
  try {
    const dayToFetchData = parseInt(req.headers['simulated-day'] as string, 10);
    const data = productHistory.filter(
      (productsByDay) => productsByDay.simulationDay === dayToFetchData,
    );
    return res.status(201).send(data[0].products);
  } catch {
    // in case of any error: internal server error
    return res.status(500).send({});
  }
});

app.get('/products/:productsId', (req, res) => {
  try {
    const requestedProduct = req.params.productsId;
    const product = products.filter((singleProduct) => singleProduct.id === requestedProduct);
    if (product.length === 0) {
      return res.status(404).send();
    }
    return res.send(product[0]);
  } catch {
    // ideally this should be 5xx
    return res.status(404).send();
  }
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
