const app = require('../src/app');
const knex = require('knex');
const {
  addNullDescription,
  makeBookmarksArray
} = require('./bookmarks.fixtures');

describe('App', () => {
  let db;
  const testBookmarks = makeBookmarksArray();

  before('instantiate knex', () => {
    db = knex({ client: 'pg', connection: process.env.TEST_DB_URL });
    app.set('db', db);
  });

  before('reset to empty table', () => db('bookmarks').truncate());

  afterEach('reset to empty table', () => db('bookmarks').truncate());

  after('clean up', () => db.destroy());

  it('Should require authorization', () => {
    return supertest(app)
      .get('/')
      .expect(401);
  });
  it('GET / responds with 200 containing "Hello, world!"', () => {
    return supertest(app)
      .get('/')
      .set('Authorization', auth)
      .expect(200, 'Hello, world!');
  });
  describe(`GET /bookmarks`, () => {
    context(`Given 'bookmarks' has data`, () => {
      beforeEach('insert bookmarks', () => {
        return db('bookmarks').insert(testBookmarks);
      });

      it('responds with 200 and all of the bookmarks', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', auth)
          .expect(200, testBookmarks.map(addNullDescription));
      });
    });
    context(`given 'bookmarks' has no data`, () => {
      it('responds with 200 and an empty array', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', auth)
          .expect(200, []);
      });
    });
  });

  describe('GET /bookmmarks/:id', () => {
    context(`Given 'bookmarks' has data`, () => {
      beforeEach('insert bookmarks', () => {
        return db('bookmarks').insert(testBookmarks);
      });

      it('Given a valid ID, responds with 200 and the matching bookmark', () => {
        const id = 2;
        return supertest(app)
          .get(`/bookmarks/${id}`)
          .set('Authorization', auth)
          .expect(
            200,
            testBookmarks.map(addNullDescription).find(bm => bm.id === id)
          );
      });
      it(`Given an invalid ID, responds with 404 and JSON error object with message 'Bookmark doesn't exist`, () => {
        const id = -1;
        return supertest(app)
          .get(`/bookmarks/${id}`)
          .set('Authorization', auth)
          .expect(404, { error: { message: `Bookmark doesn't exist` } });
      });
    });
    context(`Given 'bookmarks' has no data`, () => {
      it('returns 404', () => {
        const id = 1;
        return supertest(app)
          .get(`/bookmarks/${id}`)
          .set('Authorization', auth)
          .expect(404);
      });
    });
  });
});
