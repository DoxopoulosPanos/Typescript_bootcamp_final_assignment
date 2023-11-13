import axios from 'axios';

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
