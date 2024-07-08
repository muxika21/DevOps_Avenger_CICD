// test/app.test.js
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const app = require('../app'); // Assuming your app is exported from app.js
const mysql = require('mysql2-mock'); // Use the mock database

chai.use(chaiHttp);

describe('Express App', function() {
  let connection;

  before(() => {
    connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root_password',
      database: 'mydatabase'
    });

    app.__set__('connection', connection); // Inject the mock connection into your app
  });

  it('should return a 200 status and HTML content at the root route', function(done) {
    chai.request(app)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.html;
        done();
      });
  });

  it('should connect to the database and retrieve data', function(done) {
    // Mock the database query
    connection.query = (query, callback) => {
      callback(null, [
        { staff_name: 'John Doe', model: 'Model X', serial_number: '12345' }
      ]);
    };

    chai.request(app)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.include('John Doe');
        expect(res.text).to.include('Model X');
        expect(res.text).to.include('12345');
        done();
      });
  });
});
