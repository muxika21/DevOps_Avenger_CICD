const express = require('express');
const app = express();
const port = 3000;
const mysql = require('mysql2');

// Set up the database connection
const connection = mysql.createConnection({
  host: 'db',
  user: 'root',
  password: 'root_password',
  database: 'mydatabase'
});

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  connection.query('SELECT staff_name, model, serial_number FROM cicd_pipeline', (error, results) => {
    if (error) throw error;
    res.render('index', { users: results });
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
} else {
  module.exports = app;
}
