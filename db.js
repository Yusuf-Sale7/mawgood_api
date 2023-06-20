const knex = require("knex");
const db = knex({
  client: "pg",
  connection: {
    connectionString:
      "postgres://yusuf:Pz3JuZU9IxuFpMMb2pGxYS3l54z0AOE4@dpg-ci8pot18g3nfuc9r8lp0-a.oregon-postgres.render.com/mawgood_db",
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

module.exports = db;
