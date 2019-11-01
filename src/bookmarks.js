const express = require('express');
const uuid = require('uuid/v4');
const logger = require('./logger');
const { bookmarks } = require('./store');

const router = express.Router();
const bodyParser = express.json();

router
  .route('/bookmarks')
  .get((req, res) => {
    res.json(bookmarks);
  })
  .post((req, res) => {
    res.status(500).send('NYI');
  });

router
  .route('/bookmarks/:id')
  .get((req, res) => {
    res.status(500).send('NYI');
  })
  .delete((req, res) => {
    res.status(500).send('NYI');
  });

module.exports = router;
