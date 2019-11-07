const BookmarksService = {
  getAllBookmarks(knex) {
    return knex('bookmarks').select('*');
  },

  getBookmarkById(knex, id) {
    return knex('bookmarks')
      .select('*')
      .where({ id })
      .first();
  },

  insertBookmark(knex, newItem) {
    return knex('bookmarks')
      .insert(newItem)
      .returning('*')
      .then(rows => rows[0]);
  },

  updateBookmark(knex, id, newData) {
    return knex('bookmarks')
      .where({ id })
      .update(newData);
  },

  deleteBookmark(knex, id) {
    return knex('bookmarks')
      .where({ id })
      .delete();
  }
};

module.exports = BookmarksService;
