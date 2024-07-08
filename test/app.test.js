import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, '../', 'public')));

const PORT = 3000;

router(app);
app.get('/', (req, res) => {
  res.send('<h1> Hello World </h1>');
});

app.use((req, res, next) => {
  const error = new Error();
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  if (error.status === 404) {
    res.status(404);
    return res.render('errors/404');
  }

  res.status(500);
  res.render('error/500');
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});

export default app;
