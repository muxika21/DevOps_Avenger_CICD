import { expect } from 'chai';
import request from 'supertest';
import app from '../src/index.js'; // Ensure your app exports the Express app

describe('Shopping Cart Application Tests', () => {
  it('should return Hello World for the root route', (done) => {
    request(app)
      .get('/')
      .expect('Content-Type', /text\/html/)
      .expect(200)
      .expect('<h1> Hello World </h1>', done);
  });

  // Add more tests here
});
