/**
 * Bookmarks optionally have a description, but result always includes a (possibly null) description attribute.
 * @param {*} bm
 * @returns {*}
 */
function addNullDescription(bm) {
  if (!bm.hasOwnProperty('description')) {
    bm.description = null;
  }
  return bm;
}

function makeBookmarksArray() {
  return [
    {
      id: 1,
      title: 'Example bookmark',
      url: 'https://example.com',
      description: 'This is an example bookmark',
      rating: 5
    },
    {
      id: 2,
      title: 'Example bookmark without a description',
      url: 'https://example.com/foo',
      rating: 3
    },
    {
      id: 3,
      title: 'Example 3',
      url: 'https://example.com/bar',
      description: 'A third example bookmark',
      rating: 1
    }
  ];
}

module.exports = { addNullDescription, makeBookmarksArray };
