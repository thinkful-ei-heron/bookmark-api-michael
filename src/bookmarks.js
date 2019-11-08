const express = require('express');
const uuid = require('uuid/v4');
const validUrl = require('valid-url');
const xss = require('xss');

const logger = require('./logger');
const { bookmarks, db } = require('./store');
const BookmarksService = require('./bookmarks-service');

const bodyParser = express.json();

const router = express.Router();

const sanitize = bookmark => {
  const newBookmark = {
    id: bookmark.id,
    rating: bookmark.rating,
    title: xss(bookmark.title),
    url: xss(bookmark.url),
    description: xss(bookmark.description)
  };
  if (newBookmark.description === '') {
    delete newBookmark.description;
  }
  return newBookmark;
};

router
  .route('/bookmarks')
  .get((req, res) => {
    const db = req.app.get('db');
    BookmarksService.getAllBookmarks(db).then(all => {
      const sanitized = all.map(sanitize);
      res.json(sanitized);
    });
  })
  .post(bodyParser, (req, res) => {
    logger.info(JSON.stringify(req.body));
    let { title, url, description, rating } = req.body;
    const db = req.app.get('db');

    //existence check
    for (let field of ['title', 'url', 'rating']) {
      if (!req.body[field]) {
        logger.warn(
          `Attempt to create bookmark without required field (${field})`
        );
        return res
          .status(400)
          .send({ error: { message: `${field} is required` } });
      }
    }

    if (!validUrl.isWebUri(url)) {
      logger.warn(`Attempt to create a bookmark with invalid URL: ${url}`);
      return res
        .status(400)
        .json({ error: { message: `'url' must be a valid URL` } });
    }

    if (!(Number.isInteger(rating) && rating >= 1 && rating <= 5)) {
      logger.warn(`Attemt to create a bookmark with invalid rating: ${url}`);
      return res.status(400).json({
        error: { message: `'rating' must be a number between 1 and 5` }
      });
    }

    let bookmark = {
      title,
      url,
      description,
      rating
    };
    BookmarksService.insertBookmark(db, bookmark).then(result => {
      res
        .status(201)
        .location(`http://localhost:8000/bookmarks/${result.id}`)
        .json({ bookmark: sanitize(result) });
    });
    //bookmark = sanitize(bookmark);

    logger.info(`Created bookmark with id ${bookmark.id}`);
    // res
    //   .status(201)
    //   .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
    //   .json(bookmark);
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
      // for ([key, value] in Object.entries(bookmark)) {
      //   bookmark[key] = xss(bookmark.value);
      // }
      bookmark = sanitize(bookmark);
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
