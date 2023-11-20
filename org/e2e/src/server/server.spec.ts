import axios, { AxiosError } from 'axios';
import { Account, Product } from 'src/interfaces';

const testSimulatedDay = 0  // not needed, it is used for readability

async function createAccount(name: string) {
  const data = JSON.stringify({ name: name });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'http://localhost:3000/accounts',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  };

  const response = await axios.request(config);
  return response;
}

async function deposit(account: Account, amountToDeposit: number, simulatedDay: number) {
  const requestURL = `http://localhost:3000/accounts/${account.id}/deposits`;
  const data = JSON.stringify({ amount: amountToDeposit });
  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: requestURL,
    headers: {
      'Simulated-Day': simulatedDay,
      'Content-Type': 'application/json',
    },
    data,
  };
  return await axios.request(config);
}

async function purchaseProduct(account: Account, productId: string, simulatedDay: number) {
  const requestURL = `http://localhost:3000/accounts/${account.id}/purchases`;
  const data = JSON.stringify({ productId: productId });
  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: requestURL,
    headers: {
      'Simulated-Day': simulatedDay,
      'Content-Type': 'application/json',
    },
    data,
  };
  return await axios.request(config);
}

async function getProducts(simulatedDay: number) {
  const requestURL = `http://localhost:3000/products`;
  //const data = JSON.stringify({ productId: productId });
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: requestURL,
    headers: {
      'Simulated-Day': simulatedDay,
      'Content-Type': 'application/json',
    }
  };
  return await axios.request(config);
}

async function getAccountByID(accountId: string) {
  const requestURL = `http://localhost:3000/accounts/${accountId}`;
  // const data = JSON.stringify({ productId: productId });
  const config = {
    method: 'get',
    url: requestURL,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  return await axios.request(config);
}

async function getOneProduct(productId: string, simulatedDay: number) {
  const requestURL = `http://localhost:3000/products/${productId}`;
  //const data = JSON.stringify({ productId: productId });
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: requestURL,
    headers: {
      'Simulated-Day': simulatedDay,
      'Content-Type': 'application/json',
    }
  };
  return await axios.request(config);
}

async function addProduct(title: string, description: string, price: number, stock: number) {
  const requestURL = `http://localhost:3000/products`;
  const data = JSON.stringify({title, description, price, stock });
  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: requestURL,
    headers: {
      'Content-Type': 'application/json',
    },
    data
  };
  return await axios.request(config);
}


describe('PART 1: create account', () => {
  it('should return 200', async () => {

    const createdAccountResponse = await createAccount("Babis")

    expect(createdAccountResponse.status).toBe(200);
  });
});

describe('PART 1: Invalid Input: create account', () => {
  it('should return 400', async () => {
    const data = JSON.stringify({ test: "Panos" });


    try {
      const config = {
        method: 'post',
        url: 'http://localhost:3000/accounts',
        headers: {
          'Content-Type': 'application/json',
        },
        data,
      };
  
      const response = await axios.request(config);
      console.log(response);
      expect(response?.status).toBe(400);  // if reaches here then test should fail
    } catch (error) {
      const axiosError = error as AxiosError;

      // catch 400 error
      expect(axiosError.response?.status).toBe(400);  // successful test
    }
  });
});

describe('PART 2: GET all accounts', () => {
  it('should return 201', async () => {
    const res = await axios.get('/accounts');

    expect(res.status).toBe(201);
    expect(res.data).toBeInstanceOf(Array);
  });
});

describe('PART 1&2&3: create an account and GET accounts and filter if account is there', () => {
  it('should return a message', async () => {
    // PART 1
    const createdAccountResponse = await createAccount("Panos")
    const createdAccount = createdAccountResponse.data as Account
    const res = await axios.get('/accounts');

    // PART 2
    const testAccountPart2 = (res.data as Account[]).filter((account) => account.id===createdAccount.id)
    expect(testAccountPart2[0].name).toBe("Panos");

    const testAccountPart3 = await getAccountByID(createdAccount.id)
    expect(await testAccountPart3.data.name).toBe("Panos");
  });
});


describe('Part 4: Create an account, add deposit and change date (by adding new deposit)', () => {
  it('should return balance 30', async () => {
    const createdAccountResponse = await createAccount("Niels")
    const createdAccount = createdAccountResponse.data as Account

    // deposit 30 euros
    const response2 = await deposit(createdAccount, 30, testSimulatedDay)

    // change date 
    const response3 = await deposit(createdAccount, 10, testSimulatedDay + 1)


    // GET account and verify if deposit took place
    const res = await axios.get('/accounts');

    // expect(res.status).toBe(201);
    const testAccount = (res.data as Account[]).filter((account) => account.id===createdAccount.id)
    expect(testAccount[0].balance).toBe(30);
  });
});


describe('PART 5 and PART 7: create an account and purchase a product', () => {
  it('should return 201, account should have reduced funds and product should be reduced by one', async () => {
    const createdAccountResponse = await createAccount("testPart5User")
    const createdAccount = createdAccountResponse.data as Account

    // deposit money to account
    const depositResponse = await deposit(createdAccount, 11000, testSimulatedDay + 1)  //day 1

    //purchase a product the next day
    const purchaseResponse = await purchaseProduct(createdAccount, 'heatpump', testSimulatedDay + 2)


    expect(purchaseResponse.status).toBe(201);

    // check account balance
    const accountRes = await axios.get('/accounts');
    const testAccount = (accountRes.data as Account[]).filter((account) => account.id===createdAccount.id)
    expect(testAccount[0].balance).toBe(6000);  // balance - heatpumpCost = 11000 - 5000 = 6000

    // check remaining products
    const productRes = await getProducts(testSimulatedDay + 2)
    const heatpump = (productRes.data as Product[]).filter((product) => product.id==='heatpump')
    expect(heatpump[0].stock).toBe(2);  // heatpumpStock - 1 = 3-1 = 2

    // check previous day product count
    const previousProductRes = await getProducts(testSimulatedDay + 0)
    const preiousHeatpump = (previousProductRes.data as Product[]).filter((product) => product.id==='heatpump')
    expect(preiousHeatpump[0].stock).toBe(3);  // initial heatpumpStock = 3
  });
});

describe('PART 6 and PART 8: add new product and get the product details', () => {
  it('new product should be added', async () => {

    //add new product
    const newProductRes = await addProduct('Solar System', 'some nice description', 1000, 5)


    expect(newProductRes.status).toBe(201);

    // check new product
    const newProduct = newProductRes.data as Product;
    const myLatestProductRes = await getOneProduct(newProduct.id, testSimulatedDay + 2)
    const myLatestProduct = myLatestProductRes.data as Product;
    expect(myLatestProduct.title).toBe('Solar System'); 

    // check new product 2nd way
    const productRes = await getProducts(testSimulatedDay + 2)
    const solarSystem = (productRes.data as Product[]).filter((product) => product.id===newProduct.id)
    expect(solarSystem[0].title).toBe('Solar System');
  });
});
