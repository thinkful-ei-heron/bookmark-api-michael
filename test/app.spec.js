const app = require('../src/app');
const knex = require('knex');
const {
  addNullDescription,
  makeBookmarksArray
} = require('./bookmarks.fixtures');

describe('App', () => {
  let db;

  let testBookmarks = makeBookmarksArray();

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

  context(`Given 'bookmarks' has data`, () => {
    beforeEach('insert bookmarks', () => {
      return db('bookmarks').insert(testBookmarks);
    });

    it('GET /bookmarks responds with 200 and all of the bookmarks', () => {
      return supertest(app)
        .get('/bookmarks')
        .set('Authorization', auth)
        .expect(200, testBookmarks.map(addNullDescription)); //todo: check bookmarks
    });
  });
});
