process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const { validateLead } = require('../src/validators');

let mongod;
let token;
const lead = { name: 'Jane Doe', email: 'jane@acme.com', phone: '+1 555 123 4567', company: 'Acme', source: 'Website', status: 'New' };
const auth = () => ({ Authorization: `Bearer ${token}` });

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  const res = await request(app).post('/api/auth/signup').send({ name: 'Sam', email: 'sam@x.com', password: 'secret1' });
  token = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

describe('validateLead', () => {
  it('flags missing and malformed fields', () => {
    const { errors } = validateLead({ name: '', email: 'nope', source: 'x', phone: 'abc' });
    expect(Object.keys(errors)).toEqual(expect.arrayContaining(['name', 'email', 'source', 'phone']));
  });
});

describe('auth', () => {
  it('rejects requests without a token', async () => {
    expect((await request(app).get('/api/leads')).status).toBe(401);
  });
  it('rejects bad login', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'sam@x.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });
});

describe('leads CRUD', () => {
  let id;

  it('creates a lead', async () => {
    const res = await request(app).post('/api/leads').set(auth()).send(lead);
    expect(res.status).toBe(201);
    id = res.body._id;
  });

  it('rejects invalid input with field errors', async () => {
    const res = await request(app).post('/api/leads').set(auth()).send({ ...lead, email: 'bad' });
    expect(res.status).toBe(400);
    expect(res.body.errors.email).toBeDefined();
  });

  it('rejects duplicate email for the same user', async () => {
    const res = await request(app).post('/api/leads').set(auth()).send(lead);
    expect(res.status).toBe(409);
  });

  it('lists, searches and filters', async () => {
    let res = await request(app).get('/api/leads?search=jane').set(auth());
    expect(res.body.data).toHaveLength(1);
    res = await request(app).get('/api/leads?status=Lost').set(auth());
    expect(res.body.data).toHaveLength(0);
    res = await request(app).get('/api/leads?status=Bogus').set(auth());
    expect(res.status).toBe(400);
  });

  it('updates status', async () => {
    const res = await request(app).put(`/api/leads/${id}`).set(auth()).send({ ...lead, status: 'Qualified' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Qualified');
  });

  it('returns stats', async () => {
    const res = await request(app).get('/api/leads/stats').set(auth());
    expect(res.body.total).toBe(1);
    expect(res.body.byStatus.Qualified).toBe(1);
  });

  it("hides other users' leads", async () => {
    const other = await request(app).post('/api/auth/signup').send({ name: 'O', email: 'o@x.com', password: 'secret1' });
    const res = await request(app).get(`/api/leads/${id}`).set({ Authorization: `Bearer ${other.body.token}` });
    expect(res.status).toBe(404);
  });

  it('returns 400 for a malformed id and 404 after delete', async () => {
    expect((await request(app).get('/api/leads/123').set(auth())).status).toBe(400);
    expect((await request(app).delete(`/api/leads/${id}`).set(auth())).status).toBe(200);
    expect((await request(app).get(`/api/leads/${id}`).set(auth())).status).toBe(404);
  });
});
