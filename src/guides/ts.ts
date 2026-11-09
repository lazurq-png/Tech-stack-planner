// @ts-nocheck -- moved from the single-file page; types are added module by module.
import { StackKit } from '../stack-kit';

// Guides for the two TypeScript stacks: Express and Next.js.
(function (Kit) {
  var DB_URL = {
    postgresql: 'postgres://postgres:your-password@localhost:5432/demo',
    mysql: 'mysql://root:your-password@localhost:3306/demo',
    sqlserver: 'sqlserver://localhost:1433;database=demo;user=sa;password=your-password;encrypt=true;trustServerCertificate=true',
    mongodb: 'mongodb://localhost:27017/demo',
    sqlite: 'file:./demo.db'
  };
  function envItem(a) {
    return { cmd: 'export DATABASE_URL="' + DB_URL[a.database] + '"', manual: true, lines: [['DATABASE_URL', 'Where the database is, including its password. Reading it from the environment keeps secrets out of your code.'], ['export', 'Applies to this terminal and the programs it starts, so set it again in a new terminal.']] };
  }

  // ---------- Data layer: every option exports the same four functions ----------
  var NL_DB = '\n*.db\n';
  var API_LINES = [
    ['Task', 'The shape of one task everywhere else in the app. IDs are strings, so MongoDB and SQL work the same.'],
    ['listTasks, addTask, setDone, deleteTask', 'The only four database operations this app needs. Everything else calls these, so changing library later only touches this file.'],
    ['async and await', 'Database calls take time. <code>await</code> pauses this function without blocking other requests.']
  ];
  function importExt(a, dir) {
    if (a.framework === 'nestjs') return '.js';
    return dir === 'src/' ? '.ts' : '';
  }
  function tsData(a, dir) {
    var file = dir + 'tasks.ts';
    var db = a.database;
    var items = [];
    if (db === 'mongodb') {
      items.push({ cmd: 'npm install mongodb', lines: [['mongodb', 'MongoDB\'s official driver.']] });
      items.push({ file: file, lang: 'typescript', code: "import { MongoClient, ObjectId } from 'mongodb';\n\nexport type Task = { id: string; title: string; done: boolean };\n\nconst client = new MongoClient(process.env.DATABASE_URL ?? 'mongodb://localhost:27017/demo');\nconst tasks = client.db().collection<{ title: string; done: boolean }>('tasks');\n\nfunction toTask(doc: { _id: ObjectId; title: string; done: boolean }): Task {\n  return { id: doc._id.toString(), title: doc.title, done: doc.done };\n}\n\nexport async function listTasks(): Promise<Task[]> {\n  return (await tasks.find().sort({ _id: 1 }).toArray()).map(toTask);\n}\n\nexport async function addTask(title: string): Promise<Task> {\n  const result = await tasks.insertOne({ title, done: false });\n  return { id: result.insertedId.toString(), title, done: false };\n}\n\nexport async function setDone(id: string, done: boolean): Promise<void> {\n  await tasks.updateOne({ _id: new ObjectId(id) }, { $set: { done } });\n}\n\nexport async function deleteTask(id: string): Promise<void> {\n  await tasks.deleteOne({ _id: new ObjectId(id) });\n}\n\nexport async function closeDb(): Promise<void> {\n  await client.close();\n}\n", lines: API_LINES.concat([['client.db()', 'Uses the database named in the URL.'], ['collection', 'MongoDB\'s equivalent of a table. It\'s created on first use.'], ['ObjectId', 'MongoDB\'s ID type. URLs carry it as a string, so it\'s converted here.'], ['$set', 'Changes only the listed field.'], ['closeDb', 'Lets tests finish without leaving a connection open.']]) });
      return items;
    }
    if (a.data === 'prisma') {
      var adapter = { postgresql: ['@prisma/adapter-pg', 'PrismaPg', 'new PrismaPg({ connectionString: process.env.DATABASE_URL })'], mysql: ['@prisma/adapter-mariadb', 'PrismaMariaDb', 'new PrismaMariaDb(process.env.DATABASE_URL!)'], sqlserver: ['@prisma/adapter-mssql', 'PrismaMssql', 'new PrismaMssql(process.env.DATABASE_URL!)'], sqlite: ['@prisma/adapter-better-sqlite3', 'PrismaBetterSqlite3', "new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? 'file:./demo.db' })"] }[db];
      var provider = { postgresql: 'postgresql', mysql: 'mysql', sqlserver: 'sqlserver', sqlite: 'sqlite' }[db];
      items.push({ p: 'These commands stay on Prisma 7, because Prisma 8 is still a release candidate.' });
      items.push({ cmd: 'npm install @prisma/client@7 ' + adapter[0] + '@7\nnpm install -D prisma@7', lines: [['@prisma/client', 'The library your code calls.'], [adapter[0], 'Connects Prisma to your database. Prisma 7 requires one.'], ['prisma', 'The command-line tool that generates code and runs migrations. <code>-D</code> means it\'s only needed for development.']] });
      items.push({ file: 'prisma/schema.prisma', lang: 'text', code: 'generator client {\n  provider = "prisma-client"\n  output   = "../' + dir + 'generated/prisma"\n}\n\ndatasource db {\n  provider = "' + provider + '"\n}\n\nmodel Task {\n  id    Int     @id @default(autoincrement())\n  title String\n  done  Boolean @default(false)\n\n  @@map("tasks")\n}\n', lines: [['generator client', 'Prisma generates a typed database client from this file, into the <code>output</code> folder.'], ['datasource', 'Which kind of database you use. The address is set in the config file below.'], ['model Task', 'Describes one table and its columns.'], ['@id @default(autoincrement())', 'The primary key, numbered by the database.'], ['@@map("tasks")', 'Names the table <code>tasks</code> while your code says <code>Task</code>.']] });
      items.push({ file: 'prisma.config.ts', lang: 'typescript', code: "import { defineConfig } from 'prisma/config';\n\nexport default defineConfig({\n  schema: 'prisma/schema.prisma',\n  migrations: { path: 'prisma/migrations' },\n  datasource: { url: process.env.DATABASE_URL" + (db === 'sqlite' ? " ?? 'file:./demo.db'" : '!') + " },\n});\n", lines: [['defineConfig', 'Settings for the Prisma command-line tool.'], ['datasource.url', 'Where migrations connect. Your running app connects through the adapter instead.']] });
      items.push({ file: file, lang: 'typescript', code: "import { " + adapter[1] + " } from '" + adapter[0] + "';\nimport { PrismaClient } from './generated/prisma/client" + importExt(a, dir) + "';\n\nexport type Task = { id: string; title: string; done: boolean };\n\nconst adapter = " + adapter[2] + ";\nconst prisma = new PrismaClient({ adapter });\n\nfunction toTask(row: { id: number; title: string; done: boolean }): Task {\n  return { ...row, id: String(row.id) };\n}\n\nexport async function listTasks(): Promise<Task[]> {\n  return (await prisma.task.findMany({ orderBy: { id: 'asc' } })).map(toTask);\n}\n\nexport async function addTask(title: string): Promise<Task> {\n  return toTask(await prisma.task.create({ data: { title } }));\n}\n\nexport async function setDone(id: string, done: boolean): Promise<void> {\n  await prisma.task.update({ where: { id: Number(id) }, data: { done } });\n}\n\nexport async function deleteTask(id: string): Promise<void> {\n  await prisma.task.delete({ where: { id: Number(id) } });\n}\n\nexport async function closeDb(): Promise<void> {\n  await prisma.$disconnect();\n}\n", lines: API_LINES.concat([['generated/prisma/client', 'The code Prisma generated from your schema. Don\'t edit it.'], ['prisma.task', 'A typed object for the table, so a mistyped column fails to compile.'], ['toTask', 'Turns the numeric ID into a string for the rest of the app.'], ['closeDb', 'Lets tests finish without leaving a connection open.']]) });
      return items;
    }
    if (a.data === 'drizzle') {
      var d = { postgresql: { pkg: 'pg', dev: ' @types/pg', core: 'pg-core', orm: 'node-postgres', dialect: 'postgresql', table: 'pgTable', imports: 'boolean, integer, pgTable, varchar', cols: "id: integer().primaryKey().generatedAlwaysAsIdentity(),\n  title: varchar({ length: 200 }).notNull(),\n  done: boolean().notNull().default(false)", conn: 'drizzle(process.env.DATABASE_URL!)', url: 'process.env.DATABASE_URL!' }, mysql: { pkg: 'mysql2', dev: '', core: 'mysql-core', orm: 'mysql2', dialect: 'mysql', table: 'mysqlTable', imports: 'boolean, int, mysqlTable, varchar', cols: "id: int().primaryKey().autoincrement(),\n  title: varchar({ length: 200 }).notNull(),\n  done: boolean().notNull().default(false)", conn: 'drizzle(process.env.DATABASE_URL!)', url: 'process.env.DATABASE_URL!' }, sqlite: { pkg: 'better-sqlite3', dev: ' @types/better-sqlite3', core: 'sqlite-core', orm: 'better-sqlite3', dialect: 'sqlite', table: 'sqliteTable', imports: 'integer, sqliteTable, text', cols: "id: integer().primaryKey({ autoIncrement: true }),\n  title: text().notNull(),\n  done: integer({ mode: 'boolean' }).notNull().default(false)", conn: "drizzle(sqliteFile)", url: "sqliteFile" } }[db];
      items.push({ cmd: 'npm install drizzle-orm ' + d.pkg + '\nnpm install -D drizzle-kit' + d.dev, lines: [['drizzle-orm', 'The query library.'], [d.pkg, 'The database driver it uses.'], ['drizzle-kit', 'The command-line tool for migrations.']] });
      items.push({ file: dir + 'schema.ts', lang: 'typescript', code: "import { " + d.imports + " } from 'drizzle-orm/" + d.core + "';\n\nexport const tasks = " + d.table + "('tasks', {\n  " + d.cols + ",\n});\n", lines: [[d.table, 'Declares a table in TypeScript. Queries use this, so column names are checked when you compile.'], ['primaryKey', 'The ID column, numbered by the database.'], ['notNull', 'The column must have a value.']] });
      var sqliteHead = db === 'sqlite' ? "const sqliteFile = (process.env.DATABASE_URL ?? 'file:./demo.db').replace('file:', '');\n" : '';
      items.push({ file: 'drizzle.config.ts', lang: 'typescript', code: "import { defineConfig } from 'drizzle-kit';\n\n" + sqliteHead + "export default defineConfig({\n  out: './drizzle',\n  schema: './" + dir + "schema.ts',\n  dialect: '" + d.dialect + "',\n  dbCredentials: { url: " + d.url + " },\n});\n", lines: [['out', 'Where generated SQL migrations go.'], ['schema', 'The file that describes your tables.'], ['dialect', 'Which kind of SQL to write.']] });
      var insert = db === 'mysql'
        ? "  const [row] = await db.insert(tasks).values({ title }).$returningId();\n  return { id: String(row.id), title, done: false };"
        : "  const [row] = await db.insert(tasks).values({ title }).returning();\n  return toTask(row);";
      items.push({ file: file, lang: 'typescript', code: "import { asc, eq } from 'drizzle-orm';\nimport { drizzle } from 'drizzle-orm/" + d.orm + "';\nimport { tasks } from './schema" + importExt(a, dir) + "';\n\nexport type Task = { id: string; title: string; done: boolean };\n\n" + sqliteHead + "const db = " + d.conn + ";\n\nfunction toTask(row: { id: number; title: string; done: boolean }): Task {\n  return { ...row, id: String(row.id) };\n}\n\nexport async function listTasks(): Promise<Task[]> {\n  return (await db.select().from(tasks).orderBy(asc(tasks.id))).map(toTask);\n}\n\nexport async function addTask(title: string): Promise<Task> {\n" + insert + "\n}\n\nexport async function setDone(id: string, done: boolean): Promise<void> {\n  await db.update(tasks).set({ done }).where(eq(tasks.id, Number(id)));\n}\n\nexport async function deleteTask(id: string): Promise<void> {\n  await db.delete(tasks).where(eq(tasks.id, Number(id)));\n}\n\nexport async function closeDb(): Promise<void> {\n" + (db === 'sqlite' ? "  (db as unknown as { $client: { close(): void } }).$client.close();\n" : db === 'mysql' ? "  await (db as unknown as { $client: { end(): Promise<void> } }).$client.end();\n" : "  await (db as unknown as { $client: { end(): Promise<void> } }).$client.end();\n") + "}\n", lines: API_LINES.concat([['drizzle', 'Connects to the database.'], ['db.select().from(tasks)', 'Reads like the SQL it runs.'], ['eq', 'Builds a <code>where id = ...</code> condition, with the value safely passed as a parameter.'], ['$client', 'The underlying driver, which is closed when tests finish.']]) });
      return items;
    }
    if (a.data === 'kysely') {
      var k = { postgresql: { pkg: 'pg', dev: ' @types/pg', imp: "import { Kysely, PostgresDialect } from 'kysely';\nimport { Pool } from 'pg';", dialect: 'new PostgresDialect({ pool: new Pool({ connectionString: process.env.DATABASE_URL }) })' }, mysql: { pkg: 'mysql2', dev: '', imp: "import { Kysely, MysqlDialect } from 'kysely';\nimport { createPool } from 'mysql2';", dialect: 'new MysqlDialect({ pool: createPool(process.env.DATABASE_URL!) })' }, sqlserver: { pkg: 'tedious tarn', dev: '', imp: "import { Kysely, MssqlDialect } from 'kysely';\nimport * as tarn from 'tarn';\nimport * as tedious from 'tedious';", dialect: "new MssqlDialect({\n  tarn: { ...tarn, options: { min: 0, max: 10 } },\n  tedious: {\n    ...tedious,\n    connectionFactory: () =>\n      new tedious.Connection({\n        server: process.env.DB_HOST ?? 'localhost',\n        authentication: { type: 'default', options: { userName: process.env.DB_USER, password: process.env.DB_PASSWORD } },\n        options: { database: 'demo', trustServerCertificate: true },\n      }),\n  },\n})" }, sqlite: { pkg: 'better-sqlite3', dev: ' @types/better-sqlite3', imp: "import Database from 'better-sqlite3';\nimport { Kysely, SqliteDialect } from 'kysely';", dialect: "new SqliteDialect({ database: new Database((process.env.DATABASE_URL ?? 'file:./demo.db').replace('file:', '')) })" } }[db];
      items.push({ cmd: 'npm install kysely ' + k.pkg + (k.dev ? '\nnpm install -D' + k.dev : ''), lines: [['kysely', 'The query builder.'], [k.pkg, 'The database driver it uses.']] });
      var kInsert = db === 'postgresql' || db === 'sqlite'
        ? "  const row = await db.insertInto('tasks').values({ title, done: FALSE }).returningAll().executeTakeFirstOrThrow();\n  return toTask(row);"
        : db === 'sqlserver'
          ? "  const row = await db.insertInto('tasks').values({ title, done: FALSE }).outputAll('inserted').executeTakeFirstOrThrow();\n  return toTask(row);"
          : "  const result = await db.insertInto('tasks').values({ title, done: FALSE }).executeTakeFirstOrThrow();\n  return { id: String(result.insertId), title, done: false };";
      var boolT = db === 'postgresql' ? 'boolean' : db === 'sqlserver' ? 'boolean' : 'number | boolean';
      var falseV = db === 'postgresql' || db === 'sqlserver' ? 'false' : '0';
      items.push({ file: file, lang: 'typescript', code: k.imp + "\nimport type { Generated } from 'kysely';\n\nexport type Task = { id: string; title: string; done: boolean };\n\ninterface TaskTable {\n  id: Generated<number>;\n  title: string;\n  done: " + boolT + ";\n}\ninterface Database_ {\n  tasks: TaskTable;\n}\n\nconst FALSE = " + falseV + ";\nconst db = new Kysely<Database_>({\n  dialect: " + k.dialect + ",\n});\n\nfunction toTask(row: { id: number; title: string; done: number | boolean }): Task {\n  return { id: String(row.id), title: row.title, done: Boolean(row.done) };\n}\n\nexport async function listTasks(): Promise<Task[]> {\n  return (await db.selectFrom('tasks').selectAll().orderBy('id').execute()).map(toTask);\n}\n\nexport async function addTask(title: string): Promise<Task> {\n" + kInsert + "\n}\n\nexport async function setDone(id: string, done: boolean): Promise<void> {\n  await db.updateTable('tasks').set({ done: " + (db === 'postgresql' || db === 'sqlserver' ? 'done' : 'done ? 1 : 0') + " }).where('id', '=', Number(id)).execute();\n}\n\nexport async function deleteTask(id: string): Promise<void> {\n  await db.deleteFrom('tasks').where('id', '=', Number(id)).execute();\n}\n\nexport async function closeDb(): Promise<void> {\n  await db.destroy();\n}\n", lines: API_LINES.concat([['interface TaskTable', 'Tells Kysely your columns. It doesn\'t create anything, so your migration must match this.'], ['Generated', 'Means the database fills this in, so inserts don\'t need it.'], ['dialect', 'How Kysely talks to your kind of database.'], ['selectFrom, updateTable', 'Build SQL step by step. A mistyped table or column fails to compile.'], ['Boolean(row.done)', 'Some databases return 0 or 1 instead of true or false.'], ['destroy', 'Closes the connections, so tests can finish.']]) });
      return items;
    }
    // TypeORM, using EntitySchema so it needs no decorator build settings.
    var driver = { postgresql: 'pg', mysql: 'mysql2', sqlserver: 'mssql', sqlite: 'better-sqlite3' }[db];
    var opts = { postgresql: "type: 'postgres',\n  url: process.env.DATABASE_URL,", mysql: "type: 'mysql',\n  url: process.env.DATABASE_URL,", sqlserver: "type: 'mssql',\n  host: process.env.DB_HOST ?? 'localhost',\n  username: process.env.DB_USER,\n  password: process.env.DB_PASSWORD,\n  database: 'demo',\n  options: { trustServerCertificate: true },", sqlite: "type: 'better-sqlite3',\n  database: (process.env.DATABASE_URL ?? 'file:./demo.db').replace('file:', ''),"}[db];
    var doneType = { postgresql: 'boolean', mysql: 'boolean', sqlserver: 'bit', sqlite: 'boolean' }[db];
    items.push({ cmd: 'npm install typeorm reflect-metadata ' + driver, lines: [['typeorm', 'The ORM.'], ['reflect-metadata', 'A library TypeORM loads at startup.'], [driver, 'The database driver it uses.']] });
    items.push({ file: file, lang: 'typescript', code: "import 'reflect-metadata';\nimport { DataSource, EntitySchema } from 'typeorm';\n\nexport type Task = { id: string; title: string; done: boolean };\n\ntype TaskRow = { id: number; title: string; done: boolean };\n\nconst TaskEntity = new EntitySchema<TaskRow>({\n  name: 'Task',\n  tableName: 'tasks',\n  columns: {\n    id: { type: Number, primary: true, generated: true },\n    title: { type: String, length: 200 },\n    done: { type: '" + doneType + "', default: false },\n  },\n});\n\nconst source = new DataSource({\n  " + opts + "\n  entities: [TaskEntity],\n  synchronize: false,\n});\nlet ready: Promise<DataSource> | undefined;\n\nasync function repo() {\n  ready ??= source.initialize();\n  return (await ready).getRepository(TaskEntity);\n}\n\nfunction toTask(row: TaskRow): Task {\n  return { id: String(row.id), title: row.title, done: Boolean(row.done) };\n}\n\nexport async function listTasks(): Promise<Task[]> {\n  return (await (await repo()).find({ order: { id: 'ASC' } })).map(toTask);\n}\n\nexport async function addTask(title: string): Promise<Task> {\n  return toTask(await (await repo()).save({ title, done: false }));\n}\n\nexport async function setDone(id: string, done: boolean): Promise<void> {\n  await (await repo()).update(Number(id), { done });\n}\n\nexport async function deleteTask(id: string): Promise<void> {\n  await (await repo()).delete(Number(id));\n}\n\nexport async function closeDb(): Promise<void> {\n  if (source.isInitialized) await source.destroy();\n}\n", lines: API_LINES.concat([['EntitySchema', 'Describes the table in plain objects. TypeORM\'s decorator style also works, but this needs no special compiler settings, which keeps Next.js and tsx simple.'], ['synchronize: false', 'Stops TypeORM from changing tables by itself. Your migrations own the structure.'], ['repo', 'Connects once, on first use, and returns an object for reading and writing the table.'], ['save', 'Inserts the row and returns it with its new ID.'], ['destroy', 'Closes the connection, so tests can finish.']]) });
    return items;
  }

  // ---------- Migrations ----------
  function tsMigrations(a, usersAreSeparate) {
    var items = [];
    if (a.database === 'mongodb') return [{ p: 'MongoDB has no fixed table structure, so there are no migrations to run. Collections are created the first time you save data.' }];
    if (a.data === 'prisma' && a.migrations !== 'prisma-migrate') items.push({ p: 'Prisma still needs to generate its client, even though another tool manages your tables:' }, { cmd: 'npx prisma generate', lines: [['prisma generate', 'Writes the typed client from your schema.']] });
    if (a.migrations === 'prisma-migrate') {
      items.push({ cmd: 'npx prisma migrate dev --name init\nnpx prisma generate', lines: [['migrate dev', 'Compares your schema to the database, writes a SQL migration and runs it.'], ['prisma generate', 'Writes the typed client from your schema. Prisma 7 no longer does this during migrations, so it needs its own command.'], ['--name init', 'Labels this migration.']] });
      items.push({ p: 'Commit the <code>prisma/migrations</code> folder. In production, run <code>npx prisma migrate deploy</code>, which only applies existing files.' });
    }
    if (a.migrations === 'drizzle-kit') {
      items.push({ cmd: 'npx drizzle-kit generate\nnpx drizzle-kit migrate', lines: [['generate', 'Compares your schema to earlier migrations and writes a new SQL file into <code>drizzle/</code>.'], ['migrate', 'Runs any SQL files that haven\'t run yet.']] });
      items.push({ p: 'Commit the <code>drizzle</code> folder. Run the same <code>migrate</code> command in production.' });
    }
    if (a.migrations === 'node-pg-migrate') {
      items.push({ cmd: 'npm install -D node-pg-migrate\nnpm install pg', lines: [['node-pg-migrate', 'Runs migration files in order and records which have run.'], ['pg', 'The PostgreSQL driver it uses.']] });
      items.push({ file: 'migrations/1_create_tasks.cjs', lang: 'javascript', code: "exports.up = (pgm) => {\n  pgm.createTable('tasks', {\n    id: 'id',\n    title: { type: 'varchar(200)', notNull: true },\n    done: { type: 'boolean', notNull: true, default: false },\n  });\n};\n\nexports.down = (pgm) => {\n  pgm.dropTable('tasks');\n};\n", lines: [['1_create_tasks', 'Files run in name order, so the number sets the order.'], ['.cjs', 'Uses the older module format, which this file\'s <code>exports</code> needs in a project set to ES modules.'], ['up', 'Applies the change.'], ['down', 'Reverses it.'], ["id: 'id'", 'A shortcut for an auto-numbered primary key.']] });
      items.push({ cmd: 'npx node-pg-migrate up', lines: [['up', 'Runs every migration that hasn\'t run. It connects using <code>DATABASE_URL</code>.']] });
    }
    if (a.migrations === 'flyway-any') items = items.concat(Kit.flywayItems(a));
    return items;
  }

  // ---------- Better Auth handles login for both stacks ----------
  function authFile(a, dir) {
    var dbImport = { postgresql: "import { Pool } from 'pg';\n", mysql: "import { createPool } from 'mysql2/promise';\n", sqlite: "import Database from 'better-sqlite3';\n", sqlserver: "import { MssqlDialect } from 'kysely';\nimport * as tarn from 'tarn';\nimport * as tedious from 'tedious';\n", mongodb: "import { MongoClient } from 'mongodb';\nimport { mongodbAdapter } from 'better-auth/adapters/mongodb';\n" }[a.database];
    var dbValue = { postgresql: 'new Pool({ connectionString: process.env.DATABASE_URL })', mysql: 'createPool(process.env.DATABASE_URL!)', sqlite: "new Database((process.env.DATABASE_URL ?? 'file:./demo.db').replace('file:', ''))", sqlserver: "{\n    type: 'mssql',\n    dialect: new MssqlDialect({\n      tarn: { ...tarn, options: { min: 0, max: 10 } },\n      tedious: {\n        ...tedious,\n        connectionFactory: () =>\n          new tedious.Connection({\n            server: process.env.DB_HOST ?? 'localhost',\n            authentication: { type: 'default', options: { userName: process.env.DB_USER, password: process.env.DB_PASSWORD } },\n            options: { database: 'demo', trustServerCertificate: true },\n          }),\n      },\n    }),\n  }", mongodb: "mongodbAdapter(new MongoClient(process.env.DATABASE_URL ?? 'mongodb://localhost:27017/demo').db())" }[a.database];
    var oidc = Kit.usesOidc(a);
    var code = "import { betterAuth } from 'better-auth';\n" + (oidc ? "import { genericOAuth } from 'better-auth/plugins';\n" : '') + dbImport + "\nexport const auth = betterAuth({\n  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:" + (a.framework === 'nextjs' ? 3000 : 3000) + "',\n  secret: process.env.BETTER_AUTH_SECRET,\n" + (Kit.isSpa(a) ? "  trustedOrigins: process.env.NODE_ENV === 'production' ? [] : ['http://localhost:5173', 'http://localhost:4200'],\n" : '') + "  database: " + dbValue + ",\n" + (oidc ? "  plugins: [\n    genericOAuth({\n      config: [\n        {\n          providerId: 'oidc',\n          clientId: process.env.OIDC_CLIENT_ID!,\n          clientSecret: process.env.OIDC_CLIENT_SECRET!,\n          discoveryUrl: process.env.OIDC_ISSUER?.replace(/\\/$/, '') + '/.well-known/openid-configuration',\n          scopes: ['openid', 'profile', 'email'],\n        },\n      ],\n    }),\n  ],\n" : "  emailAndPassword: { enabled: true },\n") + "});\n\nconst adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase());\n\nexport function isAdmin(email: string): boolean {\n  return adminEmails.includes(email.toLowerCase());\n}\n";
    return { file: dir + 'auth.ts', lang: 'typescript', code: code, lines: [
      ['betterAuth', 'Better Auth handles sessions, cookies and password hashing, and stores its own tables in your database. Next.js lists it among its recommended libraries, and it works the same in Express.'],
      ['secret', 'Signs session cookies. Anyone with it could forge a login, so keep it private.'],
      ['trustedOrigins', 'Only appears with a separate frontend. Better Auth rejects requests from other addresses, and your development frontend runs on its own port.'],
      ['database', 'Better Auth has its own connection, so it works whichever data library you chose.']
    ].concat(oidc ? [['genericOAuth', 'Signs users in through your OpenID Connect provider.'], ['discoveryUrl', 'A standard address where the provider publishes its login and token URLs.'], ['scopes', 'What the app asks to know about the user.']] : [['emailAndPassword', 'Turns on sign-up and login with an email and password. Passwords are stored as hashes.']]).concat([['isAdmin', 'Treats the emails listed in <code>ADMIN_EMAILS</code> as admins, so you don\'t need a separate roles system to start.']]) };
  }
  function authEnv(a) {
    return { cmd: 'export BETTER_AUTH_SECRET="$(openssl rand -base64 32)"\nexport ADMIN_EMAILS=you@example.com', lines: [['openssl rand -base64 32', 'Generates a random secret. Save the value somewhere safe and reuse it, because changing it logs everyone out.'], ['ADMIN_EMAILS', 'A comma-separated list of admin accounts.']] };
  }
  function authPackages(a) {
    var extra = { postgresql: 'pg', mysql: 'mysql2', sqlite: 'better-sqlite3', sqlserver: 'kysely tedious tarn', mongodb: 'mongodb' }[a.database];
    var types = { postgresql: '@types/pg', sqlite: '@types/better-sqlite3' }[a.database];
    return { cmd: 'npm install better-auth ' + extra + (types ? '\nnpm install -D ' + types : ''), lines: [['better-auth', 'The login library.'], [extra, 'What it uses to reach your database.']].concat(types ? [[types, 'Type information for that driver, so TypeScript can check how you use it.']] : []) };
  }
  function authMigrate(a, dir) {
    if (a.database === 'mongodb') return { p: 'MongoDB needs no setup here, because collections are created on first use.' };
    return { cmd: 'npx --yes auth@latest migrate --yes --config ' + dir + 'auth.ts', lines: [['auth@latest migrate', 'Creates the tables Better Auth needs.'], ['--yes', 'Doesn\'t stop to ask for confirmation.'], ['--config', 'Where your login settings are.']] };
  }
  function loginPage(a) {
    if (Kit.usesOidc(a)) return "<!doctype html>\n<html lang=\"en\">\n<meta charset=\"utf-8\">\n<title>Log in</title>\n<h1>Log in</h1>\n<button id=\"go\">Log in</button>\n<script>\n  document.getElementById('go').onclick = async () => {\n    const res = await fetch('/api/auth/sign-in/oauth2', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ providerId: 'oidc', callbackURL: '/' }),\n    });\n    location.href = (await res.json()).url;\n  };\n</script>\n</html>\n";
    return "<!doctype html>\n<html lang=\"en\">\n<meta charset=\"utf-8\">\n<title>Log in</title>\n<h1>Log in or sign up</h1>\n<form id=\"form\">\n  <label>Email <input name=\"email\" type=\"email\" required></label>\n  <label>Password <input name=\"password\" type=\"password\" minlength=\"8\" required></label>\n  <button name=\"action\" value=\"in\">Log in</button>\n  <button name=\"action\" value=\"up\">Sign up</button>\n</form>\n<p id=\"error\" role=\"alert\"></p>\n<script>\n  const form = document.getElementById('form');\n  form.onsubmit = async (event) => {\n    event.preventDefault();\n    const data = new FormData(form);\n    const signUp = event.submitter.value === 'up';\n    const res = await fetch('/api/auth/' + (signUp ? 'sign-up/email' : 'sign-in/email'), {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ email: data.get('email'), password: data.get('password'), name: data.get('email') }),\n    });\n    if (res.ok) location.href = '/';\n    else document.getElementById('error').textContent = 'That did not work. Check your details.';\n  };\n</script>\n</html>\n";
  }
  var LOGIN_LINES = [['fetch', 'Sends the form to Better Auth\'s built-in endpoints. On success it sets a session cookie that the browser can\'t read from JavaScript.']];

  // ---------- Payments, shared by both TypeScript stacks ----------
  function paymentFile(a, dir) {
    var body = {
      stripe: "  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {\n    method: 'POST',\n    headers: { Authorization: 'Bearer ' + process.env.STRIPE_SECRET_KEY },\n    body: new URLSearchParams({\n      mode: 'payment',\n      success_url: baseUrl + '/?paid=1',\n      cancel_url: baseUrl + '/',\n      'line_items[0][quantity]': '1',\n      'line_items[0][price_data][currency]': 'eur',\n      'line_items[0][price_data][unit_amount]': '1000',\n      'line_items[0][price_data][product_data][name]': 'Example product',\n    }),\n  });\n  if (!res.ok) throw new Error('Stripe error ' + res.status);\n  return (await res.json()).url;\n",
      paypal: "  const api = 'https://api-m.sandbox.paypal.com';\n  const login = Buffer.from(process.env.PAYPAL_CLIENT_ID + ':' + process.env.PAYPAL_SECRET).toString('base64');\n  const tokenRes = await fetch(api + '/v1/oauth2/token', {\n    method: 'POST',\n    headers: { Authorization: 'Basic ' + login },\n    body: new URLSearchParams({ grant_type: 'client_credentials' }),\n  });\n  if (!tokenRes.ok) throw new Error('PayPal login error ' + tokenRes.status);\n  const { access_token } = await tokenRes.json();\n  const res = await fetch(api + '/v2/checkout/orders', {\n    method: 'POST',\n    headers: { Authorization: 'Bearer ' + access_token, 'Content-Type': 'application/json' },\n    body: JSON.stringify({\n      intent: 'CAPTURE',\n      purchase_units: [{ amount: { currency_code: 'EUR', value: '10.00' } }],\n      payment_source: { paypal: { experience_context: { return_url: baseUrl + '/?paid=1', cancel_url: baseUrl + '/' } } },\n    }),\n  });\n  if (!res.ok) throw new Error('PayPal error ' + res.status);\n  const order = await res.json();\n  return order.links.find((link: { rel: string }) => link.rel === 'payer-action').href;\n",
      adyen: "  const res = await fetch('https://checkout-test.adyen.com/v72/paymentLinks', {\n    method: 'POST',\n    headers: { 'X-API-Key': process.env.ADYEN_API_KEY!, 'Content-Type': 'application/json' },\n    body: JSON.stringify({\n      merchantAccount: process.env.ADYEN_MERCHANT,\n      reference: 'order-' + Date.now(),\n      amount: { currency: 'EUR', value: 1000 },\n      returnUrl: baseUrl + '/?paid=1',\n    }),\n  });\n  if (!res.ok) throw new Error('Adyen error ' + res.status);\n  return (await res.json()).url;\n",
      klarna: "  const api = 'https://api.playground.klarna.com';\n  const login = 'Basic ' + Buffer.from(process.env.KLARNA_USER + ':' + process.env.KLARNA_PASSWORD).toString('base64');\n  const headers = { Authorization: login, 'Content-Type': 'application/json' };\n  const sessionRes = await fetch(api + '/payments/v1/sessions', {\n    method: 'POST',\n    headers,\n    body: JSON.stringify({\n      purchase_country: 'SE',\n      purchase_currency: 'SEK',\n      locale: 'sv-SE',\n      order_amount: 10000,\n      order_lines: [{ name: 'Example product', quantity: 1, unit_price: 10000, total_amount: 10000 }],\n    }),\n  });\n  if (!sessionRes.ok) throw new Error('Klarna session error ' + sessionRes.status);\n  const { session_id } = await sessionRes.json();\n  const res = await fetch(api + '/hpp/v1/sessions', {\n    method: 'POST',\n    headers,\n    body: JSON.stringify({\n      payment_session_url: api + '/payments/v1/sessions/' + session_id,\n      merchant_urls: { success: baseUrl + '/?paid=1', cancel: baseUrl + '/', back: baseUrl + '/', failure: baseUrl + '/', error: baseUrl + '/' },\n    }),\n  });\n  if (!res.ok) throw new Error('Klarna page error ' + res.status);\n  return (await res.json()).redirect_url;\n"
    }[a.payment];
    var lines = {
      stripe: [['/v1/checkout/sessions', 'Creates a Stripe-hosted payment page.'], ['Bearer', 'Logs in with your secret key. It only ever belongs on the server.'], ['URLSearchParams', 'Stripe\'s API takes form-encoded data, not JSON.'], ['unit_amount', 'The price in the smallest unit, so 1000 is 10.00 euros.'], ['success_url', 'Where the customer returns after paying.'], ['.url', 'The payment page to send the customer to.']],
      paypal: [['api-m.sandbox', 'PayPal\'s test system. Use <code>api-m.paypal.com</code> in production.'], ['/v1/oauth2/token', 'Exchanges your app\'s credentials for a short-lived token.'], ['intent: CAPTURE', 'Takes payment immediately once the buyer approves.'], ['payer-action', 'The link where the buyer approves. After they return, capture the order on your server to actually take the money.']],
      adyen: [['checkout-test.adyen.com', 'Adyen\'s test system. Production uses a URL specific to your account.'], ['/paymentLinks', 'Creates an Adyen-hosted payment page.'], ['X-API-Key', 'Logs in with your API key.'], ['value: 1000', 'The price in the smallest unit, so 10.00 euros.'], ['.url', 'The payment page to send the customer to.']],
      klarna: [['api.playground.klarna.com', 'Klarna\'s test system. Production uses <code>api.klarna.com</code> or a regional address.'], ['/payments/v1/sessions', 'Describes the order. Amounts are in the smallest unit, so 10000 is 100.00 SEK.'], ['/hpp/v1/sessions', 'Creates the Klarna-hosted payment page for that order.'], ['merchant_urls', 'Where Klarna returns the customer in each outcome.'], ['redirect_url', 'The payment page to send the customer to.']]
    }[a.payment];
    return { file: dir + 'checkout.ts', lang: 'typescript', code: "export async function createCheckout(baseUrl: string): Promise<string> {\n" + body + "}\n", lines: lines };
  }

  function paymentTest(a, importPath) {
    var fake = { stripe: "{ url: 'https://pay.example/1' }", adyen: "{ url: 'https://pay.example/1' }", paypal: "{ access_token: 't', links: [{ rel: 'payer-action', href: 'https://pay.example/1' }] }", klarna: "{ session_id: 's', redirect_url: 'https://pay.example/1' }" }[a.payment];
    return { file: 'test/checkout.test.ts', lang: 'typescript', code: "import assert from 'node:assert/strict';\nimport { test } from 'node:test';\nimport { createCheckout } from '" + importPath + "';\n\ntest('asks the provider for a payment page', async () => {\n  const real = globalThis.fetch;\n  const urls: string[] = [];\n  globalThis.fetch = (async (url: string) => {\n    urls.push(String(url));\n    return new Response(JSON.stringify(" + fake + "), { status: 200 });\n  }) as typeof fetch;\n  try {\n    assert.equal(await createCheckout('http://localhost:3000'), 'https://pay.example/1');\n    assert.ok(urls.length > 0);\n  } finally {\n    globalThis.fetch = real;\n  }\n});\n", lines: [['globalThis.fetch =', 'Replaces the network call with a simulated response, so this test needs no account and spends no money.']] };
  }

  function ejsViews(a, sections) {
    var templates = a.frontend === 'server-templates', login = !!a.login, needsEjs = templates || a.admin === 'in-app';
    if (needsEjs) {
      var viewItems = [];
      if (templates) {
        var liveScript = a.transport === 'sse' ? "<script>new EventSource('/api/live').onmessage = () => htmx.trigger('#list', 'reload');</script>\n" : a.transport === 'websocket' ? "<script>\n  const scheme = location.protocol === 'https:' ? 'wss://' : 'ws://';\n  new WebSocket(scheme + location.host + '/live').onmessage = () => htmx.trigger('#list', 'reload');\n</script>\n" : a.transport === 'library' ? "<script src=\"/socket.io/socket.io.js\"></script>\n<script>io().on('tasksChanged', () => htmx.trigger('#list', 'reload'));</script>\n" : a.transport === 'managed' ? "<script src=\"https://cdn.ably.com/lib/ably.min-2.js\"></script>\n<script>\n  new Ably.Realtime({ authUrl: '/api/live-token' }).channels.get('tasks').subscribe(() => htmx.trigger('#list', 'reload'));\n</script>\n" : '';
        viewItems.push({ file: 'views/index.ejs', lang: 'html', code: "<!doctype html>\n<html lang=\"en\">\n<meta charset=\"utf-8\">\n<title>Tasks</title>\n<script src=\"https://unpkg.com/htmx.org@2.0.11\"></script>\n<h1>Tasks</h1>\n" + (login ? "<form method=\"post\" action=\"/logout\"><button>Log out</button></form>\n" : '') + (a.payment ? "<form method=\"post\" action=\"/api/checkout\"><button>Buy example product</button></form>\n" : '') + "<form hx-post=\"/tasks\" hx-target=\"#list\" hx-on::after-request=\"this.reset()\">\n  <input name=\"title\" maxlength=\"200\" required>\n  <button>Add</button>\n</form>\n<div id=\"list\" hx-get=\"/tasks\" hx-trigger=\"reload\"><%- include('list', { tasks }) %></div>\n" + liveScript + "</html>\n", lines: [
          ['htmx', 'A small library that lets HTML attributes make requests and update part of the page.'],
          ['hx-post', 'Submits the form to this URL without reloading the page.'],
          ['hx-target', 'Replaces this element with the response.'],
          ['hx-on::after-request', 'Clears the form after it submits.'],
          ['include', 'Inserts another template. <code>&lt;%-</code> outputs its HTML without escaping it.']
        ].concat(a.transport ? [['hx-trigger="reload"', 'Lets the live-update script ask for a fresh list.']] : []) });
        viewItems.push({ file: 'views/list.ejs', lang: 'html', code: "<ul>\n  <% tasks.forEach((task) => { %>\n    <li>\n      <label>\n        <input type=\"checkbox\" name=\"done\" <%= task.done ? 'checked' : '' %> hx-post=\"/tasks/<%= task.id %>/toggle\" hx-target=\"#list\">\n        <%= task.title %>\n      </label>\n    </li>\n  <% }) %>\n</ul>\n", lines: [
          ['<% %>', 'Runs JavaScript without printing anything.'],
          ['<%= %>', 'Prints a value and escapes it, so a title can\'t inject HTML or scripts.']
        ] });
      }
      if (a.admin === 'in-app') {
        viewItems.push({ file: 'views/admin.ejs', lang: 'html', code: "<!doctype html>\n<html lang=\"en\">\n<meta charset=\"utf-8\">\n<title>Admin</title>\n<h1>Admin: all tasks</h1>\n<table>\n  <% tasks.forEach((task) => { %>\n    <tr>\n      <td><%= task.title %></td>\n      <td><%= task.done ? 'Done' : 'Open' %></td>\n      <td><form method=\"post\" action=\"/admin/tasks/<%= task.id %>/delete\"><button>Delete</button></form></td>\n    </tr>\n  <% }) %>\n</table>\n</html>\n", lines: [['form method="post"', 'Deleting uses POST, so a link or a search engine can\'t trigger it.'], ['/admin', 'A small page rendered by the server, whichever frontend you chose. The admin check runs on the server.']] });
      }
      sections.push({ id: 'views', title: templates ? 'Write the pages' : 'Write the admin page', items: viewItems });
    }

  }

  // ---------- Express ----------
  function express(a) {
    var sections = [];
    var spa = Kit.isSpa(a), templates = a.frontend === 'server-templates';
    var login = !!a.login, oidc = Kit.usesOidc(a);
    var needsEjs = templates || a.admin === 'in-app';
    var isRest = a.api === 'rest', isGql = a.api === 'graphql';

    sections.push({ id: 'tools', title: 'Install your tools', items: [
      { p: 'You need <a href="https://nodejs.org/en/download">Node.js</a> 22.12 or newer, which includes npm. Check it:' },
      { cmd: 'node --version\nnpm --version', lines: [['node', 'Runs JavaScript outside the browser. This is your backend\'s runtime.'], ['npm', 'Downloads libraries and runs project scripts.']] },
      { p: 'Commands assume a Unix-style terminal. On Windows, use Git Bash or WSL. Recent npm versions may warn that a package\'s install script wasn\'t approved. The packages here still worked without it, so you can ignore that warning, or read about <code>npm approve-scripts</code>.' }
    ] });

    var deps = 'express tsx' + (needsEjs ? ' ejs' : '') + (isGql ? ' graphql graphql-yoga' : '');
    sections.push({ id: 'project', title: 'Create the project', items: [
      { cmd: 'mkdir demo\ncd demo\nnpm init -y\nnpm pkg set type=module\nnpm pkg set scripts.dev="tsx watch src/server.ts"\nnpm pkg set scripts.start="tsx src/server.ts"\nnpm pkg set scripts.test="tsc --noEmit && node --import tsx --test --test-concurrency=1 \\"test/*.test.ts\\""', lines: [
        ['npm init -y', 'Creates <code>package.json</code>, which lists your libraries and scripts.'],
        ['type=module', 'Uses modern <code>import</code> statements.'],
        ['tsx', 'Runs TypeScript directly, without a separate compile step.'],
        ['tsx watch', 'Restarts the server whenever you save a file.'],
        ['scripts.test', 'First checks all types with <code>tsc</code>, then runs the tests with Node\'s built-in test runner.']
      ] },
      { cmd: 'npm install ' + deps + '\nnpm install -D typescript @types/node @types/express' + (needsEjs ? ' @types/ejs' : ''), lines: [
        ['express', 'The web framework. Version 5 passes errors from <code>async</code> handlers to its error handling automatically.'],
        ['-D', 'Development only. Types and the compiler aren\'t needed to run the app.']
      ].concat(needsEjs ? [['ejs', 'A template language that mixes HTML with small pieces of JavaScript.']] : []).concat(isGql ? [['graphql-yoga', 'A GraphQL server.']] : []) },
      { file: '.gitignore', lang: 'text', code: 'node_modules\ndist\n.env\n*.db\n', lines: [['.gitignore', 'Tells Git what to leave out. Libraries can be downloaded again, and secrets and database files should never be committed.']] },
      { file: 'tsconfig.json', lang: 'json', code: '{\n  "compilerOptions": {\n    "target": "ES2022",\n    "module": "NodeNext",\n    "moduleResolution": "NodeNext",\n    "strict": true,\n    "skipLibCheck": true,\n    "noEmit": true,\n    "allowImportingTsExtensions": true,\n    "esModuleInterop": true,\n    "types": ["node"]\n  },\n  "include": ["src", "test"]\n}\n', lines: [
        ['strict', 'Turns on TypeScript\'s stronger checks.'],
        ['NodeNext', 'Follows how Node itself finds modules.'],
        ['noEmit', 'Only checks types. <code>tsx</code> runs the code.'],
        ['skipLibCheck', 'Doesn\'t check the types inside libraries, which is faster.']
      ] }
    ] });

    sections.push({ id: 'db', title: 'Set up the database', items: Kit.dbSetup(a).concat([envItem(a)]).concat(tsData(a, 'src/')).concat(tsMigrations(a)) });

    if (login) {
      var loginItems = [];
      if (oidc) loginItems = loginItems.concat(Kit.oidcSetup(a, '/api/auth/oauth2/callback/oidc', 3000));
      loginItems.push(authPackages(a), authEnv(a), authFile(a, 'src/'), authMigrate(a, 'src/'));
      loginItems.push({ file: 'public/login.html', lang: 'html', code: loginPage(a), lines: LOGIN_LINES });
      if (!oidc) loginItems.push({ warn: 'This signs people up without confirming their email. Before you use <code>ADMIN_EMAILS</code> on a public site, <a href="https://better-auth.com/docs/concepts/email">turn on email verification</a>, so nobody can register an admin\'s address first.' });
      sections.push({ id: 'login', title: 'Add login', items: loginItems });
    }

    // Live updates
    var liveImport = '', liveAttach = '';
    if (a.transport) {
      var liveItems = [], liveCode, liveLines;
      if (a.transport === 'websocket') {
        liveItems.push({ cmd: 'npm install ws\nnpm install -D @types/ws', lines: [['ws', 'The standard WebSocket server for Node.']] });
        liveCode = "import type { Server } from 'node:http';\nimport type { Express } from 'express';\nimport { WebSocket, WebSocketServer } from 'ws';\n\nlet sockets: WebSocketServer | undefined;\n\nexport function attachLive(server: Server, _app: Express) {\n  sockets = new WebSocketServer({ server, path: '/live' });\n}\n\nexport function tasksChanged() {\n  sockets?.clients.forEach((client) => {\n    if (client.readyState === WebSocket.OPEN) client.send('changed');\n  });\n}\n";
        liveLines = [['WebSocketServer', 'Accepts WebSocket connections on the same port as your web server.'], ['tasksChanged', 'Tells every connected browser that something changed, so it reloads the list.'], ['readyState', 'Skips connections that are closing.']];
      }
      if (a.transport === 'sse') {
        liveCode = "import type { Server } from 'node:http';\nimport type { Express, Response } from 'express';\n\nconst listeners = new Set<Response>();\n\nexport function attachLive(_server: Server, app: Express) {\n  app.get('/api/live', (req, res) => {\n    res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });\n    res.flushHeaders();\n    res.write(': connected\\n\\n');\n    listeners.add(res);\n    req.on('close', () => listeners.delete(res));\n  });\n}\n\nexport function tasksChanged() {\n  listeners.forEach((res) => res.write('data: changed\\n\\n'));\n}\n";
        liveLines = [['text/event-stream', 'Tells the browser this response stays open and carries events.'], ['flushHeaders', 'Sends the headers now rather than waiting for the first event.'], ['listeners', 'Every open connection, so a change can reach them all.'], ['data: changed\\n\\n', 'The event format: a <code>data:</code> line and a blank line.'], ['req.on(\'close\')', 'Forgets a browser when it disconnects.']];
      }
      if (a.transport === 'library') {
        liveItems.push({ cmd: 'npm install socket.io', lines: [['socket.io', 'Adds reconnection and fallbacks on top of WebSockets. Browsers need its own client library.']] });
        liveCode = "import type { Server as HttpServer } from 'node:http';\nimport type { Express } from 'express';\nimport { Server } from 'socket.io';\n\nlet io: Server | undefined;\n\nexport function attachLive(server: HttpServer, _app: Express) {\n  io = new Server(server);\n}\n\nexport function tasksChanged() {\n  io?.emit('tasksChanged');\n}\n";
        liveLines = [['new Server(server)', 'Adds Socket.IO to your web server.'], ['io.emit', 'Sends a named message to every connected browser.']];
      }
      if (a.transport === 'managed') {
        liveItems.push({ p: 'Create a free <a href="https://ably.com/docs/getting-started">Ably</a> account and copy an API key.' }, { cmd: 'npm install ably', lines: [['ably', 'Ably\'s official library.']] }, { cmd: 'export ABLY_API_KEY=your-key', manual: true, lines: [['ABLY_API_KEY', 'Your secret key. It stays on the server.']] });
        liveCode = "import type { Server } from 'node:http';\nimport Ably from 'ably';\nimport type { Express } from 'express';\n\nconst rest = process.env.ABLY_API_KEY ? new Ably.Rest(process.env.ABLY_API_KEY) : undefined;\n\nexport function attachLive(_server: Server, app: Express) {\n  app.get('/api/live-token', async (_req, res) => {\n    res.json(await rest!.auth.createTokenRequest({ capability: { tasks: ['subscribe'] } }));\n  });\n}\n\nexport function tasksChanged() {\n  rest?.channels.get('tasks').publish('changed', {}).catch(console.error);\n}\n";
        liveLines = [['Ably.Rest', 'Sends messages to Ably over normal HTTP requests.'], ['createTokenRequest', 'Gives the browser a short-lived permission that can only subscribe, so your key stays secret.'], ['publish', 'Ably delivers this to every subscribed browser.']];
      }
      liveItems.push({ file: 'src/live.ts', lang: 'typescript', code: liveCode, lines: liveLines });
      if (templates) liveItems.push({ p: 'The page script in the next section reloads the list when a message arrives.' });
      sections.push({ id: 'live', title: 'Add live updates', items: liveItems });
    }

    // Payments
    if (a.payment) {
      sections.push({ id: 'pay', title: 'Add payments with ' + Kit.PAYMENT[a.payment].name, items: Kit.paymentIntro(a).concat([paymentFile(a, 'src/'), paymentTest(a, '../src/checkout.ts')]).concat(Kit.paymentOutro(a)) });
    }

    // The app
    var im = [];
    im.push("import express, { type NextFunction, type Request, type Response } from 'express';");
    if (login) { im.push("import { toNodeHandler, fromNodeHeaders } from 'better-auth/node';", "import { auth, isAdmin } from './auth.ts';"); }
    if (isGql) im.push("import { createSchema, createYoga } from 'graphql-yoga';");
    im.push("import { addTask, deleteTask, listTasks, setDone } from './tasks.ts';");
    if (a.transport) im.push("import { tasksChanged } from './live.ts';");
    if (a.payment) im.push("import { createCheckout } from './checkout.ts';");
    var notify = a.transport ? '\n    tasksChanged();' : '';
    var body = "\nexport const app = express();\n";
    if (login) body += "\napp.all('/api/auth/{*any}', toNodeHandler(auth));\n";
    body += "app.use(express.json());\napp.use(express.urlencoded({ extended: false }));\n";
    if (needsEjs) body += "app.set('view engine', 'ejs');\n";
    if (login) {
      body += "\nasync function currentUser(req: Request) {\n  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });\n  return session?.user;\n}\n\nasync function requireUser(req: Request, res: Response, next: NextFunction) {\n  if (await currentUser(req)) return next();\n  if (req.accepts('html') && req.method === 'GET' && !req.path.startsWith('/api')) return res.redirect('/login');\n  res.status(401).json({ error: 'Log in first' });\n}\n";
      body += "\napp.get('/login', (_req, res) => res.sendFile('public/login.html', { root: process.cwd() }));\napp.post('/logout', async (req, res) => {\n  const out = await auth.api.signOut({ headers: fromNodeHeaders(req.headers), asResponse: true });\n  out.headers.getSetCookie().forEach((cookie) => res.append('Set-Cookie', cookie));\n  res.redirect('/login');\n});\n";
    }
    var guard = login ? 'requireUser, ' : '';
    if (isRest) {
      body += "\napp.get('/api/tasks', " + guard + "async (_req, res) => {\n  const tasks = await listTasks();\n  res.set('Content-Range', `tasks 0-${tasks.length}/${tasks.length}`);\n  res.set('Access-Control-Expose-Headers', 'Content-Range');\n  res.json(tasks);\n});\n\napp.get('/api/tasks/:id', " + guard + "async (req, res) => {\n  const task = (await listTasks()).find((t) => t.id === String(req.params.id));\n  if (!task) return res.sendStatus(404);\n  res.json(task);\n});\n\napp.post('/api/tasks', " + guard + "async (req, res) => {\n  const title = String(req.body.title ?? '').trim();\n  if (!title || title.length > 200) return res.status(400).json({ error: 'A title of 1 to 200 characters is required' });\n  const task = await addTask(title);" + notify + "\n  res.status(201).json(task);\n});\n\napp.put('/api/tasks/:id', " + guard + "async (req, res) => {\n  await setDone(String(req.params.id), Boolean(req.body.done));" + notify + "\n  res.json((await listTasks()).find((t) => t.id === String(req.params.id)) ?? null);\n});\n";
    }
    if (isGql) {
      body += "\nconst yoga = createYoga({\n  schema: createSchema({\n    typeDefs: `\n      type Task { id: ID! title: String! done: Boolean! }\n      type Query { tasks: [Task!]! }\n      type Mutation {\n        addTask(title: String!): Task!\n        setDone(id: ID!, done: Boolean!): Boolean!\n      }\n    `,\n    resolvers: {\n      Query: { tasks: () => listTasks() },\n      Mutation: {\n        addTask: async (_: unknown, args: { title: string }) => {\n          const task = await addTask(args.title);" + (a.transport ? '\n          tasksChanged();' : '') + "\n          return task;\n        },\n        setDone: async (_: unknown, args: { id: string; done: boolean }) => {\n          await setDone(args.id, args.done);" + (a.transport ? '\n          tasksChanged();' : '') + "\n          return true;\n        },\n      },\n    },\n  }),\n});\napp.use(yoga.graphqlEndpoint, " + guard + "yoga);\n";
    }
    if (templates) {
      body += "\nconst listOnly = (tasks: unknown, res: Response) => res.render('list', { tasks });\n\napp.get('/', " + guard + "async (_req, res) => {\n  res.render('index', { tasks: await listTasks() });\n});\n\napp.get('/tasks', " + guard + "async (_req, res) => {\n  listOnly(await listTasks(), res);\n});\n\napp.post('/tasks', " + guard + "async (req, res) => {\n  const title = String(req.body.title ?? '').trim();\n  if (title && title.length <= 200) {\n    await addTask(title);" + notify + "\n  }\n  listOnly(await listTasks(), res);\n});\n\napp.post('/tasks/:id/toggle', " + guard + "async (req, res) => {\n  await setDone(String(req.params.id), req.body.done === 'on');" + notify + "\n  listOnly(await listTasks(), res);\n});\n";
    }
    if (a.admin === 'in-app') {
      body += "\nasync function requireAdmin(req: Request, res: Response, next: NextFunction) {\n  const user = await currentUser(req);\n  if (!user) return res.redirect('/login');\n  if (!isAdmin(user.email)) return res.sendStatus(403);\n  next();\n}\n\napp.get('/admin', requireAdmin, async (_req, res) => {\n  res.render('admin', { tasks: await listTasks() });\n});\n\napp.post('/admin/tasks/:id/delete', requireAdmin, async (req, res) => {\n  await deleteTask(String(req.params.id));" + notify + "\n  res.redirect('/admin');\n});\n";
    }
    if (a.admin === 'react-admin') {
      body += "\napp.delete('/api/tasks/:id', requireUser, async (req, res) => {\n  const user = await currentUser(req);\n  if (!user || !isAdmin(user.email)) return res.sendStatus(403);\n  await deleteTask(String(req.params.id));" + notify + "\n  res.json({ id: String(req.params.id) });\n});\n";
    }
    if (a.payment) {
      body += "\napp.post('/api/checkout', " + guard + "async (req, res) => {\n  const baseUrl = process.env.PUBLIC_URL ?? `${req.protocol}://${req.get('host')}`;\n  res.redirect(303, await createCheckout(baseUrl));\n});\n";
    }
    if (spa) body += "\napp.use(express.static('" + Kit.spaDistPath(a) + "'));\n";
    body += "\napp.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {\n  console.error(error);\n  res.status(500).json({ error: 'Something went wrong' });\n});\n";

    if (!isRest && !isGql && !templates) body = body; // Every route has at least one of these.
    var appLines = [
      ['express()', 'Creates the app. Exporting it lets tests use it without opening a fixed port.']
    ].concat(login ? [
      ["app.all('/api/auth/{*any}')", 'Gives Better Auth its routes. <code>{*any}</code> is Express 5\'s wildcard syntax. It comes before <code>express.json()</code>, because Better Auth reads the request body itself.'],
      ['currentUser', 'Reads the session from the cookie. It returns nothing if the visitor isn\'t logged in.'],
      ['requireUser', 'Middleware: code that runs before a route. <code>next()</code> continues to the route, and sending a response stops there.'],
      ['/logout', 'Ends the session and clears the cookie. It\'s a POST so other sites can\'t log someone out with a link.']
    ] : []).concat([
      ['express.json()', 'Reads JSON request bodies into <code>req.body</code>.'],
      ['express.urlencoded', 'Reads normal HTML form posts into <code>req.body</code>.']
    ]).concat(isRest ? [
      ["app.get('/api/tasks')", 'Runs when a browser requests this path with GET, and returns JSON.'],
      ['Content-Range', 'Tells clients how many rows exist. React-admin needs this.'],
      ['req.params.id', 'The <code>:id</code> part of the URL. <code>String(...)</code> satisfies TypeScript, which can type it as a list when middleware runs first.'],
      ['status(201)', 'The standard status for &quot;created&quot;.'],
      ['title.length > 200', 'Never trust input. This rejects anything the database wouldn\'t accept.']
    ] : []).concat(isGql ? [
      ['createSchema', 'Defines what clients can ask for (<code>typeDefs</code>) and the code that answers (<code>resolvers</code>).'],
      ['ID!', 'The <code>!</code> means the value is never null.'],
      ['app.use(yoga.graphqlEndpoint', 'Mounts GraphQL at <code>/graphql</code>.']
    ] : []).concat(templates ? [
      ['res.render', 'Fills in a template and sends the HTML.'],
      ["res.render('list')", 'Returns only the list, because htmx swaps just that part of the page.'],
      ["req.body.done === 'on'", 'A checked checkbox sends <code>on</code>, and an unchecked one sends nothing.']
    ] : []).concat(a.admin === 'in-app' ? [
      ['requireAdmin', 'Checks on the server. Hiding a link isn\'t protection, because anyone can type a URL.'],
      ['sendStatus(403)', 'Means logged in, but not allowed.'],
      ['res.redirect', 'Sends the browser to another page after the change, so refreshing doesn\'t repeat it.']
    ] : []).concat(a.admin === 'react-admin' ? [['app.delete', 'Only admins can delete. React-admin\'s delete button calls this.']] : []).concat(a.payment ? [
      ['PUBLIC_URL', 'Your site\'s real address. Set this in production, because the <code>Host</code> header can be forged.']
    ] : []).concat(spa ? [['express.static', 'Serves your built frontend from the same server in production.']] : []).concat([
      ['error handler', 'The function with four parameters catches anything thrown by routes. It logs the detail and doesn\'t show it to the visitor.']
    ]);
    var appItems = [{ file: 'src/app.ts', lang: 'typescript', code: im.join('\n') + '\n' + body, lines: appLines }];
    appItems.push({ file: 'src/server.ts', lang: 'typescript', code: "import { app } from './app.ts';\n" + (a.transport ? "import { attachLive } from './live.ts';\n" : '') + "\nconst port = Number(process.env.PORT ?? 3000);\n" + (a.transport && a.transport !== 'websocket' && a.transport !== 'library' ? "attachLive(undefined as never, app);\n" : '') + "const server = app.listen(port, () => {\n  console.log(`Listening on http://localhost:${port}`);\n});\n" + (a.transport === 'websocket' || a.transport === 'library' ? "attachLive(server, app);\n" : ''), lines: [['process.env.PORT', 'Hosting platforms choose the port and pass it this way. 3000 is the default for your own machine.'], ['app.listen', 'Starts accepting requests.']].concat(a.transport ? [['attachLive', 'Adds live updates to the running server.']] : []) });
    sections.push({ id: 'app', title: 'Write the app', items: appItems });

    ejsViews(a, sections);
    if (spa) sections.push({ id: 'frontend', title: 'Build the frontend', items: Kit.spaItems(a, 3000) });
    if (a.admin === 'react-admin') sections.push({ id: 'admin', title: 'Add the admin app', items: Kit.reactAdminItems(a, 3000) });
    if (a.admin === 'low-code') sections.push({ id: 'admin', title: 'Add the admin tool', items: Kit.lowCodeItems(a) });

    // Tests
    var unauth = login;
    var tcode = "import assert from 'node:assert/strict';\nimport type { AddressInfo } from 'node:net';\nimport { after, before, test } from 'node:test';\nimport { app } from '../src/app.ts';\nimport { addTask, closeDb, listTasks, setDone } from '../src/tasks.ts';\n\nlet base = '';\nlet server: ReturnType<typeof app.listen>;\n\nbefore(() => {\n  server = app.listen(0);\n  base = 'http://localhost:' + (server.address() as AddressInfo).port;\n});\n\nafter(async () => {\n  server.closeAllConnections();\n  server.close();\n  await closeDb();\n  setTimeout(() => process.exit(), 500).unref();\n});\n\ntest('the data layer saves and changes a task', async () => {\n  const task = await addTask('From the test');\n  await setDone(task.id, true);\n  const saved = (await listTasks()).find((t) => t.id === task.id);\n  assert.equal(saved?.done, true);\n});\n";
    if (unauth) {
      var probe = isRest ? "base + '/api/tasks'" : isGql ? "base + '/graphql'" : "base + '/tasks'";
      tcode += "\ntest('logged-out visitors are blocked', async () => {\n  const res = await fetch(" + probe + ", { redirect: 'manual', method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: '{}' });\n  assert.equal(res.status, 401);\n});\n";
    } else if (isRest) {
      tcode += "\ntest('the REST API adds and lists tasks', async () => {\n  const created = await fetch(base + '/api/tasks', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ title: 'Through the API' }),\n  });\n  assert.equal(created.status, 201);\n  const task = await created.json();\n  const changed = await fetch(base + '/api/tasks/' + task.id, {\n    method: 'PUT',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ done: true }),\n  });\n  assert.equal((await changed.json()).done, true);\n  const list = await fetch(base + '/api/tasks');\n  assert.ok(list.headers.get('content-range'));\n  assert.ok((await list.json()).some((t: { id: string }) => t.id === task.id));\n});\n\ntest('an empty title is rejected', async () => {\n  const res = await fetch(base + '/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });\n  assert.equal(res.status, 400);\n});\n";
    } else if (isGql) {
      tcode += "\ntest('GraphQL adds and lists tasks', async () => {\n  const send = (query: string) => fetch(base + '/graphql', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) }).then((r) => r.json());\n  const added = await send('mutation { addTask(title: \"Through GraphQL\") { id } }');\n  assert.ok(added.data.addTask.id);\n  const list = await send('{ tasks { id title done } }');\n  assert.ok(list.data.tasks.some((t: { title: string }) => t.title === 'Through GraphQL'));\n});\n";
    }
    if (templates && !unauth) {
      tcode += "\ntest('the page shows tasks and escapes titles', async () => {\n  await fetch(base + '/tasks', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'title=' + encodeURIComponent('<b>From a form</b>') });\n  const html = await (await fetch(base + '/')).text();\n  assert.ok(html.includes('&lt;b&gt;From a form&lt;/b&gt;'));\n});\n";
    }
    if (a.admin === 'in-app') tcode += "\ntest('the admin page needs a login', async () => {\n  const res = await fetch(base + '/admin', { redirect: 'manual' });\n  assert.equal(res.status, 302);\n});\n";
    if (a.transport === 'sse') tcode += "\n";
    sections.push({ id: 'test', title: 'Test it', items: [
      { file: 'test/app.test.ts', lang: 'typescript', code: tcode, lines: [
        ['app.listen(0)', 'Port 0 asks the system for any free port, so tests never clash with a running server.'],
        ['test', 'Node\'s built-in test runner, so there is nothing extra to install.'],
        ['fetch', 'Makes real HTTP requests to your app.'],
        ['closeAllConnections', 'Lets the test process finish cleanly.'], ['setTimeout(...).unref()', 'Ends the test process if a library still holds a connection open, such as the login library\'s database pool. <code>unref</code> means this timer alone won\'t keep it running.']
      ] },
      { cmd: 'npm test', lines: [['npm test', 'Checks all types, then runs the tests. Tests use whichever database <code>DATABASE_URL</code> points at, so use a development database.']] },
      { p: 'Then start it with the command below and open <code>http://localhost:3000</code>.' + (spa ? ' For the frontend, also run <code>npm run dev</code> inside <code>web</code>, and open the address it prints.' : '') },
      { cmd: 'npm run dev', manual: true, lines: [['npm run dev', 'Starts the server and restarts it when you save a file. Press Ctrl+C to stop it.']] }
    ] });

    var envList = ['DATABASE_URL'];
    if (login) envList.push('BETTER_AUTH_SECRET', 'BETTER_AUTH_URL', 'ADMIN_EMAILS');
    if (oidc) envList.push('OIDC_ISSUER', 'OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET');
    if (a.transport === 'managed') envList.push('ABLY_API_KEY');
    if (a.payment) { envList.push('PUBLIC_URL'); Kit.PAYMENT[a.payment].env.forEach(function (e) { envList.push(e[0]); }); }
    var spaBuild = spa ? "FROM node:24-slim AS frontend\nWORKDIR /web\nCOPY web/package*.json ./\nRUN npm ci\nCOPY web/ ./\nRUN npm run build\n\n" : '';
    var docker = spaBuild + "FROM node:24-slim\nWORKDIR /app\nENV NODE_ENV=production\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY . .\n" + (spa ? "COPY --from=frontend /web/dist ./web/dist\n" : '') + "USER node\nEXPOSE 3000\nCMD [\"npx\", \"tsx\", \"src/server.ts\"]\n";
    sections.push({ id: 'deploy', title: 'Deploy it', items: Kit.hostingItems(a, { port: 3000, env: envList, dockerfile: docker, dockerignore: 'node_modules\nweb/node_modules\nweb/dist\nadmin/node_modules\n.git\n.env\n*.db\n', dockerLines: [
      ['node:24-slim', 'A small official image with Node 24.'],
      ['npm ci', 'Installs exactly what <code>package-lock.json</code> lists. <code>--omit=dev</code> leaves out development tools.']
    ].concat(spa ? [['AS frontend', 'A first stage builds the frontend, and only its finished files are copied into the final image.']] : []).concat([
      ['USER node', 'Runs as a limited user rather than as root.'],
      ['CMD', 'What runs when the container starts.']
    ]) }) });
    return sections;
  }
  Kit.frameworks.express = express;

  // ---------- Next.js ----------
  function nextjs(a) {
    var sections = [];
    var login = !!a.login, oidc = Kit.usesOidc(a), isGql = a.api === 'graphql';
    sections.push({ id: 'tools', title: 'Install your tools', items: [
      { p: 'You need <a href="https://nodejs.org/en/download">Node.js</a> 20.9 or newer, which includes npm.' + (a.migrations === 'node-pg-migrate' ? ' node-pg-migrate needs 22.12 or newer.' : '') + ' Commands assume a Unix-style terminal. On Windows, use Git Bash or WSL.' },
      { cmd: 'node --version\nnpm --version', lines: [['node', 'Runs JavaScript outside the browser. Next.js runs on it.'], ['npm', 'Downloads libraries and runs project scripts.']] }
    ] });
    var external = { prisma: "'@prisma/client'", typeorm: "'typeorm', 'pg', 'mysql2', 'mssql', 'better-sqlite3'", drizzle: "'better-sqlite3', 'pg', 'mysql2'", kysely: "'better-sqlite3', 'pg', 'mysql2', 'tedious'" }[a.data] || "'mongodb'";
    if (login) external += ", 'better-auth'";
    sections.push({ id: 'project', title: 'Create the project', items: [
      { cmd: 'npx --yes create-next-app@latest demo --yes --no-tailwind --no-agents-md\ncd demo\nnpm pkg set scripts.test="tsc --noEmit && node --import tsx --test --test-concurrency=1 \\"test/*.test.ts\\""\nnpm install -D tsx', lines: [
        ['create-next-app', 'Creates a Next.js project.'],
        ['--yes', 'Accepts the defaults: TypeScript, ESLint and the App Router.'],
        ['--no-tailwind', 'Leaves out Tailwind CSS, because this guide adds no styling. You can add it later.'],
        ['--no-agents-md', 'Leaves out the instructions file for AI coding tools.'],
        ['tsx', 'Runs TypeScript tests directly, using Node\'s built-in test runner.']
      ] },
      { file: '.gitignore', append: true, lang: 'text', code: NL_DB, lines: [['*.db', 'Add this line to the generated <code>.gitignore</code>, so a SQLite database file is never committed.']] },
      { file: 'next.config.ts', lang: 'typescript', code: "import type { NextConfig } from 'next';\n\nconst nextConfig: NextConfig = {\n  serverExternalPackages: [" + external + "],\n};\n\nexport default nextConfig;\n", lines: [['serverExternalPackages', 'Loads these database libraries normally on the server instead of bundling them, which many of them need.']] }
    ] });
    sections.push({ id: 'db', title: 'Set up the database', items: Kit.dbSetup(a).concat([envItem(a), { p: 'Next.js also reads <code>.env.local</code> when it starts. Put <code>DATABASE_URL</code> there for everyday work, and keep that file out of Git.' }]).concat(tsData(a, 'lib/')).concat(tsMigrations(a)) });

    if (login) {
      var items = [];
      if (oidc) items = items.concat(Kit.oidcSetup(a, '/api/auth/oauth2/callback/oidc', 3000));
      items.push(authPackages(a), authEnv(a), authFile(a, 'lib/'), authMigrate(a, 'lib/'));
      items.push({ file: 'app/api/auth/[...all]/route.ts', lang: 'typescript', code: "import { toNextJsHandler } from 'better-auth/next-js';\nimport { auth } from '@/lib/auth';\n\nexport const { GET, POST } = toNextJsHandler(auth);\n", lines: [['[...all]', 'A catch-all route: every path under <code>/api/auth</code> comes here.'], ['toNextJsHandler', 'Lets Better Auth answer those requests.']] });
      items.push({ file: 'lib/session.ts', lang: 'typescript', code: "import { headers } from 'next/headers';\nimport { auth, isAdmin } from '@/lib/auth';\n\nexport async function currentUser() {\n  const session = await auth.api.getSession({ headers: await headers() });\n  return session?.user;\n}\n\nexport async function currentAdmin() {\n  const user = await currentUser();\n  return user && isAdmin(user.email) ? user : undefined;\n}\n", lines: [['headers()', 'Reads the current request. It\'s async in current Next.js.'], ['currentUser', 'Gets the user from the session cookie, or nothing if logged out. Every route and page that needs a login calls this, close to the data, as the Next.js docs recommend.']] });
      items.push({ file: 'public/login.html', lang: 'html', code: loginPage(a), lines: LOGIN_LINES.concat([['public/', 'Files here are served as they are, so this page is at <code>/login.html</code>.']]) });
      if (!oidc) items.push({ warn: 'This signs people up without confirming their email. Before you use <code>ADMIN_EMAILS</code> on a public site, <a href="https://better-auth.com/docs/concepts/email">turn on email verification</a>, so nobody can register an admin\'s address first.' });
      sections.push({ id: 'login', title: 'Add login', items: items });
    }

    var deny = login ? "  if (!(await currentUser())) return Response.json({ error: 'Log in first' }, { status: 401 });\n" : '';
    var sessionImport = login ? "import { currentUser } from '@/lib/session';\n" : '';
    var notify = a.transport ? "\n  await tasksChanged();" : '';
    var liveImport = a.transport ? "import { tasksChanged } from '@/lib/live';\n" : '';

    // Live updates
    if (a.transport) {
      var live = [];
      if (a.transport === 'sse') {
        live.push({ file: 'lib/live.ts', lang: 'typescript', code: "const listeners = ((globalThis as unknown as { taskListeners?: Set<() => void> }).taskListeners ??= new Set());\n\nexport function listen(run: () => void) {\n  listeners.add(run);\n  return () => listeners.delete(run);\n}\n\nexport async function tasksChanged() {\n  listeners.forEach((run) => run());\n}\n", lines: [['globalThis', 'Keeps one shared list even when Next.js loads this file separately for different routes.'], ['listen', 'Registers a function to call on each change, and returns a way to remove it.']] });
        live.push({ file: 'app/api/live/route.ts', lang: 'typescript', code: "import { listen } from '@/lib/live';\n\nexport const dynamic = 'force-dynamic';\n\nexport async function GET(request: Request) {\n  const encoder = new TextEncoder();\n  const stream = new ReadableStream({\n    start(controller) {\n      controller.enqueue(encoder.encode(': connected\\n\\n'));\n      const stop = listen(() => controller.enqueue(encoder.encode('data: changed\\n\\n')));\n      request.signal.addEventListener('abort', () => {\n        stop();\n        controller.close();\n      });\n    },\n  });\n  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } });\n}\n", lines: [['force-dynamic', 'Stops Next.js from trying to prerender this route.'], ['ReadableStream', 'A response that keeps sending data over time.'], ['request.signal', 'Fires when the browser disconnects, so the listener can be removed.']] });
        live.push({ warn: 'This keeps listeners in one server process. It works on one server, not on serverless hosting or several copies. Use a managed service for those.' });
      }
      if (a.transport === 'websocket' || a.transport === 'library') {
        var isIo = a.transport === 'library';
        live.push({ p: 'Next.js route handlers can\'t hold WebSocket connections, so this runs a small second server next to your app.' });
        live.push({ cmd: isIo ? 'npm install socket.io socket.io-client' : 'npm install ws\nnpm install -D @types/ws', lines: isIo ? [['socket.io', 'The server library.'], ['socket.io-client', 'The browser library.']] : [['ws', 'The standard WebSocket server for Node.']] });
        live.push({ file: 'live-server.ts', lang: 'typescript', code: isIo
          ? "import { createServer } from 'node:http';\nimport { Server } from 'socket.io';\n\nconst server = createServer((req, res) => {\n  if (req.method === 'POST' && req.url === '/notify' && req.headers['x-live-key'] === process.env.LIVE_KEY) {\n    io.emit('tasksChanged');\n    res.writeHead(204).end();\n  } else {\n    res.writeHead(404).end();\n  }\n});\nconst io = new Server(server, { cors: { origin: process.env.SITE_URL ?? 'http://localhost:3000' } });\nserver.listen(3001);\n"
          : "import { createServer } from 'node:http';\nimport { WebSocket, WebSocketServer } from 'ws';\n\nconst server = createServer((req, res) => {\n  if (req.method === 'POST' && req.url === '/notify' && req.headers['x-live-key'] === process.env.LIVE_KEY) {\n    sockets.clients.forEach((client) => {\n      if (client.readyState === WebSocket.OPEN) client.send('changed');\n    });\n    res.writeHead(204).end();\n  } else {\n    res.writeHead(404).end();\n  }\n});\nconst sockets = new WebSocketServer({ server });\nserver.listen(3001);\n", lines: [['/notify', 'Your Next.js app calls this after a change, and this server tells the browsers.'], ['x-live-key', 'A shared secret, so strangers can\'t send messages to your users.'], ['3001', 'A separate port for this server.']] });
        live.push({ file: 'lib/live.ts', lang: 'typescript', code: "export async function tasksChanged() {\n  await fetch((process.env.LIVE_URL ?? 'http://localhost:3001') + '/notify', {\n    method: 'POST',\n    headers: { 'x-live-key': process.env.LIVE_KEY ?? '' },\n  }).catch(console.error);\n}\n", lines: [['.catch', 'A live-update failure shouldn\'t fail the user\'s request, so it\'s only logged.']] });
        live.push({ cmd: 'export LIVE_KEY="$(openssl rand -hex 16)"\nnpx tsx live-server.ts', manual: true, lines: [['npx tsx live-server.ts', 'Starts the second server. Keep it running in its own terminal, and set the same <code>LIVE_KEY</code> in both.']] });
      }
      if (a.transport === 'managed') {
        live.push({ p: 'Create a free <a href="https://ably.com/docs/getting-started">Ably</a> account and copy an API key.' }, { cmd: 'npm install ably', lines: [['ably', 'Ably\'s official library.']] }, { cmd: 'export ABLY_API_KEY=your-key', manual: true, lines: [['ABLY_API_KEY', 'Your secret key. It stays on the server.']] });
        live.push({ file: 'lib/live.ts', lang: 'typescript', code: "import Ably from 'ably';\n\nconst rest = process.env.ABLY_API_KEY ? new Ably.Rest(process.env.ABLY_API_KEY) : undefined;\n\nexport async function tasksChanged() {\n  await rest?.channels.get('tasks').publish('changed', {}).catch(console.error);\n}\n\nexport async function liveToken() {\n  return rest!.auth.createTokenRequest({ capability: { tasks: ['subscribe'] } });\n}\n", lines: [['Ably.Rest', 'Sends messages to Ably over normal HTTP requests, which suits serverless hosting.'], ['createTokenRequest', 'Gives the browser a short-lived permission that can only subscribe.']] });
        live.push({ file: 'app/api/live-token/route.ts', lang: 'typescript', code: "import { liveToken } from '@/lib/live';\n\nexport const dynamic = 'force-dynamic';\n\nexport async function GET() {\n  return Response.json(await liveToken());\n}\n", lines: [['force-dynamic', 'Creates a fresh token per request.']] });
      }
      sections.push({ id: 'live', title: 'Add live updates', items: live });
    }

    // API
    var apiItems = [];
    if (isGql) {
      apiItems.push({ cmd: 'npm install graphql graphql-yoga', lines: [['graphql-yoga', 'A GraphQL server that works with Next.js route handlers.']] });
      apiItems.push({ file: 'app/api/graphql/route.ts', lang: 'typescript', code: "import { createSchema, createYoga } from 'graphql-yoga';\nimport { addTask, listTasks, setDone } from '@/lib/tasks';\n" + sessionImport + liveImport + "\nconst { handleRequest } = createYoga({\n  schema: createSchema({\n    typeDefs: `\n      type Task { id: ID! title: String! done: Boolean! }\n      type Query { tasks: [Task!]! }\n      type Mutation {\n        addTask(title: String!): Task!\n        setDone(id: ID!, done: Boolean!): Boolean!\n      }\n    `,\n    resolvers: {\n      Query: { tasks: () => listTasks() },\n      Mutation: {\n        addTask: async (_: unknown, args: { title: string }) => {\n          const task = await addTask(args.title);" + notify.replace('\n  ', '\n          ') + "\n          return task;\n        },\n        setDone: async (_: unknown, args: { id: string; done: boolean }) => {\n          await setDone(args.id, args.done);" + notify.replace('\n  ', '\n          ') + "\n          return true;\n        },\n      },\n    },\n  }),\n  graphqlEndpoint: '/api/graphql',\n  fetchAPI: { Response },\n});\n\nasync function handle(request: Request, context: object) {\n" + deny + "  return handleRequest(request as never, context as never);\n}\n\nexport { handle as GET, handle as POST };\n", lines: [
        ['createSchema', 'Defines what clients can ask for (<code>typeDefs</code>) and the code that answers (<code>resolvers</code>).'],
        ['graphqlEndpoint', 'Must match this file\'s path.'],
        ['handle', 'Wraps Yoga, so the login check runs first and every operation is protected.']
      ] });
    } else {
      apiItems.push({ file: 'app/api/tasks/route.ts', lang: 'typescript', code: "import { addTask, listTasks } from '@/lib/tasks';\n" + sessionImport + liveImport + "\nexport const dynamic = 'force-dynamic';\n\nexport async function GET() {\n" + deny + "  const tasks = await listTasks();\n  return Response.json(tasks, {\n    headers: { 'Content-Range': `tasks 0-${tasks.length}/${tasks.length}`, 'Access-Control-Expose-Headers': 'Content-Range' },\n  });\n}\n\nexport async function POST(request: Request) {\n" + deny + "  const body = await request.json().catch(() => ({}));\n  const title = String(body.title ?? '').trim();\n  if (!title || title.length > 200) return Response.json({ error: 'A title of 1 to 200 characters is required' }, { status: 400 });\n  const task = await addTask(title);" + notify + "\n  return Response.json(task, { status: 201 });\n}\n", lines: [
        ['route.ts', 'A file with this name inside <code>app/</code> handles requests for that path, so this one is <code>/api/tasks</code>.'],
        ['GET and POST', 'Each exported function handles one HTTP method.'],
        ['force-dynamic', 'Runs the handler per request, rather than caching a result.'],
        ['Response.json', 'The web standard way to return JSON.'],
        ['title.length > 200', 'Never trust input. This rejects anything the database wouldn\'t accept.']
      ] });
      apiItems.push({ file: 'app/api/tasks/[id]/route.ts', lang: 'typescript', code: "import { listTasks, setDone" + (a.admin === 'react-admin' ? ', deleteTask' : '') + " } from '@/lib/tasks';\n" + (login ? "import { currentUser" + (a.admin === 'react-admin' ? ', currentAdmin' : '') + " } from '@/lib/session';\n" : '') + liveImport + "\ntype Context = { params: Promise<{ id: string }> };\n\nexport async function GET(_request: Request, context: Context) {\n" + deny + "  const { id } = await context.params;\n  const task = (await listTasks()).find((t) => t.id === id);\n  return task ? Response.json(task) : new Response(null, { status: 404 });\n}\n\nexport async function PUT(request: Request, context: Context) {\n" + deny + "  const { id } = await context.params;\n  const body = await request.json();\n  await setDone(id, Boolean(body.done));" + notify + "\n  return Response.json((await listTasks()).find((t) => t.id === id) ?? null);\n}\n" + (a.admin === 'react-admin' ? "\nexport async function DELETE(_request: Request, context: Context) {\n  if (!(await currentAdmin())) return new Response(null, { status: 403 });\n  const { id } = await context.params;\n  await deleteTask(id);" + notify + "\n  return Response.json({ id });\n}\n" : ''), lines: [
        ['[id]', 'A folder in brackets captures that part of the URL.'],
        ['context.params', 'A promise in current Next.js, so it needs <code>await</code>.'],
      ].concat(a.admin === 'react-admin' ? [['DELETE', 'Only admins can delete. React-admin\'s delete button calls this.']] : []) });
    }
    sections.push({ id: 'api', title: 'Write the API', items: apiItems });

    // Payments
    if (a.payment) {
      var pay = Kit.paymentIntro(a).concat([paymentFile(a, 'lib/')]);
      pay.push({ file: 'app/api/checkout/route.ts', lang: 'typescript', code: "import { createCheckout } from '@/lib/checkout';\n" + sessionImport + "\nexport async function POST(request: Request) {\n" + deny + "  const baseUrl = process.env.PUBLIC_URL ?? new URL(request.url).origin;\n  return Response.json({ url: await createCheckout(baseUrl) });\n}\n", lines: [['PUBLIC_URL', 'Your site\'s real address. Set this in production.'], ['createCheckout', 'Asks the provider for a payment page, and returns its address for the browser to open.']] });
      pay.push(paymentTest(a, '../lib/checkout'));
      sections.push({ id: 'pay', title: 'Add payments with ' + Kit.PAYMENT[a.payment].name, items: pay.concat(Kit.paymentOutro(a)) });
    }

    // Page
    var clientApi = isGql
      ? "async function gql(query: string, variables: object = {}) {\n  const res = await fetch('/api/graphql', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ query, variables }),\n  });" + (login ? "\n  if (res.status === 401) location.href = '/login.html';" : '') + "\n  return (await res.json()).data;\n}\n\nconst listTasks = async (): Promise<Task[]> => (await gql('{ tasks { id title done } }')).tasks;\nconst addTask = (title: string) => gql('mutation ($title: String!) { addTask(title: $title) { id } }', { title });\nconst setDone = (id: string, done: boolean) => gql('mutation ($id: ID!, $done: Boolean!) { setDone(id: $id, done: $done) }', { id, done });\n"
      : "async function send(path: string, method = 'GET', body?: object) {\n  const res = await fetch(path, {\n    method,\n    headers: body ? { 'Content-Type': 'application/json' } : undefined,\n    body: body ? JSON.stringify(body) : undefined,\n  });" + (login ? "\n  if (res.status === 401) location.href = '/login.html';" : '') + "\n  return res.json();\n}\n\nconst listTasks = (): Promise<Task[]> => send('/api/tasks');\nconst addTask = (title: string) => send('/api/tasks', 'POST', { title });\nconst setDone = (id: string, done: boolean) => send('/api/tasks/' + id, 'PUT', { done });\n";
    var liveEffect = { websocket: "\n    const socket = new WebSocket('ws://' + location.hostname + ':3001');\n    socket.onmessage = load;\n    return () => socket.close();", sse: "\n    const events = new EventSource('/api/live');\n    events.onmessage = load;\n    return () => events.close();", library: "\n    const socket = io('http://' + location.hostname + ':3001');\n    socket.on('tasksChanged', load);\n    return () => { socket.close(); };", managed: "\n    const client = new Ably.Realtime({ authUrl: '/api/live-token' });\n    client.channels.get('tasks').subscribe(load);\n    return () => client.close();" }[a.transport] || '';
    var liveClientImport = { library: "import { io } from 'socket.io-client';\n", managed: "import * as Ably from 'ably';\n" }[a.transport] || '';
    var payButton = a.payment ? "\n      <button onClick={async () => {\n        const res = await fetch('/api/checkout', { method: 'POST' });\n        location.href = (await res.json()).url;\n      }}>Buy example product</button>" : '';
    var logout = login ? "\n      <button onClick={async () => {\n        await fetch('/api/auth/sign-out', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });\n        location.href = '/login.html';\n      }}>Log out</button>" : '';
    var pageItems = [{ file: 'app/page.tsx', lang: 'tsx', code: "'use client';\n\nimport { useEffect, useState, type FormEvent } from 'react';\n" + liveClientImport + "\ntype Task = { id: string; title: string; done: boolean };\n\n" + clientApi + "\nexport default function Page() {\n  const [tasks, setTasks] = useState<Task[]>([]);\n  const [title, setTitle] = useState('');\n\n  const load = () => {\n    listTasks().then(setTasks);\n  };\n\n  useEffect(() => {\n    load();" + liveEffect + "\n  }, []);\n\n  async function submit(event: FormEvent) {\n    event.preventDefault();\n    await addTask(title);\n    setTitle('');\n    load();\n  }\n\n  return (\n    <main>\n      <h1>Tasks</h1>" + logout + payButton + "\n      <form onSubmit={submit}>\n        <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />\n        <button>Add</button>\n      </form>\n      <ul>\n        {tasks.map((task) => (\n          <li key={task.id}>\n            <label>\n              <input\n                type=\"checkbox\"\n                checked={task.done}\n                onChange={async (e) => {\n                  await setDone(task.id, e.target.checked);\n                  load();\n                }}\n              />\n              {task.title}\n            </label>\n          </li>\n        ))}\n      </ul>\n    </main>\n  );\n}\n", lines: [
      ["'use client'", 'Makes this a component that runs in the browser, because it needs state and event handlers.'],
      ['useState', 'Holds a value in the component. Changing it redraws the page.'],
      ['useEffect', 'Runs after the first draw. The empty <code>[]</code> means only once. This loads the tasks.' + (a.transport ? ' It also opens the live connection, and the function it returns closes it.' : '')],
      ['event.preventDefault()', 'Stops the browser from reloading the page when the form submits.'],
      ['value and onChange', 'Keeps the text box and <code>title</code> in step.'],
      ['tasks.map', 'Turns each task into a list item. <code>key</code> lets React update the right one.']
    ] }];
    sections.push({ id: 'page', title: 'Write the page', items: pageItems });

    // Admin
    if (a.admin === 'in-app') {
      sections.push({ id: 'admin', title: 'Add the admin page', items: [
        { file: 'app/admin/page.tsx', lang: 'tsx', code: "import { revalidatePath } from 'next/cache';\nimport { redirect } from 'next/navigation';\nimport { currentAdmin, currentUser } from '@/lib/session';\nimport { deleteTask, listTasks } from '@/lib/tasks';\n\nexport const dynamic = 'force-dynamic';\n\nasync function remove(formData: FormData) {\n  'use server';\n  if (!(await currentAdmin())) throw new Error('Admins only');\n  await deleteTask(String(formData.get('id')));\n  revalidatePath('/admin');\n}\n\nexport default async function AdminPage() {\n  if (!(await currentUser())) redirect('/login.html');\n  if (!(await currentAdmin())) return <p>You need an admin account.</p>;\n  const tasks = await listTasks();\n  return (\n    <main>\n      <h1>Admin: all tasks</h1>\n      <table>\n        <tbody>\n          {tasks.map((task) => (\n            <tr key={task.id}>\n              <td>{task.title}</td>\n              <td>{task.done ? 'Done' : 'Open'}</td>\n              <td>\n                <form action={remove}>\n                  <input type=\"hidden\" name=\"id\" value={task.id} />\n                  <button>Delete</button>\n                </form>\n              </td>\n            </tr>\n          ))}\n        </tbody>\n      </table>\n    </main>\n  );\n}\n", lines: [
          ['Server component', 'This file has no <code>\'use client\'</code>, so it runs on the server and can read the database directly. The browser only gets the HTML.'],
          ["'use server'", 'Makes <code>remove</code> a Server Action: a form can call it, and it runs on the server.'],
          ['currentAdmin inside remove', 'Server Actions can be called directly, like any public endpoint, so they need their own check.'],
          ['revalidatePath', 'Tells Next.js to redraw the page with fresh data.']
        ] }
      ] });
    }
    if (a.admin === 'react-admin') sections.push({ id: 'admin', title: 'Add the admin app', items: [{ cmd: 'cd ..', lines: [['cd ..', 'Goes up one level. Next.js type-checks every folder inside its project, so the admin app sits beside it instead.']] }].concat(Kit.reactAdminItems(a, 3000)).concat([{ cmd: 'cd demo', lines: [['cd demo', 'Goes back into your Next.js project.']] }]) });
    if (a.admin === 'low-code') sections.push({ id: 'admin', title: 'Add the admin tool', items: Kit.lowCodeItems(a) });

    // Tests run against a real production build.
    var testBody;
    if (login) {
      var probe2 = isGql ? "'/api/graphql', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{\"query\":\"{ tasks { id } }\"}' }" : "'/api/tasks'";
      testBody = "test('logged-out visitors are blocked', async () => {\n  const res = await fetch(base + " + probe2 + ");\n  assert.equal(res.status, 401);\n});\n";
    } else if (isGql) {
      testBody = "test('GraphQL adds and lists tasks', async () => {\n  const send = (query: string) => fetch(base + '/api/graphql', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) }).then((r) => r.json());\n  const added = await send('mutation { addTask(title: \"Through GraphQL\") { id } }');\n  assert.ok(added.data.addTask.id);\n  const list = await send('{ tasks { id title done } }');\n  assert.ok(list.data.tasks.some((t: { title: string }) => t.title === 'Through GraphQL'));\n});\n";
    } else {
      testBody = "test('the API adds, changes and lists tasks', async () => {\n  const created = await fetch(base + '/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Through the API' }) });\n  assert.equal(created.status, 201);\n  const task = await created.json();\n  const changed = await fetch(base + '/api/tasks/' + task.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ done: true }) });\n  assert.equal((await changed.json()).done, true);\n  const list = await fetch(base + '/api/tasks');\n  assert.ok(list.headers.get('content-range'));\n  assert.ok((await list.json()).some((t: { id: string }) => t.id === task.id));\n});\n\ntest('an empty title is rejected', async () => {\n  const res = await fetch(base + '/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });\n  assert.equal(res.status, 400);\n});\n";
    }
    sections.push({ id: 'test', title: 'Test it', items: [
      { file: 'test/app.test.ts', lang: 'typescript', code: "import assert from 'node:assert/strict';\nimport { spawn, type ChildProcess } from 'node:child_process';\nimport { after, before, test } from 'node:test';\n\nconst base = 'http://localhost:3100';\nlet server: ChildProcess;\n\nbefore(async () => {\n  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3100'], { stdio: 'inherit' });\n  for (let i = 0; i < 60; i++) {\n    const up = await fetch(base + '/').then(() => true, () => false);\n    if (up) return;\n    await new Promise((resolve) => setTimeout(resolve, 500));\n  }\n  throw new Error('The server did not start');\n});\n\nafter(() => {\n  server.kill();\n});\n\n" + testBody, lines: [
        ['spawn', 'Starts your real built app in the background, on a port kept for tests. It runs Next.js directly rather than through <code>npx</code>, because on Windows <code>server.kill()</code> would otherwise stop only the wrapper and leave the server running.'],
        ['for loop', 'Waits until the server answers, because starting takes a moment.'],
        ['test', 'Node\'s built-in test runner, making real HTTP requests.']
      ] },
      { cmd: 'npm run build\nnpm test', lines: [['npm run build', 'Compiles the production version. This also catches many type errors.'], ['npm test', 'Checks all types, then runs the tests against that build. They use whichever database <code>DATABASE_URL</code> points at.']] },
      { p: 'Then start it with the command below and open <code>http://localhost:3000</code>.' },
      { cmd: 'npm run dev', manual: true, lines: [['npm run dev', 'Starts the development server, which updates the page as you save. Press Ctrl+C to stop it.']] }
    ] });

    var envList = ['DATABASE_URL'];
    if (login) envList.push('BETTER_AUTH_SECRET', 'BETTER_AUTH_URL', 'ADMIN_EMAILS');
    if (oidc) envList.push('OIDC_ISSUER', 'OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET');
    if (a.transport === 'managed') envList.push('ABLY_API_KEY');
    if (a.transport === 'websocket' || a.transport === 'library') envList.push('LIVE_URL', 'LIVE_KEY');
    if (a.payment) { envList.push('PUBLIC_URL'); Kit.PAYMENT[a.payment].env.forEach(function (e) { envList.push(e[0]); }); }
    var docker = "FROM node:24-slim\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\nENV NODE_ENV=production\nUSER node\nEXPOSE 3000\nCMD [\"npm\", \"start\"]\n";
    var hosting = Kit.hostingItems(a, { port: 3000, env: envList, dockerfile: docker, dockerignore: 'node_modules\n.next\nadmin/node_modules\n.git\n.env*\n*.db\n', dockerLines: [
      ['node:24-slim', 'A small official image with Node 24.'],
      ['npm ci', 'Installs exactly what <code>package-lock.json</code> lists.'],
      ['RUN npm run build', 'Compiles the app into the image.'],
      ['USER node', 'Runs as a limited user rather than as root.'],
      ['CMD', 'What runs when the container starts.']
    ] });
    if (a.transport === 'websocket' || a.transport === 'library') hosting.push({ warn: 'Deploy <code>live-server.ts</code> as a second service with the same image and the command <code>npx tsx live-server.ts</code>. Keep its secure <code>wss://</code> address in the page\'s connection code.' });
    sections.push({ id: 'deploy', title: 'Deploy it', items: hosting });
    return sections;
  }
  Kit.frameworks.nextjs = nextjs;
  Kit.ts = { tsData: tsData, tsMigrations: tsMigrations, envItem: envItem, authFile: authFile, authEnv: authEnv, authPackages: authPackages, authMigrate: authMigrate, loginPage: loginPage, LOGIN_LINES: LOGIN_LINES, paymentFile: paymentFile, ejsViews: ejsViews };
})(StackKit);
