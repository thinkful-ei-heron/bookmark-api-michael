const app = require('./app');

const { PORT } = require('./config');

const knex = require('knex');

const db = knex({ client: 'pg', connection: DB_URL });

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

app.set('db', db);
