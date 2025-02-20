const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'myproduct_plub'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error: ' + err.stack);
    return;
  }
  console.log('Connected to database');
});

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  db.query('SELECT * FROM product_plub', (err, results) => {
    if (err) throw err;
    res.render('index', { products: results });
  });
});

app.get('/add', (req, res) => {
  res.render('add');
});

app.post('/add', upload.single('product_image'), (req, res) => {
  const { product_name, product_price, product_cost } = req.body;
  const product_image = req.file.filename;

  db.query('INSERT INTO product_plub (product_name, product_price, product_cost, product_image) VALUES (?, ?, ?, ?)', 
    [product_name, product_price, product_cost, product_image], 
    (err, results) => {
      if (err) throw err;
      res.redirect('/');
    }
  );
});

app.get('/edit/:id', (req, res) => {
  const productId = req.params.id;
  db.query('SELECT * FROM product_plub WHERE id = ?', [productId], (err, results) => {
    if (err) throw err;
    res.render('edit', { product: results[0] });
  });
});

app.post('/edit/:id', upload.single('product_image'), (req, res) => {
  const productId = req.params.id;
  const { product_name, product_price, product_cost } = req.body;
  const product_image = req.file ? req.file.filename : req.body.old_image;

  db.query('UPDATE product_plub SET product_name = ?, product_price = ?, product_cost = ?, product_image = ? WHERE id = ?', 
    [product_name, product_price, product_cost, product_image, productId], 
    (err, results) => {
      if (err) throw err;
      res.redirect('/');
    }
  );
});

app.get('/delete/:id', (req, res) => {
  const productId = req.params.id;
  db.query('DELETE FROM product_plub WHERE id = ?', [productId], (err, results) => {
    if (err) throw err;
    res.redirect('/');
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});