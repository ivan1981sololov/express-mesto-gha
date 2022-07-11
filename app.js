const express = require('express');
const mongoose = require('mongoose');
const routesUsers = require('./routes/users');
const routesCards = require('./routes/cards');

const PORT = 3000;
const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use((req, res, next) => {
  req.user = {
    _id: '61589e22010c775ed5e172ba',
  };

  next();
});
app.use(express.json());

app.use(routesUsers);
app.use(routesCards);

app.use((req, res) => { res.status(404).send({ message: 'Такого роута не существует' }); });

app.listen(PORT, () => {
  console.log('Express is running');
});
