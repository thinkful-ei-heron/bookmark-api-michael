const BookmarksService = require('../src/bookmarks-service');
const knex = require('knex');
const {
  addNullDescription,
  makeBookmarksArray
} = require('./bookmarks.fixtures');

describe(`Bookmarks service object`, function() {
  let db;
  let testBookmarks = makeBookmarksArray();
  before('establish knex instance', () => {
    db = knex({ client: 'pg', connection: process.env.TEST_DB_URL });
  });

  before('reset to empty table', () => db('bookmarks').truncate());

  afterEach('reset to empty table', () => db('bookmarks').truncate());

  after('clean up', () => db.destroy());

  context(`Given 'bookmarks' has data`, () => {
    beforeEach(() => {
      return db('bookmarks').insert(
        testBookmarks.map(bm => {
          const { id, ...rest } = bm; //avoid issues with auto id not incrementing
          return rest;
        })
      );
    });

    it(`getAllBookmarks() resolves all bookmarks`, () => {
      return BookmarksService.getAllBookmarks(db).then(actual => {
        expect(actual).to.eql(testBookmarks.map(addNullDescription));
      });
    });

    it(`insertBookmark() inserts a bookmark and resolves the bookmark with an id`, () => {
      const newBookmark = {
        title: 'foo',
        url: 'https://example.com/baz',
        rating: 5
      };
      return BookmarksService.insertBookmark(db, newBookmark).then(actual => {
        expect(actual).to.eql({ id: 4, description: null, ...newBookmark });
      });
    });

    it('updateBookmark() updates a bookmark', () => {
      const newData = {
        title: 'foo',
        url: 'https://example.com/baz',
        description: 'foo'
      };
      const idToUpdate = 1;
      return BookmarksService.updateBookmark(db, idToUpdate, newData)
        .then(() => BookmarksService.getBookmarkById(db, idToUpdate))
        .then(bm => {
          expect(bm).to.eql({
            ...newData,
            id: idToUpdate,
            rating: testBookmarks.find(bm => bm.id === idToUpdate).rating
          });
        });
    });

    it('deleteBookmark() removes a bookmark by id', () => {
      const bmId = 2;
      return BookmarksService.deleteBookmark(db, bmId)
        .then(() => BookmarksService.getAllBookmarks(db))
        .then(allBookmarks => {
          const expected = testBookmarks
            .filter(bm => bm.id !== bmId)
            .map(addNullDescription);
          expect(allBookmarks).to.eql(expected);
        });
    });
  });

  context(`Given 'bookmarks' has no data`, () => {
    it('getAllBookmarks() resolves an empty array', () => {
      return BookmarksService.getAllBookmarks(db).then(actual => {
        expect(actual).to.eql([]);
      });
    });
  });
});
