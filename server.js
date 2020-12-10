const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const DB = require('./config/mongoDB');
const app = express();
const HttpError = require('./middleware/HttpError');

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));
app.use(cookieParser());
DB();

app.use('/api/user/', require('./routes/user'));
app.use('/api/place/', require('./routes/place'));
app.use('/api/upload/', require('./routes/upload'));

app.use((req, res, next) => {
  return next(new HttpError('Page not found!', 404));
});
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500).json({
    message: error.message || 'Unknown error occurred!',
  });
});

app.listen(5000, () => {
  console.log('Server running on port: 5000');
});
