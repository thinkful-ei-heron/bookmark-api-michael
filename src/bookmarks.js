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
  .post(bodyParser, (req, res) => {
    const { title, url, description, rating } = req.body;

    if (!title || !url || !rating) {
      logger.error('Attempt to create a bookmark missing mandatory field');
      return res.status(400).send('Mandatory field(s) missing');
    }

    const id = uuid();
    const bookmark = { id, title, url, description, rating };

    bookmarks.push(bookmark);
    logger.info(`Created bookmark with id ${id}`);
    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${id}`)
      .json(bookmark);
  });

router
  .route('/bookmarks/:id')
  .get((req, res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find(bm => bm.id == id);
    if (!bookmark) {
      logger.error(`Attempt to get bookmark with invalid ID (${id})`);
      return res.status(404).send(`No bookmark found with id ${id}`);
    }
    res.json(bookmark);
  })
  .delete((req, res) => {
    const { id } = req.params;
    const index = bookmarks.findIndex(bm => bm.id == id);
    if (index === -1) {
      logger.error(`Attempt to delete bookmark with invalid ID (${id})`);
      return res.status(404).send(`No bookmark found with id ${id}`);
    }
    bookmarks.splice(index, 1);
    logger.info(`Deleted card with id ${id}`);
    res.status(204).end();
  });

module.exports = router;
