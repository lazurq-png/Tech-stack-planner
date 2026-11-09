// @ts-nocheck -- moved from the single-file page; types are added module by module.
import { StackKit } from '../stack-kit';

// Guide for NestJS. It shares its data, login, payment and page code with the other TypeScript stacks.
(function (Kit) {
  function nest(a) {
    var T = Kit.ts, s = [];
    var spa = Kit.isSpa(a), templates = a.frontend === 'server-templates', login = !!a.login, oidc = Kit.usesOidc(a);
    var isRest = a.api === 'rest', isGql = a.api === 'graphql', needsEjs = templates || a.admin === 'in-app';
    s.push({ id: 'tools', title: 'Install your tools', items: [
      { p: 'You need <a href="https://nodejs.org/en/download">Node.js</a> 22.22.3 or newer, 24.15 or newer, or 26 and up, which the Nest project creator requires. Commands assume a Unix-style terminal. On Windows, use Git Bash or WSL. Recent npm versions may warn that a package\'s install script wasn\'t approved, which you can usually ignore.' },
      { cmd: 'node --version', lines: [['node', 'Runs JavaScript outside the browser. Nest runs on it.']] }
    ] });
    var deps = [];
    if (needsEjs) deps.push('ejs');
    if (isGql) deps.push('@nestjs/graphql @nestjs/apollo @apollo/server @as-integrations/express5 graphql');
    if (isRest) deps.push('@nestjs/swagger');
    s.push({ id: 'project', title: 'Create the project', items: [
      { cmd: 'npx --yes @nestjs/cli@latest new demo --package-manager npm --skip-git --skip-tests --no-observe\ncd demo\nrm -f src/app.controller.ts src/app.service.ts\nnpm pkg set scripts.test="nest build && node --test --test-concurrency=1 \\"test/*.test.mjs\\""' + (deps.length ? '\nnpm install ' + deps.join(' ') : '') + (needsEjs ? '\nnpm install -D @types/ejs' : ''), lines: [
        ['@nestjs/cli new', 'Creates a Nest project. New projects use modern ES modules and strict TypeScript.'],
        ['--skip-tests and --no-observe', 'Leave out the sample tests and the question about monitoring, because this guide writes its own tests.'],
        ['rm -f', 'Removes the sample controller and service, which this guide replaces.'],
        ['scripts.test', 'Compiles the app, then tests the result with Node\'s built-in test runner.']
      ].concat(needsEjs ? [['ejs', 'A template language that mixes HTML with small pieces of JavaScript.']] : []).concat(isGql ? [['@nestjs/graphql and friends', 'Nest\'s GraphQL support, running on Apollo Server.']] : []).concat(isRest ? [['@nestjs/swagger', 'Generates an OpenAPI description of your API, and a page for trying it.']] : []) },
      { file: 'tsconfig.build.json', lang: 'json', code: '{\n  "extends": "./tsconfig.json",\n  "compilerOptions": { "rootDir": "src", "declaration": false },\n  "include": ["src"],\n  "exclude": ["node_modules", "dist", "test"]\n}\n', lines: [['rootDir', 'Puts compiled files straight into <code>dist</code>, so the app starts from <code>dist/main.js</code>.'], ['declaration: false', 'Skips writing type description files, which only libraries need. Some login library types can\'t be written out, and would stop the build.'], ['include', 'Compiles only <code>src</code>, so tool settings in the project folder don\'t change where the output goes.']] },
      { file: '.gitignore', lang: 'text', code: 'node_modules\ndist\n.env\n*.db\n*.tsbuildinfo\n', lines: [['.gitignore', 'Tells Git what to leave out. Libraries can be downloaded again, and secrets and database files should never be committed.']] }
    ] });
    s.push({ id: 'db', title: 'Set up the database', items: Kit.dbSetup(a).concat([T.envItem(a)]).concat(T.tsData(a, 'src/')).concat(T.tsMigrations(a)) });

    if (login) {
      var li = [];
      if (oidc) li = li.concat(Kit.oidcSetup(a, '/api/auth/oauth2/callback/oidc', 3000));
      li.push(T.authPackages(a), T.authEnv(a), T.authFile(a, 'src/'), T.authMigrate(a, 'src/'));
      li.push({ file: 'public/login.html', lang: 'html', code: T.loginPage(a), lines: T.LOGIN_LINES });
      li.push({ file: 'src/login.guard.ts', lang: 'typescript', code: "import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';\nimport { fromNodeHeaders } from 'better-auth/node';\nimport type { Request } from 'express';\nimport { auth } from './auth.js';\n\nexport async function currentUser(req: Request) {\n  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });\n  return session?.user;\n}\n\n@Injectable()\nexport class LoginGuard implements CanActivate {\n  async canActivate(context: ExecutionContext): Promise<boolean> {\n    if (await currentUser(context.switchToHttp().getRequest())) return true;\n    throw new UnauthorizedException('Log in first');\n  }\n}\n", lines: [['currentUser', 'Reads the session from the cookie. It returns nothing if the visitor isn\'t logged in.'], ['CanActivate', 'A guard: Nest runs it before a route, and the route only runs if it returns true.'], ['UnauthorizedException', 'Sends a 401 response.']] });
      if (!oidc) li.push({ warn: 'This signs people up without confirming their email. Before you use <code>ADMIN_EMAILS</code> on a public site, <a href="https://better-auth.com/docs/concepts/email">turn on email verification</a>, so nobody can register an admin\'s address first.' });
      s.push({ id: 'login', title: 'Add login', items: li });
    }

    // Live updates
    if (a.transport) {
      var liveItems = [], code, lines;
      var head = "import { Subject } from 'rxjs';\n\nexport const changes = new Subject<void>();\n\nexport function tasksChanged() {\n  changes.next();\n}\n";
      var headLines = [['Subject', 'A stream that other code can listen to. Each change sends one message through it.'], ['tasksChanged', 'Your routes call this after changing data.']];
      if (a.transport === 'sse') {
        code = "import { Controller, MessageEvent, Sse } from '@nestjs/common';\nimport { map, Observable, Subject } from 'rxjs';\n\nexport const changes = new Subject<void>();\n\nexport function tasksChanged() {\n  changes.next();\n}\n\n@Controller('api')\nexport class LiveController {\n  @Sse('live')\n  live(): Observable<MessageEvent> {\n    return changes.pipe(map(() => ({ data: 'changed' })));\n  }\n}\n";
        lines = headLines.concat([['@Sse', 'Makes this route stream Server-Sent Events. Each value from the stream is one event.']]);
      }
      if (a.transport === 'websocket') {
        liveItems.push({ cmd: 'npm install @nestjs/websockets @nestjs/platform-ws ws\nnpm install -D @types/ws', lines: [['@nestjs/platform-ws', 'Runs Nest\'s WebSocket support on the standard <code>ws</code> library.']] });
        code = "import { OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';\nimport { Subject } from 'rxjs';\nimport type { WebSocketServer as Server } from 'ws';\n\nexport const changes = new Subject<void>();\n\nexport function tasksChanged() {\n  changes.next();\n}\n\n@WebSocketGateway({ path: '/live' })\nexport class LiveGateway implements OnGatewayInit {\n  @WebSocketServer() server!: Server;\n\n  afterInit() {\n    changes.subscribe(() => this.server.clients.forEach((client) => client.send('changed')));\n  }\n}\n";
        lines = headLines.concat([['@WebSocketGateway', 'Accepts WebSocket connections at this path, on the same port as your web server.'], ['@WebSocketServer', 'Nest fills this in with the underlying server.'], ['server.clients', 'Every open connection, so a change can reach them all.']]);
      }
      if (a.transport === 'library') {
        liveItems.push({ cmd: 'npm install @nestjs/websockets @nestjs/platform-socket.io', lines: [['@nestjs/platform-socket.io', 'Nest\'s support for Socket.IO, which adds reconnection and fallbacks.']] });
        code = "import { OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';\nimport { Subject } from 'rxjs';\nimport type { Server } from 'socket.io';\n\nexport const changes = new Subject<void>();\n\nexport function tasksChanged() {\n  changes.next();\n}\n\n@WebSocketGateway()\nexport class LiveGateway implements OnGatewayInit {\n  @WebSocketServer() server!: Server;\n\n  afterInit() {\n    changes.subscribe(() => this.server.emit('tasksChanged'));\n  }\n}\n";
        lines = headLines.concat([['@WebSocketGateway', 'Adds Socket.IO to your web server.'], ['server.emit', 'Sends a named message to every connected browser.']]);
      }
      if (a.transport === 'managed') {
        liveItems.push({ p: 'Create a free <a href="https://ably.com/docs/getting-started">Ably</a> account and copy an API key.' }, { cmd: 'npm install ably', lines: [['ably', 'Ably\'s official library.']] }, { cmd: 'export ABLY_API_KEY=your-key', manual: true, lines: [['ABLY_API_KEY', 'Your secret key. It stays on the server.']] });
        code = "import { Controller, Get } from '@nestjs/common';\nimport Ably from 'ably';\n\nconst rest = process.env.ABLY_API_KEY ? new Ably.Rest(process.env.ABLY_API_KEY) : undefined;\n\nexport function tasksChanged() {\n  rest?.channels.get('tasks').publish('changed', {}).catch(console.error);\n}\n\n@Controller('api')\nexport class LiveController {\n  @Get('live-token')\n  token() {\n    return rest!.auth.createTokenRequest({ capability: { tasks: ['subscribe'] } });\n  }\n}\n";
        lines = [['Ably.Rest', 'Sends messages to Ably over normal HTTP requests.'], ['createTokenRequest', 'Gives the browser a short-lived permission that can only subscribe, so your key stays secret.'], ['publish', 'Ably delivers this to every subscribed browser.']];
      }
      liveItems.push({ file: 'src/live.ts', lang: 'typescript', code: code, lines: lines });
      s.push({ id: 'live', title: 'Add live updates', items: liveItems });
    }

    // Payments
    if (a.payment) {
      var fake = { stripe: "{ url: 'https://pay.example/1' }", adyen: "{ url: 'https://pay.example/1' }", paypal: "{ access_token: 't', links: [{ rel: 'payer-action', href: 'https://pay.example/1' }] }", klarna: "{ session_id: 's', redirect_url: 'https://pay.example/1' }" }[a.payment];
      s.push({ id: 'pay', title: 'Add payments with ' + Kit.PAYMENT[a.payment].name, items: Kit.paymentIntro(a).concat([
        T.paymentFile(a, 'src/'),
        { file: 'test/checkout.test.mjs', lang: 'javascript', code: "import assert from 'node:assert/strict';\nimport { test } from 'node:test';\nimport { createCheckout } from '../dist/checkout.js';\n\ntest('asks the provider for a payment page', async () => {\n  const real = globalThis.fetch;\n  globalThis.fetch = async () => new Response(JSON.stringify(" + fake + "), { status: 200 });\n  try {\n    assert.equal(await createCheckout('http://localhost:3000'), 'https://pay.example/1');\n  } finally {\n    globalThis.fetch = real;\n  }\n});\n", lines: [['globalThis.fetch =', 'Replaces the network call with a simulated response, so this test needs no account and spends no money.']] }
      ]).concat(Kit.paymentOutro(a)) });
    }

    // Controllers
    var notify = a.transport ? '\n    tasksChanged();' : '';
    var liveImport = a.transport ? "import { tasksChanged } from './live.js';\n" : '';
    var guardLine = login ? "@UseGuards(LoginGuard)\n" : '';
    var appItems = [];
    var controllers = [], providers = [], moduleImports = [], moduleExtra = [];
    if (isRest) {
      controllers.push('TasksController');
      moduleImports.push("import { TasksController } from './tasks.controller.js';");
      var names = ['BadRequestException', 'Body', 'Controller', 'Get', 'NotFoundException', 'Param', 'Post', 'Put', 'Res'].concat(login ? ['UseGuards'] : []).concat(a.admin === 'react-admin' ? ['Delete', 'ForbiddenException', 'Req'] : []).sort();
      appItems.push({ file: 'src/tasks.controller.ts', lang: 'typescript', code: "import { " + names.join(', ') + " } from '@nestjs/common';\nimport type { " + (a.admin === 'react-admin' ? 'Request, ' : '') + "Response } from 'express';\n" + (a.admin === 'react-admin' ? "import { isAdmin } from './auth.js';\n" : '') + liveImport + (login ? "import { " + (a.admin === 'react-admin' ? 'currentUser, ' : '') + "LoginGuard } from './login.guard.js';\n" : '') + "import { addTask, " + (a.admin === 'react-admin' ? 'deleteTask, ' : '') + "listTasks, setDone } from './tasks.js';\n\n" + guardLine + "@Controller('api/tasks')\nexport class TasksController {\n  @Get()\n  async list(@Res({ passthrough: true }) res: Response) {\n    const tasks = await listTasks();\n    res.set('Content-Range', `tasks 0-${tasks.length}/${tasks.length}`);\n    res.set('Access-Control-Expose-Headers', 'Content-Range');\n    return tasks;\n  }\n\n  @Get(':id')\n  async one(@Param('id') id: string) {\n    const task = (await listTasks()).find((t) => t.id === id);\n    if (!task) throw new NotFoundException();\n    return task;\n  }\n\n  @Post()\n  async create(@Body() body: { title?: unknown }) {\n    const title = String(body.title ?? '').trim();\n    if (!title || title.length > 200) throw new BadRequestException('A title of 1 to 200 characters is required');\n    const task = await addTask(title);" + notify + "\n    return task;\n  }\n\n  @Put(':id')\n  async change(@Param('id') id: string, @Body() body: { done?: unknown }) {\n    await setDone(id, Boolean(body.done));" + notify + "\n    return (await listTasks()).find((t) => t.id === id) ?? null;\n  }\n" + (a.admin === 'react-admin' ? "\n  @Delete(':id')\n  async remove(@Param('id') id: string, @Req() req: Request) {\n    const user = await currentUser(req);\n    if (!user || !isAdmin(user.email)) throw new ForbiddenException();\n    await deleteTask(id);" + notify + "\n    return { id };\n  }\n" : '') + "}\n", lines: [
        ['@Controller', 'A class whose methods answer requests under this path.'],
        ['@Get, @Post, @Put', 'Tie a method to an HTTP method. Nest sends the returned value as JSON, and <code>@Post</code> answers with status 201.']
      ].concat(login ? [['@UseGuards', 'Runs the login check before every route here.']] : []).concat([
        ['@Res({ passthrough: true })', 'Gives access to the response to set headers, while still letting Nest send the returned value.'],
        ['Content-Range', 'Tells clients how many rows exist. React-admin needs this.'],
        ['@Param and @Body', 'Read part of the URL and the JSON body.'],
        ['NotFoundException', 'Throwing it sends a 404 response.'],
        ['title.length > 200', 'Never trust input. This rejects anything the database wouldn\'t accept.']
      ]) });
    }
    if (isGql) {
      providers.push('TasksResolver');
      moduleImports.push("import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';", "import { GraphQLModule } from '@nestjs/graphql';", "import { TasksResolver } from './tasks.resolver.js';");
      moduleExtra.push("GraphQLModule.forRoot<ApolloDriverConfig>({ driver: ApolloDriver, autoSchemaFile: true })");
      appItems.push({ file: 'src/tasks.resolver.ts', lang: 'typescript', code: "import { Args, Field, ID, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';\n" + liveImport + "import { addTask, listTasks, setDone } from './tasks.js';\n\n@ObjectType()\nclass Task {\n  @Field(() => ID) id!: string;\n  @Field() title!: string;\n  @Field() done!: boolean;\n}\n\n@Resolver(() => Task)\nexport class TasksResolver {\n  @Query(() => [Task])\n  tasks() {\n    return listTasks();\n  }\n\n  @Mutation(() => Task)\n  async addTask(@Args('title') title: string) {\n    const task = await addTask(title);" + notify + "\n    return task;\n  }\n\n  @Mutation(() => Boolean)\n  async setDone(@Args('id', { type: () => ID }) id: string, @Args('done') done: boolean) {\n    await setDone(id, done);" + notify + "\n    return true;\n  }\n}\n", lines: [['@ObjectType and @Field', 'Describe a GraphQL type. Nest builds the schema from these classes.'], ['@Resolver', 'A class whose methods answer GraphQL requests.'], ['@Query and @Mutation', 'Mark methods that read and change data.'], ['@Args', 'Reads an argument from the request.']] });
    }
    var usePages = templates || a.admin === 'in-app' || login || a.payment;
    if (usePages) {
      controllers.push('PagesController');
      moduleImports.push("import { PagesController } from './pages.controller.js';");
      var pn = ['Controller'];
      if (templates || a.admin === 'in-app' || login) pn.push('Get');
      if (login || templates || a.admin === 'in-app' || a.payment) pn.push('Post', 'Req', 'Res');
      if (templates || a.admin === 'in-app') pn.push('Param');
      if (templates) pn.push('Body', 'Render');
      if (login && templates) pn.push('UseGuards');
      if (a.admin === 'in-app') pn.push('ForbiddenException');
      var pc = "import { " + pn.filter(function (x, i, l) { return l.indexOf(x) === i; }).sort().join(', ') + " } from '@nestjs/common';\nimport { join } from 'node:path';\nimport type { Request, Response } from 'express';\n";
      if (login) pc += "import { fromNodeHeaders } from 'better-auth/node';\nimport { auth" + (a.admin === 'in-app' ? ', isAdmin' : '') + " } from './auth.js';\nimport { currentUser" + (templates ? ', LoginGuard' : '') + " } from './login.guard.js';\n";
      if (a.payment) pc += "import { createCheckout } from './checkout.js';\n";
      pc += liveImport;
      if (templates || a.admin === 'in-app') pc += "import { " + (templates ? 'addTask, ' : '') + (a.admin === 'in-app' ? 'deleteTask, ' : '') + "listTasks" + (templates ? ', setDone' : '') + " } from './tasks.js';\n";
      pc += "\n@Controller()\nexport class PagesController {\n";
      var parts = [];
      if (login) parts.push("  @Get('login')\n  loginPage(@Res() res: Response) {\n    res.sendFile(join(process.cwd(), 'public/login.html'));\n  }\n\n  @Post('logout')\n  async logout(@Req() req: Request, @Res() res: Response) {\n    const out = await auth.api.signOut({ headers: fromNodeHeaders(req.headers), asResponse: true });\n    out.headers.getSetCookie().forEach((cookie) => res.append('Set-Cookie', cookie));\n    res.redirect(303, '/login');\n  }\n");
      if (templates) {
        parts.push("  @Get()\n  async home(@Req() req: Request, @Res() res: Response) {\n" + (login ? "    if (!(await currentUser(req))) return res.redirect('/login');\n" : '') + "    res.render('index', { tasks: await listTasks() });\n  }\n");
        parts.push((login ? "  @UseGuards(LoginGuard)\n" : '') + "  @Get('tasks')\n  @Render('list')\n  async listPart() {\n    return { tasks: await listTasks() };\n  }\n");
        parts.push((login ? "  @UseGuards(LoginGuard)\n" : '') + "  @Post('tasks')\n  @Render('list')\n  async add(@Body() body: { title?: string }) {\n    const title = String(body.title ?? '').trim();\n    if (title && title.length <= 200) {\n      await addTask(title);" + (a.transport ? '\n      tasksChanged();' : '') + "\n    }\n    return { tasks: await listTasks() };\n  }\n");
        parts.push((login ? "  @UseGuards(LoginGuard)\n" : '') + "  @Post('tasks/:id/toggle')\n  @Render('list')\n  async toggle(@Param('id') id: string, @Body() body: { done?: string }) {\n    await setDone(id, body.done === 'on');" + notify + "\n    return { tasks: await listTasks() };\n  }\n");
      }
      if (a.admin === 'in-app') parts.push("  @Get('admin')\n  async admin(@Req() req: Request, @Res() res: Response) {\n    const user = await currentUser(req);\n    if (!user) return res.redirect('/login');\n    if (!isAdmin(user.email)) throw new ForbiddenException();\n    res.render('admin', { tasks: await listTasks() });\n  }\n\n  @Post('admin/tasks/:id/delete')\n  async remove(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {\n    const user = await currentUser(req);\n    if (!user || !isAdmin(user.email)) throw new ForbiddenException();\n    await deleteTask(id);" + notify + "\n    res.redirect(303, '/admin');\n  }\n");
      if (a.payment) parts.push("  @Post('api/checkout')\n  async checkout(@Req() req: Request, @Res() res: Response) {\n" + (login ? "    if (!(await currentUser(req))) return res.redirect(303, '/login');\n" : '') + "    const baseUrl = process.env.PUBLIC_URL ?? `${req.protocol}://${req.get('host')}`;\n    res.redirect(303, await createCheckout(baseUrl));\n  }\n");
      pc += parts.join('\n') + "}\n";
      var pl = [['@Controller()', 'With no path, its routes start at the site\'s root.'], ['@Res()', 'Takes over the response, so this method sends it itself.']];
      if (login) pl.push(['loginPage', 'Sends your login page.'], ['logout', 'Ends the session and clears the cookie. It\'s a POST so other sites can\'t log someone out with a link.']);
      if (templates) pl.push(['res.render', 'Fills in a template and sends the HTML.'], ['@Render(\'list\')', 'Returns only the list, because htmx swaps just that part of the page.'], ["body.done === 'on'", 'A checked checkbox sends <code>on</code>, and an unchecked one sends nothing.']);
      if (a.admin === 'in-app') pl.push(['isAdmin', 'The check runs on the server. Hiding a link isn\'t protection, because anyone can type a URL.'], ['ForbiddenException', 'Sends a 403: logged in, but not allowed.']);
      if (a.payment) pl.push(['PUBLIC_URL', 'Your site\'s real address. Set this in production, because the <code>Host</code> header can be forged.']);
      appItems.push({ file: 'src/pages.controller.ts', lang: 'typescript', code: pc, lines: pl });
    }
    if (a.transport === 'sse' || a.transport === 'managed') { controllers.push('LiveController'); moduleImports.push("import { LiveController } from './live.js';"); }
    if (a.transport === 'websocket' || a.transport === 'library') { providers.push('LiveGateway'); moduleImports.push("import { LiveGateway } from './live.js';"); }
    appItems.push({ file: 'src/app.module.ts', lang: 'typescript', code: "import { Module } from '@nestjs/common';\n" + moduleImports.join('\n') + "\n\n@Module({\n  imports: [" + moduleExtra.join(', ') + "],\n  controllers: [" + controllers.join(', ') + "],\n  providers: [" + providers.join(', ') + "],\n})\nexport class AppModule {}\n", lines: [['@Module', 'Lists the parts of your app, so Nest can create and connect them.'], ['controllers', 'Classes that answer requests.']].concat(providers.length ? [['providers', 'Other classes Nest should create.']] : []).concat(moduleExtra.length ? [['GraphQLModule', 'Serves GraphQL at <code>/graphql</code>. <code>autoSchemaFile: true</code> builds the schema from your classes.']] : []) });
    var mainImports = "import { NestFactory } from '@nestjs/core';\nimport type { NestExpressApplication } from '@nestjs/platform-express';\n" + (isRest ? "import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';\n" : '') + (a.transport === 'websocket' ? "import { WsAdapter } from '@nestjs/platform-ws';\n" : '') + (login ? "import { toNodeHandler } from 'better-auth/node';\n" : '') + "import express from 'express';\nimport { join } from 'node:path';\nimport { AppModule } from './app.module.js';\n" + (login ? "import { auth } from './auth.js';\n" + (isGql ? "import { currentUser } from './login.guard.js';\n" : '') : '');
    var main = mainImports + "\nconst app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });\n";
    if (login) main += "app.getHttpAdapter().getInstance().all('/api/auth/{*any}', toNodeHandler(auth));\n";
    main += "app.use(express.json());\napp.use(express.urlencoded({ extended: false }));\n";
    if (a.transport === 'websocket') main += "app.useWebSocketAdapter(new WsAdapter(app));\n";
    if (needsEjs) main += "app.setBaseViewsDir(join(process.cwd(), 'views'));\napp.setViewEngine('ejs');\n";
    if (spa) main += "app.useStaticAssets(join(process.cwd(), '" + Kit.spaDistPath(a) + "'));\n";
    if (login && isGql) main += "app.use('/graphql', async (req: express.Request, res: express.Response, next: express.NextFunction) => {\n  if (await currentUser(req)) return next();\n  res.status(401).json({ error: 'Log in first' });\n});\n";
    if (isRest) main += "SwaggerModule.setup('api/docs', app, () => SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('Tasks').build()));\n";
    main += "await app.listen(process.env.PORT ?? 3000);\n";
    var ml = [['NestFactory.create', 'Builds your app from its module.'], ['bodyParser: false', 'Stops Nest from reading request bodies itself, so the steps below control the order.']];
    if (login) ml.push(["all('/api/auth/{*any}')", 'Gives Better Auth its routes, before bodies are read, because it reads them itself.']);
    ml.push(['express.json and urlencoded', 'Read JSON and HTML form bodies into <code>body</code>.']);
    if (a.transport === 'websocket') ml.push(['WsAdapter', 'Tells Nest to use the standard <code>ws</code> library.']);
    if (needsEjs) ml.push(['setViewEngine', 'Uses EJS templates from the <code>views</code> folder.']);
    if (spa) ml.push(['useStaticAssets', 'Serves your built frontend from the same server.']);
    if (login && isGql) ml.push(["app.use('/graphql'", 'Runs the login check before any GraphQL request.']);
    if (isRest) ml.push(['SwaggerModule.setup', 'Serves API docs at <code>/api/docs</code>.']);
    ml.push(['process.env.PORT', 'Hosting platforms choose the port and pass it this way.']);
    appItems.push({ file: 'src/main.ts', lang: 'typescript', code: main, lines: ml });
    s.push({ id: 'app', title: 'Write the app', items: appItems });

    T.ejsViews(a, s);
    if (spa) s.push({ id: 'frontend', title: 'Build the frontend', items: Kit.spaItems(a, 3000) });
    if (a.admin === 'react-admin') s.push({ id: 'admin', title: 'Add the admin app', items: Kit.reactAdminItems(a, 3000) });
    if (a.admin === 'low-code') s.push({ id: 'admin', title: 'Add the admin tool', items: Kit.lowCodeItems(a) });

    // Tests run against the compiled app.
    var body;
    if (login) {
      var probe = isRest ? "'/api/tasks'" : isGql ? "'/graphql', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{\"query\":\"{ tasks { id } }\"}' }" : "'/tasks'";
      body = "test('logged-out visitors are blocked', async () => {\n  const res = await fetch(base + " + probe + ");\n  assert.equal(res.status, 401);\n});\n";
    } else if (isGql) {
      body = "test('GraphQL adds and lists tasks', async () => {\n  const send = (query) => fetch(base + '/graphql', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) }).then((r) => r.json());\n  const added = await send('mutation { addTask(title: \"Through GraphQL\") { id } }');\n  assert.ok(added.data.addTask.id);\n  const list = await send('{ tasks { id title done } }');\n  assert.ok(list.data.tasks.some((t) => t.title === 'Through GraphQL'));\n});\n";
    } else if (isRest) {
      body = "test('the REST API adds, changes and lists tasks', async () => {\n  const created = await fetch(base + '/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Through the API' }) });\n  assert.equal(created.status, 201);\n  const task = await created.json();\n  const changed = await fetch(base + '/api/tasks/' + task.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ done: true }) });\n  assert.equal((await changed.json()).done, true);\n  const list = await fetch(base + '/api/tasks');\n  assert.ok(list.headers.get('content-range'));\n  assert.ok((await list.json()).some((t) => t.id === task.id));\n});\n\ntest('an empty title is rejected', async () => {\n  const res = await fetch(base + '/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });\n  assert.equal(res.status, 400);\n});\n";
    } else {
      body = "test('the page shows tasks and escapes titles', async () => {\n  await fetch(base + '/tasks', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'title=' + encodeURIComponent('<b>From a form</b>') });\n  const html = await (await fetch(base + '/')).text();\n  assert.ok(html.includes('&lt;b&gt;From a form&lt;/b&gt;'));\n});\n";
    }
    if (a.admin === 'in-app') body += "\ntest('the admin page needs a login', async () => {\n  const res = await fetch(base + '/admin', { redirect: 'manual' });\n  assert.equal(res.status, 302);\n});\n";
    s.push({ id: 'test', title: 'Test it', items: [
      { file: 'test/app.test.mjs', lang: 'javascript', code: "import assert from 'node:assert/strict';\nimport { spawn } from 'node:child_process';\nimport { after, before, test } from 'node:test';\n\nconst base = 'http://localhost:3101';\nlet server;\n\nbefore(async () => {\n  server = spawn(process.execPath, ['dist/main.js'], { env: { ...process.env, PORT: '3101' }, stdio: 'inherit' });\n  for (let i = 0; i < 240; i++) {\n    const up = await fetch(base + '/').then(() => true, () => false);\n    if (up) return;\n    await new Promise((resolve) => setTimeout(resolve, 500));\n  }\n  throw new Error('The server did not start');\n});\n\nafter(() => {\n  server.kill();\n});\n\n" + body, lines: [['spawn', 'Starts your compiled app in the background, on a port kept for tests.'], ['for loop', 'Waits until the server answers, because starting takes a moment.'], ['test', 'Node\'s built-in test runner, making real HTTP requests. Nest\'s default test setup also works, but this one is the same for every kind of app.']] },
      { cmd: 'npm test', lines: [['npm test', 'Compiles the app and runs the tests. They use whichever database <code>DATABASE_URL</code> points at, so use a development database.']] },
      { p: 'Then start it with the command below and open <code>http://localhost:3000</code>.' + (isRest ? ' API docs are at <code>/api/docs</code>.' : '') + (spa ? ' For the frontend, also run <code>npm run dev</code> inside <code>web</code>, and open the address it prints.' : '') },
      { cmd: 'npm run start:dev', manual: true, lines: [['start:dev', 'Starts the server and restarts it when you save a file. Press Ctrl+C to stop it.']] }
    ] });

    var envList = ['DATABASE_URL'];
    if (login) envList.push('BETTER_AUTH_SECRET', 'BETTER_AUTH_URL', 'ADMIN_EMAILS');
    if (oidc) envList.push('OIDC_ISSUER', 'OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET');
    if (a.transport === 'managed') envList.push('ABLY_API_KEY');
    if (a.payment) { envList.push('PUBLIC_URL'); Kit.PAYMENT[a.payment].env.forEach(function (e) { envList.push(e[0]); }); }
    var spaBuild = spa ? "FROM node:24-slim AS frontend\nWORKDIR /web\nCOPY web/package*.json ./\nRUN npm ci\nCOPY web/ ./\nRUN npm run build\n\n" : '';
    var docker = spaBuild + "FROM node:24-slim\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\nRUN npm prune --omit=dev\n" + (spa ? "COPY --from=frontend /web/dist ./web/dist\n" : '') + "ENV NODE_ENV=production\nUSER node\nEXPOSE 3000\nCMD [\"node\", \"dist/main.js\"]\n";
    s.push({ id: 'deploy', title: 'Deploy it', items: Kit.hostingItems(a, { port: 3000, env: envList, dockerfile: docker, dockerignore: 'node_modules\ndist\nweb/node_modules\nweb/dist\nadmin/node_modules\n.git\n.env\n*.db\n', dockerLines: [
      ['node:24-slim', 'A small official image with Node 24.'],
      ['npm ci', 'Installs exactly what <code>package-lock.json</code> lists.'],
      ['npm run build', 'Compiles your TypeScript into <code>dist</code>.'],
      ['npm prune --omit=dev', 'Removes development tools that were only needed to build.']
    ].concat(spa ? [['AS frontend', 'A first stage builds the frontend, and only its finished files are copied into the final image.']] : []).concat([
      ['USER node', 'Runs as a limited user rather than as root.'],
      ['CMD', 'What runs when the container starts.']
    ]) }) });
    return s;
  }
  Kit.frameworks.nestjs = nest;
})(StackKit);
