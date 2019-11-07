INSERT INTO bookmarks (title, url, description, rating)
VALUES
  ('Example bookmark', 'https://example.com',  'This is an example bookmark', 5),
  ('Another example bookmark', 'https://example.com/bar', 'Another example bookmark', 1);
INSERT INTO bookmarks ( title, url, rating)
VALUES
  ('Example bookmark without a description', 'https://example.com/foo', 3)