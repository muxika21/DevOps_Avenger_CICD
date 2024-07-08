import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app.js'; // Import your app or server instance
import sinon from 'sinon';
import mysql from 'mysql2';

const { expect } = chai;
chai.use(chaiHttp);

describe('API and Database Tests', function() {
  let connection;

  before(() => {
    connection = sinon.stub(mysql, 'createConnection').returns({
      query: sinon.stub().yields(null, []),  // Mock a successful query
      end: sinon.stub()
    });
  });

  after(() => {
    sinon.restore();
  });

  it('should return a 200 status for the / endpoint', function(done) {
    chai.request(app)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should return a welcome message for the / endpoint', function(done) {
    chai.request(app)
      .get('/')
      .end((err, res) => {
        expect(res.text).to.include('Welcome to the DevOps Avengers CICD App!');
        done();
      });
  });

  it('should connect to the database and query', function(done) {
    chai.request(app)
      .get('/some-db-route')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(connection.called).to.be.true;
        done();
      });
  });

  // Add more tests as needed
});
