import axios from 'axios';
import { Account, Product } from 'src/interfaces';

describe('GET /', () => {
  it('should return a message', async () => {
    const res = await axios.get(`/`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Hello API' });
  });
});

describe('GET /accounts', () => {
  it('should return a message', async () => {
    const res = await axios.get('/accounts');

    expect(res.status).toBe(201);
  });
});

describe('POST /accounts', () => {
  it('should return a message', async () => {
    const data = JSON.stringify({ name: 'Babis' });

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

    expect(response.status).toBe(200);
  });
});

describe('POST an account and GET accounts and filter', () => {
  it('should return a message', async () => {
    const data = JSON.stringify({ name: 'Panos' });

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
    const postedAccount = response.data as Account;

    const res = await axios.get('/accounts');

    // expect(res.status).toBe(201);
    const testAccount = (res.data as Account[]).filter((account) => account.id===postedAccount.id)
    expect(testAccount[0].balance).toBe(0);
  });
});


describe('POST an account and POST a deposit GET accounts and filter', () => {
  it('should return balance 15', async () => {
    const data = JSON.stringify({ name: 'testName' });

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
    const postedAccount = response.data as Account;

    // deposit 15 euros
    const newdata = JSON.stringify({ amount: 15 });
    const requestURL = `http://localhost:3000/accounts/${postedAccount.id}/deposits`;
    console.log(requestURL);

    const newConfig = {
      method: 'post',
      maxBodyLength: Infinity,
      url: requestURL,
      headers: {
        'Content-Type': 'application/json',
      },
      data: newdata,
    };

    const newRes = await axios.request(newConfig);


    // GET account and verify if deposit took place
    const res = await axios.get('/accounts');

    // expect(res.status).toBe(201);
    const testAccount = (res.data as Account[]).filter((account) => account.id===postedAccount.id)
    expect(testAccount[0].balance).toBe(15);
  });
});


