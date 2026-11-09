// @ts-nocheck -- moved from the single-file page; types are added module by module.
import { StackKit } from '../stack-kit';

// Guide for Fastify. It shares its data, login, payment and page code with the other TypeScript stacks.
(function (Kit) {
  function L() { return Array.prototype.join.call(arguments, '\n') + '\n'; }

  function liveParts(a) {
    if (a.transport === 'sse') return { items: [], code: L(
      "import type { ServerResponse } from 'node:http';",
      "import type { FastifyInstance } from 'fastify';",
      "",
      "const listeners = new Set<ServerResponse>();",
      "",
      "export function registerLive(app: FastifyInstance) {",
      "  app.get('/api/live', (_request, reply) => {",
      "    reply.hijack();",
      "    reply.raw.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });",
      "    reply.raw.write(': connected\\n\\n');",
      "    listeners.add(reply.raw);",
      "    reply.raw.on('close', () => listeners.delete(reply.raw));",
      "  });",
      "}",
      "",
      "export function tasksChanged() {",
      "  listeners.forEach((listener) => listener.write('data: changed\\n\\n'));",
      "}"), lines: [
      ['reply.hijack', 'Tells Fastify this route writes its own response, which stays open.'],
      ['reply.raw', 'Node\'s underlying response object.'],
      ['text/event-stream', 'Tells the browser this response stays open and carries events.'],
      ['listeners', 'Every open connection, so a change can reach them all.'],
      ['data: changed\\n\\n', 'The event format: a <code>data:</code> line and a blank line.']
    ] };
    if (a.transport === 'websocket') return { items: [{ cmd: 'npm install @fastify/websocket\nnpm install -D @types/ws', lines: [['@fastify/websocket', 'Fastify\'s official WebSocket plugin, built on the standard <code>ws</code> library.'], ['@types/ws', 'Type information for the WebSocket library, so TypeScript can check how you use it.']] }], code: L(
      "import websocket from '@fastify/websocket';",
      "import type { FastifyInstance } from 'fastify';",
      "",
      "let live: FastifyInstance | undefined;",
      "",
      "export async function registerLive(app: FastifyInstance) {",
      "  await app.register(websocket);",
      "  app.get('/live', { websocket: true }, () => {});",
      "  live = app;",
      "}",
      "",
      "export function tasksChanged() {",
      "  live?.websocketServer.clients.forEach((client) => {",
      "    if (client.readyState === client.OPEN) client.send('changed');",
      "  });",
      "}"), lines: [
      ['websocket: true', 'Makes this route accept WebSocket connections. It only sends messages, so its handler is empty.'],
      ['websocketServer.clients', 'Every open connection, so a change can reach them all.'],
      ['readyState', 'Skips connections that are closing.']
    ] };
    if (a.transport === 'library') return { items: [{ cmd: 'npm install socket.io', lines: [['socket.io', 'Adds reconnection and fallbacks on top of WebSockets. This guide connects it directly, because the community Fastify plugin only supports Fastify 4.']] }], code: L(
      "import type { FastifyInstance } from 'fastify';",
      "import { Server } from 'socket.io';",
      "",
      "let io: Server | undefined;",
      "",
      "export function registerLive(app: FastifyInstance) {",
      "  io = new Server(app.server);",
      "}",
      "",
      "export function tasksChanged() {",
      "  io?.emit('tasksChanged');",
      "}"), lines: [
      ['app.server', 'Node\'s underlying web server, which Socket.IO attaches to.'],
      ['io.emit', 'Sends a named message to every connected browser.']
    ] };
    return { items: [
      { p: 'Create a free <a href="https://ably.com/docs/getting-started">Ably</a> account and copy an API key.' },
      { cmd: 'npm install ably', lines: [['ably', 'Ably\'s official library.']] },
      { cmd: 'export ABLY_API_KEY=your-key', manual: true, lines: [['ABLY_API_KEY', 'Your secret key. It stays on the server.']] }
    ], code: L(
      "import Ably from 'ably';",
      "import type { FastifyInstance } from 'fastify';",
      "",
      "const rest = process.env.ABLY_API_KEY ? new Ably.Rest(process.env.ABLY_API_KEY) : undefined;",
      "",
      "export function registerLive(app: FastifyInstance) {",
      "  app.get('/api/live-token', () => rest!.auth.createTokenRequest({ capability: { tasks: ['subscribe'] } }));",
      "}",
      "",
      "export function tasksChanged() {",
      "  rest?.channels.get('tasks').publish('changed', {}).catch(console.error);",
      "}"), lines: [
      ['Ably.Rest', 'Sends messages to Ably over normal HTTP requests.'],
      ['createTokenRequest', 'Gives the browser a short-lived permission that can only subscribe, so your key stays secret.'],
      ['publish', 'Ably delivers this to every subscribed browser.']
    ] };
  }

  function fastify(a) {
    var T = Kit.ts, s = [];
    var spa = Kit.isSpa(a), templates = a.frontend === 'server-templates', login = !!a.login, oidc = Kit.usesOidc(a);
    var isRest = a.api === 'rest', isGql = a.api === 'graphql', needsEjs = templates || a.admin === 'in-app';

    s.push({ id: 'tools', title: 'Install your tools', items: [
      { p: 'You need <a href="https://nodejs.org/en/download">Node.js</a> 22.12 or newer, which includes npm. Check it:' },
      { cmd: 'node --version\nnpm --version', lines: [['node', 'Runs JavaScript outside the browser. This is your backend\'s runtime.'], ['npm', 'Downloads libraries and runs project scripts.']] },
      { p: 'Commands assume a Unix-style terminal. On Windows, use Git Bash or WSL. Recent npm versions may warn that a package\'s install script wasn\'t approved, which you can usually ignore.' }
    ] });

    var deps = ['fastify', 'tsx', '@fastify/formbody'];
    if (needsEjs) deps.push('@fastify/view', 'ejs');
    if (spa) deps.push('@fastify/static');
    if (isRest) deps.push('@fastify/swagger', '@fastify/swagger-ui');
    if (isGql) deps.push('graphql', 'graphql-yoga');
    s.push({ id: 'project', title: 'Create the project', items: [
      { cmd: 'mkdir demo\ncd demo\nnpm init -y\nnpm pkg set type=module\nnpm pkg set scripts.dev="tsx watch src/server.ts"\nnpm pkg set scripts.start="tsx src/server.ts"\nnpm pkg set scripts.test="tsc --noEmit && node --import tsx --test --test-concurrency=1 \\"test/*.test.ts\\""', lines: [
        ['npm init -y', 'Creates <code>package.json</code>, which lists your libraries and scripts.'],
        ['type=module', 'Uses modern <code>import</code> statements.'],
        ['tsx', 'Runs TypeScript directly, without a separate compile step.'],
        ['tsx watch', 'Restarts the server whenever you save a file.'],
        ['scripts.test', 'First checks all types with <code>tsc</code>, then runs the tests with Node\'s built-in test runner.']
      ] },
      { cmd: 'npm install ' + deps.join(' ') + '\nnpm install -D typescript @types/node' + (needsEjs ? ' @types/ejs' : ''), lines: [
        ['fastify', 'The web framework. Fastify adds features through plugins, so the next few packages are official plugins.'],
        ['@fastify/formbody', 'Reads normal HTML form posts. Fastify only reads JSON by itself.'],
        ['-D', 'Development only. Types and the compiler aren\'t needed to run the app.']
      ].concat(needsEjs ? [['@fastify/view and ejs', 'Render pages from EJS templates, which mix HTML with small pieces of JavaScript.']] : [])
       .concat(spa ? [['@fastify/static', 'Serves your built frontend files.']] : [])
       .concat(isRest ? [['@fastify/swagger', 'Generates an OpenAPI description from your route schemas, with a page for trying it.']] : [])
       .concat(isGql ? [['graphql-yoga', 'A GraphQL server.']] : []) },
      { file: '.gitignore', lang: 'text', code: 'node_modules\ndist\n.env\n*.db\n', lines: [['.gitignore', 'Tells Git what to leave out. Libraries can be downloaded again, and secrets and database files should never be committed.']] },
      { file: 'tsconfig.json', lang: 'json', code: '{\n  "compilerOptions": {\n    "target": "ES2022",\n    "module": "NodeNext",\n    "moduleResolution": "NodeNext",\n    "strict": true,\n    "skipLibCheck": true,\n    "noEmit": true,\n    "allowImportingTsExtensions": true,\n    "esModuleInterop": true,\n    "types": ["node"]\n  },\n  "include": ["src", "test"]\n}\n', lines: [
        ['strict', 'Turns on TypeScript\'s stronger checks.'],
        ['NodeNext', 'Follows how Node itself finds modules.'],
        ['noEmit', 'Only checks types. <code>tsx</code> runs the code.'],
        ['skipLibCheck', 'Doesn\'t check the types inside libraries, which is faster.']
      ] }
    ] });

    s.push({ id: 'db', title: 'Set up the database', items: Kit.dbSetup(a).concat([T.envItem(a)]).concat(T.tsData(a, 'src/')).concat(T.tsMigrations(a)) });

    if (login) {
      var li = [];
      if (oidc) li = li.concat(Kit.oidcSetup(a, '/api/auth/oauth2/callback/oidc', 3000));
      li.push(T.authPackages(a), T.authEnv(a), T.authFile(a, 'src/'), T.authMigrate(a, 'src/'));
      li.push({ file: 'public/login.html', lang: 'html', code: T.loginPage(a), lines: T.LOGIN_LINES });
      if (!oidc) li.push({ warn: 'This signs people up without confirming their email. Before you use <code>ADMIN_EMAILS</code> on a public site, <a href="https://better-auth.com/docs/concepts/email">turn on email verification</a>, so nobody can register an admin\'s address first.' });
      s.push({ id: 'login', title: 'Add login', items: li });
    }

    if (a.transport) {
      var live = liveParts(a);
      s.push({ id: 'live', title: 'Add live updates', items: live.items.concat([{ file: 'src/live.ts', lang: 'typescript', code: live.code, lines: live.lines }]).concat(templates ? [{ p: 'The page script in the next section reloads the list when a message arrives.' }] : []) });
    }

    if (a.payment) {
      var fake = { stripe: "{ url: 'https://pay.example/1' }", adyen: "{ url: 'https://pay.example/1' }", paypal: "{ access_token: 't', links: [{ rel: 'payer-action', href: 'https://pay.example/1' }] }", klarna: "{ session_id: 's', redirect_url: 'https://pay.example/1' }" }[a.payment];
      s.push({ id: 'pay', title: 'Add payments with ' + Kit.PAYMENT[a.payment].name, items: Kit.paymentIntro(a).concat([
        T.paymentFile(a, 'src/'),
        { file: 'test/checkout.test.ts', lang: 'typescript', code: "import assert from 'node:assert/strict';\nimport { test } from 'node:test';\nimport { createCheckout } from '../src/checkout.ts';\n\ntest('asks the provider for a payment page', async () => {\n  const real = globalThis.fetch;\n  globalThis.fetch = (async () => new Response(JSON.stringify(" + fake + "), { status: 200 })) as typeof fetch;\n  try {\n    assert.equal(await createCheckout('http://localhost:3000'), 'https://pay.example/1');\n  } finally {\n    globalThis.fetch = real;\n  }\n});\n", lines: [['globalThis.fetch =', 'Replaces the network call with a simulated response, so this test needs no account and spends no money.']] }
      ]).concat(Kit.paymentOutro(a)) });
    }

    // The app
    var notify = a.transport ? '\n  tasksChanged();' : '';
    var im = ["import formbody from '@fastify/formbody';"];
    if (spa) im.push("import fastifyStatic from '@fastify/static';");
    if (isRest) im.push("import swagger from '@fastify/swagger';", "import swaggerUi from '@fastify/swagger-ui';");
    if (needsEjs) im.push("import view from '@fastify/view';");
    if (login) im.push("import { fromNodeHeaders } from 'better-auth/node';");
    if (needsEjs) im.push("import ejs from 'ejs';");
    im.push("import Fastify, { type FastifyError" + (login || isGql ? ", type FastifyReply, type FastifyRequest" : '') + " } from 'fastify';");
    if (isGql) im.push("import { createSchema, createYoga } from 'graphql-yoga';");
    if (login) im.push("import { readFile } from 'node:fs/promises';");
    if (needsEjs || spa) im.push("import { join } from 'node:path';");
    if (login) im.push("import { auth" + (a.admin ? ', isAdmin' : '') + " } from './auth.ts';");
    if (a.payment) im.push("import { createCheckout } from './checkout.ts';");
    if (a.transport) im.push("import { registerLive, tasksChanged } from './live.ts';");
    var taskFns = ['listTasks'];
    if (isRest || templates || isGql) taskFns.push('addTask', 'setDone');
    if (a.admin === 'in-app' || a.admin === 'react-admin') taskFns.push('deleteTask');
    im.push("import { " + taskFns.sort().join(', ') + " } from './tasks.ts';");

    var b = "\nexport const app = Fastify({ logger: true });\n\nawait app.register(formbody);\n";
    if (needsEjs) b += "await app.register(view, { engine: { ejs }, root: join(process.cwd(), 'views'), viewExt: 'ejs' });\n";
    if (isRest) b += "await app.register(swagger, { openapi: { info: { title: 'Tasks', version: '1.0.0' } } });\nawait app.register(swaggerUi, { routePrefix: '/api/docs' });\n";
    if (a.transport) b += "await registerLive(app);\n";
    b += "\napp.setErrorHandler((error: FastifyError, request, reply) => {\n  if (error.statusCode && error.statusCode < 500) return reply.code(error.statusCode).send({ error: error.message });\n  request.log.error(error);\n  return reply.code(500).send({ error: 'Something went wrong' });\n});\n";
    if (login) {
      b += "\napp.route({\n  method: ['GET', 'POST'],\n  url: '/api/auth/*',\n  async handler(request, reply) {\n    const url = new URL(request.url, `http://${request.headers.host}`);\n    const response = await auth.handler(\n      new Request(url, {\n        method: request.method,\n        headers: fromNodeHeaders(request.headers),\n        ...(request.body ? { body: JSON.stringify(request.body) } : {}),\n      }),\n    );\n    reply.code(response.status);\n    response.headers.forEach((value, key) => reply.header(key, value));\n    return reply.send(response.body ? await response.text() : null);\n  },\n});\n";
      b += "\nasync function currentUser(request: FastifyRequest) {\n  const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });\n  return session?.user;\n}\n\nasync function requireUser(request: FastifyRequest, reply: FastifyReply) {\n  if (await currentUser(request)) return;\n  if (request.method === 'GET' && !request.url.startsWith('/api') && request.headers.accept?.includes('text/html')) return reply.redirect('/login');\n  return reply.code(401).send({ error: 'Log in first' });\n}\n";
      b += "\napp.get('/login', async (_request, reply) => reply.type('text/html').send(await readFile('public/login.html')));\n\napp.post('/logout', async (request, reply) => {\n  const out = await auth.api.signOut({ headers: fromNodeHeaders(request.headers), asResponse: true });\n  out.headers.getSetCookie().forEach((cookie) => reply.header('set-cookie', cookie));\n  return reply.redirect('/login', 303);\n});\n";
    }
    function opts(schema) {
      var parts = [];
      if (login) parts.push('onRequest: requireUser');
      if (schema) parts.push('schema: ' + schema);
      return parts.length ? '{ ' + parts.join(', ') + ' }, ' : '';
    }
    if (isRest) {
      b += "\nconst newTask = { type: 'object', required: ['title'], properties: { title: { type: 'string', minLength: 1, maxLength: 200, pattern: '\\\\S' } } };\nconst changeTask = { type: 'object', required: ['done'], properties: { done: { type: 'boolean' } } };\n";
      b += "\napp.get('/api/tasks', " + opts() + "async (_request, reply) => {\n  const tasks = await listTasks();\n  reply.header('Content-Range', `tasks 0-${tasks.length}/${tasks.length}`);\n  reply.header('Access-Control-Expose-Headers', 'Content-Range');\n  return tasks;\n});\n";
      b += "\napp.get<{ Params: { id: string } }>('/api/tasks/:id', " + opts() + "async (request, reply) => {\n  const task = (await listTasks()).find((t) => t.id === request.params.id);\n  if (!task) return reply.code(404).send({ error: 'Not found' });\n  return task;\n});\n";
      b += "\napp.post<{ Body: { title: string } }>('/api/tasks', " + opts('{ body: newTask }') + "async (request, reply) => {\n  const task = await addTask(request.body.title.trim());" + notify + "\n  return reply.code(201).send(task);\n});\n";
      b += "\napp.put<{ Params: { id: string }; Body: { done: boolean } }>('/api/tasks/:id', " + opts('{ body: changeTask }') + "async (request) => {\n  await setDone(request.params.id, request.body.done);" + notify + "\n  return (await listTasks()).find((t) => t.id === request.params.id) ?? null;\n});\n";
    }
    if (isGql) {
      var n8 = a.transport ? '\n          tasksChanged();' : '';
      b += "\nconst yoga = createYoga<{ req: FastifyRequest; reply: FastifyReply }>({\n  schema: createSchema({\n    typeDefs: `\n      type Task { id: ID! title: String! done: Boolean! }\n      type Query { tasks: [Task!]! }\n      type Mutation {\n        addTask(title: String!): Task!\n        setDone(id: ID!, done: Boolean!): Boolean!\n      }\n    `,\n    resolvers: {\n      Query: { tasks: () => listTasks() },\n      Mutation: {\n        addTask: async (_: unknown, args: { title: string }) => {\n          const task = await addTask(args.title);" + n8 + "\n          return task;\n        },\n        setDone: async (_: unknown, args: { id: string; done: boolean }) => {\n          await setDone(args.id, args.done);" + n8 + "\n          return true;\n        },\n      },\n    },\n  }),\n});\n\napp.route({\n  url: yoga.graphqlEndpoint,\n  method: ['GET', 'POST', 'OPTIONS'],\n" + (login ? "  onRequest: requireUser,\n" : '') + "  handler: (req, reply) => yoga.handleNodeRequestAndResponse(req, reply, { req, reply }),\n});\n";
    }
    if (templates) {
      b += "\napp.get('/', " + opts() + "async (_request, reply) => reply.view('index', { tasks: await listTasks() }));\n";
      b += "\napp.get('/tasks', " + opts() + "async (_request, reply) => reply.view('list', { tasks: await listTasks() }));\n";
      b += "\napp.post<{ Body: { title?: string } }>('/tasks', " + opts() + "async (request, reply) => {\n  const title = String(request.body?.title ?? '').trim();\n  if (title && title.length <= 200) {\n    await addTask(title);" + (a.transport ? '\n    tasksChanged();' : '') + "\n  }\n  return reply.view('list', { tasks: await listTasks() });\n});\n";
      b += "\napp.post<{ Params: { id: string }; Body: { done?: string } }>('/tasks/:id/toggle', " + opts() + "async (request, reply) => {\n  await setDone(request.params.id, request.body?.done === 'on');" + notify + "\n  return reply.view('list', { tasks: await listTasks() });\n});\n";
    }
    if (a.admin === 'in-app') {
      b += "\nasync function requireAdmin(request: FastifyRequest, reply: FastifyReply) {\n  const user = await currentUser(request);\n  if (!user) return reply.redirect('/login');\n  if (!isAdmin(user.email)) return reply.code(403).send({ error: 'Not allowed' });\n}\n";
      b += "\napp.get('/admin', { onRequest: requireAdmin }, async (_request, reply) => reply.view('admin', { tasks: await listTasks() }));\n";
      b += "\napp.post<{ Params: { id: string } }>('/admin/tasks/:id/delete', { onRequest: requireAdmin }, async (request, reply) => {\n  await deleteTask(request.params.id);" + notify + "\n  return reply.redirect('/admin', 303);\n});\n";
    }
    if (a.admin === 'react-admin') {
      b += "\napp.delete<{ Params: { id: string } }>('/api/tasks/:id', { onRequest: requireUser }, async (request, reply) => {\n  const user = await currentUser(request);\n  if (!user || !isAdmin(user.email)) return reply.code(403).send({ error: 'Not allowed' });\n  await deleteTask(request.params.id);" + notify + "\n  return { id: request.params.id };\n});\n";
    }
    if (a.payment) {
      b += "\napp.post('/api/checkout', " + opts() + "async (request, reply) => {\n  const baseUrl = process.env.PUBLIC_URL ?? `${request.protocol}://${request.host}`;\n  return reply.redirect(await createCheckout(baseUrl), 303);\n});\n";
    }
    if (spa) b += "\nawait app.register(fastifyStatic, { root: join(process.cwd(), '" + Kit.spaDistPath(a) + "') });\n";

    var appLines = [
      ['Fastify({ logger: true })', 'Creates the app, with structured logs for every request.'],
      ['await app.register', 'Adds a plugin. Fastify loads plugins in order, and <code>await</code> makes each one ready before the next line runs.'],
      ['formbody', 'Reads normal HTML form posts.']
    ].concat(needsEjs ? [['view', 'Lets routes call <code>reply.view</code>, using templates from the <code>views</code> folder.']] : [])
     .concat(isRest ? [['swagger', 'Serves API docs at <code>/api/docs</code>, built from your route schemas. It has to be registered before the routes.']] : [])
     .concat(a.transport ? [['registerLive', 'Adds live updates to the app.']] : [])
     .concat([['setErrorHandler', 'Catches anything thrown by routes. Client errors keep their message, and anything else is logged and hidden from the visitor.']])
     .concat(login ? [
       ['/api/auth/*', 'Passes login requests to Better Auth. Fastify and Better Auth use different request objects, so this builds a standard <code>Request</code> and copies the answer back.'],
       ['currentUser', 'Reads the session from the cookie. It returns nothing if the visitor isn\'t logged in.'],
       ['onRequest: requireUser', 'Runs the login check before anything else, including reading the body. If this hook sends a reply, the route doesn\'t run.'],
       ['/logout', 'Ends the session and clears the cookie. It\'s a POST so other sites can\'t log someone out with a link.']
     ] : [])
     .concat(isRest ? [
       ['newTask', 'A JSON Schema. Fastify checks each request body against it and answers 400 if it doesn\'t match, so bad input never reaches your code.'],
       ['minLength, maxLength, pattern', 'Require 1 to 200 characters, with at least one that isn\'t a space.'],
       ["app.get<{ Params", 'Tells TypeScript the shape of this request, because it can\'t work that out from the URL.'],
       ['return tasks', 'Fastify sends the returned value as JSON.'],
       ['Content-Range', 'Tells clients how many rows exist. React-admin needs this.'],
       ['code(201)', 'The standard status for &quot;created&quot;.']
     ] : [])
     .concat(isGql ? [
       ['createSchema', 'Defines what clients can ask for (<code>typeDefs</code>) and the code that answers (<code>resolvers</code>).'],
       ['ID!', 'The <code>!</code> means the value is never null.'],
       ['handleNodeRequestAndResponse', 'Passes the request to GraphQL Yoga, which answers at <code>/graphql</code>.']
     ] : [])
     .concat(templates ? [
       ['reply.view', 'Fills in a template and sends the HTML.'],
       ["reply.view('list'", 'Returns only the list, because htmx swaps just that part of the page.'],
       ["done === 'on'", 'A checked checkbox sends <code>on</code>, and an unchecked one sends nothing.']
     ] : [])
     .concat(a.admin === 'in-app' ? [
       ['requireAdmin', 'Checks on the server. Hiding a link isn\'t protection, because anyone can type a URL.'],
       ['code(403)', 'Means logged in, but not allowed.'],
       ['reply.redirect', 'Sends the browser to another page after the change, so refreshing doesn\'t repeat it.']
     ] : [])
     .concat(a.admin === 'react-admin' ? [['app.delete', 'Only admins can delete. React-admin\'s delete button calls this.']] : [])
     .concat(a.payment ? [['PUBLIC_URL', 'Your site\'s real address. Set this in production, because the <code>Host</code> header can be forged.']] : [])
     .concat(spa ? [['fastifyStatic', 'Serves your built frontend from the same server in production.']] : []);
    var appItems = [{ file: 'src/app.ts', lang: 'typescript', code: im.join('\n') + '\n' + b, lines: appLines }];
    appItems.push({ file: 'src/server.ts', lang: 'typescript', code: "import { app } from './app.ts';\n\nawait app.listen({ port: Number(process.env.PORT ?? 3000), host: '0.0.0.0' });\n", lines: [['app.listen', 'Starts accepting requests. If it can\'t, it stops the program with an error.'], ['process.env.PORT', 'Hosting platforms choose the port and pass it this way. 3000 is the default for your own machine.'], ["host: '0.0.0.0'", 'Accepts connections from other machines. Fastify otherwise only listens on <code>localhost</code>, which can\'t be reached from outside a container.']] });
    s.push({ id: 'app', title: 'Write the app', items: appItems });

    T.ejsViews(a, s);
    if (spa) s.push({ id: 'frontend', title: 'Build the frontend', items: Kit.spaItems(a, 3000) });
    if (a.admin === 'react-admin') s.push({ id: 'admin', title: 'Add the admin app', items: Kit.reactAdminItems(a, 3000) });
    if (a.admin === 'low-code') s.push({ id: 'admin', title: 'Add the admin tool', items: Kit.lowCodeItems(a) });

    // Tests
    var t = "import assert from 'node:assert/strict';\nimport type { AddressInfo } from 'node:net';\nimport { after, before, test } from 'node:test';\nimport { app } from '../src/app.ts';\nimport { addTask, closeDb, listTasks, setDone } from '../src/tasks.ts';\n\nlet base = '';\n\nbefore(async () => {\n  await app.listen({ port: 0 });\n  base = 'http://localhost:' + (app.server.address() as AddressInfo).port;\n});\n\nafter(async () => {\n  await app.close();\n  await closeDb();\n  setTimeout(() => process.exit(), 500).unref();\n});\n\ntest('the data layer saves and changes a task', async () => {\n  const task = await addTask('From the test');\n  await setDone(task.id, true);\n  const saved = (await listTasks()).find((t) => t.id === task.id);\n  assert.equal(saved?.done, true);\n});\n";
    if (login) {
      var probe = isRest ? "base + '/api/tasks'" : isGql ? "base + '/graphql'" : "base + '/tasks'";
      t += "\ntest('logged-out visitors are blocked', async () => {\n  const res = await fetch(" + probe + ", { redirect: 'manual', method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: '{}' });\n  assert.equal(res.status, 401);\n});\n";
    } else if (isRest) {
      t += "\ntest('the REST API adds and lists tasks', async () => {\n  const created = await fetch(base + '/api/tasks', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ title: 'Through the API' }),\n  });\n  assert.equal(created.status, 201);\n  const task = await created.json();\n  const changed = await fetch(base + '/api/tasks/' + task.id, {\n    method: 'PUT',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ done: true }),\n  });\n  assert.equal((await changed.json()).done, true);\n  const list = await fetch(base + '/api/tasks');\n  assert.ok(list.headers.get('content-range'));\n  assert.ok((await list.json()).some((t: { id: string }) => t.id === task.id));\n});\n\nfor (const body of ['{}', '{\"title\":\"\"}', '{\"title\":\"   \"}']) {\n  test('this title is rejected: ' + body, async () => {\n    const res = await fetch(base + '/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });\n    assert.equal(res.status, 400);\n  });\n}\n";
    } else if (isGql) {
      t += "\ntest('GraphQL adds and lists tasks', async () => {\n  const send = (query: string) => fetch(base + '/graphql', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) }).then((r) => r.json());\n  const added = await send('mutation { addTask(title: \"Through GraphQL\") { id } }');\n  assert.ok(added.data.addTask.id);\n  const list = await send('{ tasks { id title done } }');\n  assert.ok(list.data.tasks.some((t: { title: string }) => t.title === 'Through GraphQL'));\n});\n";
    }
    if (templates && !login) t += "\ntest('the page shows tasks and escapes titles', async () => {\n  await fetch(base + '/tasks', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'title=' + encodeURIComponent('<b>From a form</b>') });\n  const html = await (await fetch(base + '/')).text();\n  assert.ok(html.includes('&lt;b&gt;From a form&lt;/b&gt;'));\n});\n";
    if (a.admin === 'in-app') t += "\ntest('the admin page needs a login', async () => {\n  const res = await fetch(base + '/admin', { redirect: 'manual' });\n  assert.equal(res.status, 302);\n});\n";
    s.push({ id: 'test', title: 'Test it', items: [
      { file: 'test/app.test.ts', lang: 'typescript', code: t, lines: [
        ['port: 0', 'Asks the system for any free port, so tests never clash with a running server.'],
        ['test', 'Node\'s built-in test runner, so there is nothing extra to install.'],
        ['fetch', 'Makes real HTTP requests to your app.'],
        ['app.close', 'Stops the server, so the test process can finish.'],
        ['setTimeout(...).unref()', 'Ends the test process if a library still holds a connection open, such as the login library\'s database pool. <code>unref</code> means this timer alone won\'t keep it running.']
      ] },
      { cmd: 'npm test', lines: [['npm test', 'Checks all types, then runs the tests. Tests use whichever database <code>DATABASE_URL</code> points at, so use a development database.']] },
      { p: 'Then start it with the command below and open <code>http://localhost:3000</code>.' + (isRest ? ' API docs are at <code>/api/docs</code>.' : '') + (spa ? ' For the frontend, also run <code>npm run dev</code> inside <code>web</code>, and open the address it prints.' : '') },
      { cmd: 'npm run dev', manual: true, lines: [['npm run dev', 'Starts the server and restarts it when you save a file. Press Ctrl+C to stop it.']] }
    ] });

    var envList = ['DATABASE_URL'];
    if (login) envList.push('BETTER_AUTH_SECRET', 'BETTER_AUTH_URL', 'ADMIN_EMAILS');
    if (oidc) envList.push('OIDC_ISSUER', 'OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET');
    if (a.transport === 'managed') envList.push('ABLY_API_KEY');
    if (a.payment) { envList.push('PUBLIC_URL'); Kit.PAYMENT[a.payment].env.forEach(function (e) { envList.push(e[0]); }); }
    var spaBuild = spa ? "FROM node:24-slim AS frontend\nWORKDIR /web\nCOPY web/package*.json ./\nRUN npm ci\nCOPY web/ ./\nRUN npm run build\n\n" : '';
    var docker = spaBuild + "FROM node:24-slim\nWORKDIR /app\nENV NODE_ENV=production\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY . .\n" + (spa ? "COPY --from=frontend /web/dist ./web/dist\n" : '') + "USER node\nEXPOSE 3000\nCMD [\"npx\", \"tsx\", \"src/server.ts\"]\n";
    s.push({ id: 'deploy', title: 'Deploy it', items: Kit.hostingItems(a, { port: 3000, env: envList, dockerfile: docker, dockerignore: 'node_modules\nweb/node_modules\nweb/dist\nadmin/node_modules\n.git\n.env\n*.db\n', dockerLines: [
      ['node:24-slim', 'A small official image with Node 24.'],
      ['npm ci', 'Installs exactly what <code>package-lock.json</code> lists. <code>--omit=dev</code> leaves out development tools.']
    ].concat(spa ? [['AS frontend', 'A first stage builds the frontend, and only its finished files are copied into the final image.']] : []).concat([
      ['USER node', 'Runs as a limited user rather than as root.'],
      ['CMD', 'What runs when the container starts.']
    ]) }) });
    return s;
  }
  Kit.frameworks.fastify = fastify;
})(StackKit);
