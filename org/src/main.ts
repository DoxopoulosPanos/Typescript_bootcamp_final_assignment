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
const productHistory: ProductHistory[] = [];
let dayDeposits: DayDeposit[] = [];
let simulatedDay = 0;

app.use('*', (req, res, next) => {
  if (parseInt(req.headers['simulated-day'] as string, 10) > simulatedDay) {
    const productsCopy = JSON.parse(JSON.stringify(products));
    productHistory.push({ simulationDay: simulatedDay, products: productsCopy });
    // console.log('new product History: ');
    // console.log(util.inspect(productHistory, { showHidden: false, depth: null, colors: true }));

    // NEW DAY
    simulatedDay += 1;
    console.log('simulated day is: ', simulatedDay);
    // push all deposits to accounts
    for (let i = 0; i < dayDeposits.length; i += 1) {
      for (let j = 0; j < accounts.length; j += 1) { // TODO: use filter
        if (accounts[j].id === dayDeposits[i].accountId) {
          accounts[j].balance += dayDeposits[i].deposit;
          console.log('new account balance is: ', accounts[j].balance);
        }
      }
    }
    dayDeposits = []; // clear array
  }
  next();
});

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.post('/accounts', (req, res) => {
  console.log('account creation');
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
  console.log('request for deposits');

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
  if ((Object.keys(req.body).length > 1) || (req.body.productId == null)) {
    // Invalid input
    return res.status(400).send();
  }
  const requestedProduct = req.body.productId;

  try {
    console.log('requestedProduct', requestedProduct);
    const product = products.filter((singleProduct) => singleProduct.id === requestedProduct)[0];
    const account = accounts.filter(
      (singleAccount) => singleAccount.id === req.params.accountId,
    )[0];

    // Invalid input (product not found)
    if (product === null) {
      return res.status(400).send();
    }
    // not enough stock
    if (product.stock <= 0) {
      return res.status(409).send();
    }
    // Not enough funds
    if (account.balance < product.price) {
      return res.status(409).send();
    }
    // Illegal simulation day
    if (parseInt(req.headers['simulated-day'] as string, 10) < simulatedDay) {
      return res.status(400).send();
    }

    // proceed with purchase
    product.stock -= 1;
    account.balance -= product.price;

    return res.status(201).send();
  } catch {
    // ideally this should be 5xx
    return res.status(404).send();
  }
});

app.post('/products', (req, res) => {
  console.log('adding new product...');

  if ((Object.keys(req.body).length !== 4)
    || (req.body.title == null)
    || (req.body.description == null)
    || (req.body.price == null)
    || (req.body.stock == null)) {
    // Invalid input
    return res.status(400).send();
  }

  try {
    const product: Product = {
      id: uuidv4(),
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
    };

    products.push(product);
    return res.status(201).send(product);
  } catch {
    return res.status(400).send();
  }
});

app.get('/products', (req, res) => {
  try {
    const dayToFetchData = parseInt(req.headers['simulated-day'] as string, 10);
    let requestedProducts = products; // if current dayrequested
    if (dayToFetchData < simulatedDay) {
      requestedProducts = productHistory.filter(
        (productsByDay) => productsByDay.simulationDay === dayToFetchData,
      )[0].products;
    }
    return res.status(201).send(requestedProducts);
  } catch {
    // in case of any error: internal server error
    return res.status(500).send({});
  }
});

app.get('/products/:productsId', (req, res) => {
  try {
    const requestedProduct = req.params.productsId;

    const dayToFetchData = parseInt(req.headers['simulated-day'] as string, 10);
    let productsToSearch = products; // if current dayrequested
    if (dayToFetchData < simulatedDay) {
      productsToSearch = productHistory.filter(
        (productsByDay) => productsByDay.simulationDay === dayToFetchData,
      )[0].products;
    }

    const product = productsToSearch.filter(
      (singleProduct) => singleProduct.id === requestedProduct,
    );
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
