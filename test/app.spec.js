const app = require('../src/app');
const knex = require('knex');
const logger = require('../src/logger');

const {
  seedBookmarks,
  testBookmarks,
  sanitize
} = require('./bookmarks.fixtures');

describe('App', () => {
  let db;

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
      beforeEach('insert bookmarks', () => seedBookmarks(db));

      it('responds with 200 and all of the bookmarks', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', auth)
          .expect(200, testBookmarks.map(sanitize));
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
        return seedBookmarks(db);
      });

      it('Given a valid ID, responds with 200 and the matching bookmark', () => {
        const id = 3;
        const expected = sanitize(testBookmarks.find(bm => bm.id === id));
        // if (!expected.hasOwnProperty('description')) {
        //   expected.description = null;
        // }
        return supertest(app)
          .get(`/bookmarks/${id}`)
          .set('Authorization', auth)
          .expect(200, expected);
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

  describe('POST /bookmarks', () => {
    const bookmark = {
      title: 'Example bookmark',
      url: 'https://example.com',
      description: 'This is an example bookmark',
      rating: 5
    };
    it('Given a valid bookmark, responds with 201 and the bookmark', () => {
      return supertest(app)
        .post('/bookmarks')
        .send(bookmark)
        .set('Authorization', auth)
        .expect(201, { bookmark: { ...bookmark, id: 1 } });
    });

    it(`Given a bookmark with an invalid rating, responds with 400 and JSON error`, () => {
      return supertest(app)
        .post('/bookmarks')
        .send({ ...bookmark, rating: 6 })
        .set('Authorization', auth)
        .expect(400, {
          error: { message: "'rating' must be a number between 1 and 5" }
        });
    });
  });
});
