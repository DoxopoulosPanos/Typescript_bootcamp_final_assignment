import axios from 'axios';
import { Account, Product } from 'src/interfaces';

describe('GET all accounts', () => {
  it('should return 201', async () => {
    const res = await axios.get('/accounts');

    expect(res.status).toBe(201);
  });
});

describe('create account', () => {
  it('should return 200', async () => {
    const createdAccountResponse = await createAccount("Babis")

    expect(createdAccountResponse.status).toBe(200);
  });
});

describe('create an account and GET accounts and filter if account is there', () => {
  it('should return a message', async () => {
    const createdAccountResponse = await createAccount("Panos")
    const createdAccount = createdAccountResponse.data as Account

    const res = await axios.get('/accounts');

    // expect(res.status).toBe(201);
    const testAccount = (res.data as Account[]).filter((account) => account.id===createdAccount.id)
    expect(testAccount[0].balance).toBe(0);
  });
});


describe('Part 4: Create an account, add deposit and change date (by adding new deposit)', () => {
  it('should return balance 30', async () => {
    const createdAccountResponse = await createAccount("Niels")
    const createdAccount = createdAccountResponse.data as Account

    // deposit 30 euros
    const response2 = await deposit(createdAccount, 30, 0)

    // change date 
    const response3 = await deposit(createdAccount, 10, 1)


    // GET account and verify if deposit took place
    const res = await axios.get('/accounts');

    // expect(res.status).toBe(201);
    const testAccount = (res.data as Account[]).filter((account) => account.id===createdAccount.id)
    expect(testAccount[0].balance).toBe(30);
  });
});

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

