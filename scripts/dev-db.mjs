// Local PostgreSQL for development without Docker or a system install.
// Data lives in ./.pgdata. Stop with Ctrl+C. Production uses the `db` service in docker-compose.yml.
import { existsSync } from "node:fs";
import EmbeddedPostgres from "embedded-postgres";

const dataDir = new URL("../.pgdata", import.meta.url).pathname;
const port = Number(process.env.DEV_DB_PORT ?? 5433);

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: "sneakora",
  password: "sneakora",
  port,
  persistent: true,
  onLog: () => {},
});

const firstRun = !existsSync(dataDir);
if (firstRun) await pg.initialise();
await pg.start();
if (firstRun) await pg.createDatabase("sneakora");

console.log(`PostgreSQL is running: postgresql://sneakora:sneakora@localhost:${port}/sneakora`);
console.log("Press Ctrl+C to stop.");

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
