const express = require('express');
const uuid = require('uuid/v4');
const logger = require('./logger');
const { bookmarks, db } = require('./store');
const BookmarksService = require('./bookmarks-service');

const bodyParser = express.json();

const router = express.Router();

router
  .route('/bookmarks')
  .get((req, res) => {
    const db = req.app.get('db');
    BookmarksService.getAllBookmarks(db).then(all => res.json(all));
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
    const db = req.app.get('db');
    BookmarksService.getBookmarkById(db, id).then(bookmark => {
      if (!bookmark) {
        logger.error(`Attempt to get bookmark with invalid ID (${id})`);
        return res.status(404).json({
          error: { message: `Bookmark doesn't exist` }
        });
      }
      res.json(bookmark);
    });
  })
  .delete((req, res) => {
    const { id } = req.params;
    const index = bookmarks.findIndex(bm => bm.id == id);
    if (index === -1) {
      logger.error(`Attempt to delete bookmark with invalid ID (${id})`);
      return res.status(404).json({
        error: { message: `Bookmark doesn't exist` }
      });
    }
    bookmarks.splice(index, 1);
    logger.info(`Deleted card with id ${id}`);
    res.status(204).end();
  });

module.exports = router;
