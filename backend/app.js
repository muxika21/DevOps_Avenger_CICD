const express = require('express');
const app = express();
const port = 3000;
const mysql = require('mysql2');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

// Set up the database connection
const connection = mysql.createConnection({
  host: 'db',
  user: 'root',
  password: 'root_password',
  database: 'mydatabase'
});

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/add', (req, res) => {
  const { staff_name, model, serial_number } = req.body;
  connection.query(
    'INSERT INTO cicd_pipeline (staff_name, model, serial_number) VALUES (?, ?, ?)',
    [staff_name, model, serial_number],
    (error, results) => {
      if (error) throw error;
      res.redirect('/');
    }
  );
});

app.get('/search', (req, res) => {
  connection.query('SELECT staff_name, model, serial_number FROM cicd_pipeline', (error, results) => {
    if (error) throw error;
    res.render('asset_list', { users: results });
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
