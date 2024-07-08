// test/app.test.js
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const mysql = require('mysql2');
const app = require('../app'); // Assuming your app is exported from app.js
const http = require('http');
const request = require('supertest');

describe('Express App', function() {
  let connection;

  before(() => {
    connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root_password',
      database: 'mydatabase'
    });

    sinon.stub(connection, 'query').callsFake((query, callback) => {
      callback(null, [
        { staff_name: 'John Doe', model: 'Model X', serial_number: '12345' }
      ]);
    });

    app.__set__('connection', connection); // Inject the mock connection into your app
  });

  after(() => {
    sinon.restore();
  });

  it('should return a 200 status and HTML content at the root route', function(done) {
    request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', /html/)
      .end(done);
  });

  it('should connect to the database and retrieve data', function(done) {
    request(app)
      .get('/')
      .expect(200)
      .expect(res => {
        expect(res.text).to.include('John Doe');
        expect(res.text).to.include('Model X');
        expect(res.text).to.include('12345');
      })
      .end(done);
  });
});
