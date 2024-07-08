import chai from 'chai';
import request from 'supertest';
import app from '../src/index.js';  // Import the app object

const { expect } = chai;

describe('GET /', () => {
  it('should return a 200 status code and "Hello World" message', (done) => {
    request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect('<h1> Hello World </h1>', done);
  });
});
