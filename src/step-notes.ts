// @ts-nocheck -- moved from the single-file page; types are added module by module.
import { StackKit } from './stack-kit';

// A short comparison card for each step: what its options share, where they really differ, and what carries over between them.
(function (Kit) {
  var SHARED_ENGINE = ['A game loop that updates and draws every frame', 'Loading images, sounds and models', 'Input, collisions, timers and game states'];
  var NOTES = {
    product: {
      shared: ['Programming basics, Git and debugging', 'Testing ideas and thinking in small steps', 'Online features: a game backend is a web backend with different traffic'],
      differs: ['A game redraws many times a second, so tiny delays matter', 'A website mostly waits for a request, then answers it', 'Games ship as a download, while a site updates for everyone at once']
    },
    needs: {
      shared: ['All four need a server of your own or a hosted service, so a site with none of them can stay simple and cheap'],
      differs: ['Accounts and admin areas add security work', 'Selling adds a payment provider, and legal and tax duties', 'Live updates add long-running connections'],
      know: ['Adding one later is usually easier than running one you never needed.']
    },
    siteStack: {
      shared: ['Every option ends in HTML, CSS and JavaScript in a browser', 'Your domain, images and most of your written content can move with you'],
      differs: ['How much is done for you, and how much you can change', 'Hosted tools charge monthly, while self-run ones cost your time', 'Static sites have no server code to attack or keep updated'],
      carries: ['HTML and CSS carry over completely', 'Theme and plugin knowledge stays with that platform']
    },
    contentSource: {
      shared: ['The page is built from the same content, wherever it\'s stored', 'Markdown moves easily between most of these'],
      differs: ['Who edits: developers in Git, or anyone in a web editor', 'Git keeps full history, and a CMS adds drafts and roles']
    },
    contentHost: {
      shared: ['They all serve finished files, usually through a content delivery network', 'HTTPS and custom domains are normal', 'Moving is mostly a matter of changing where your domain points'],
      differs: ['Free limits and build minutes', 'Preview links and form or function add-ons, which can tie you to that host']
    },
    language: {
      shared: ['HTTP: requests, responses, status codes, cookies and headers', 'SQL, indexes and transactions', 'JSON, REST and GraphQL', 'Login concepts such as sessions and password hashing', 'Docker, environment variables and deployment', 'Git and the idea of automated tests'],
      differs: ['How much the compiler catches before you run anything', 'How each handles many requests at once', 'How errors are reported', 'Ecosystem: which libraries exist, and how jobs are distributed'],
      carries: ['<strong>Java and C#</strong> are the closest pair. Classes, generics, annotations and dependency injection look much the same.', '<strong>C or C++ to Go</strong> is short: pointers and structs feel familiar, with garbage collection added.', '<strong>TypeScript</strong> also runs your browser code, so one language covers both ends.', '<strong>Python</strong> reads easily from any of them, but it relies more on tests than on a compiler.'],
      table: { head: ['', 'Types', 'Many requests at once', 'Errors', 'Compiles to'], rows: [
        ['C#', 'Checked when compiling', '<code>async</code> and <code>await</code> on a thread pool', 'Exceptions', '.NET runtime'],
        ['Go', 'Checked when compiling', 'Goroutines', 'Returned as values', 'A single program'],
        ['Java', 'Checked when compiling', 'Threads, including virtual threads since Java 21', 'Exceptions', 'JVM bytecode'],
        ['Python', 'Checked at runtime, with optional hints', '<code>async</code> or several processes', 'Exceptions', 'Runs directly'],
        ['TypeScript', 'Checked when compiling, then removed', 'One thread with an event loop', 'Exceptions', 'JavaScript']
      ] },
      know: ['All five manage memory for you, so you don\'t free memory by hand as in C.', 'Every guide on this page builds the same small task app, so you can compare languages side by side.', 'Your second language is usually much quicker to learn, because most of the above is already familiar.']
    },
    framework: {
      shared: ['Routes that connect a URL to your code', 'Middleware or filters that run before a route', 'Reading JSON and forms, and sending responses', 'Settings read from the environment'],
      differs: ['How much comes built in', 'How much structure it expects of you'],
      carries: ['Moving from a small framework to a large one mostly means learning its conventions, as the web concepts stay the same.'],
      table: { head: ['Language', 'Includes a lot', 'Smaller, you add parts'], rows: [
        ['C#', 'ASP.NET Core MVC', 'ASP.NET Core minimal APIs'],
        ['Go', 'None of these', 'Gin, Echo, standard library'],
        ['Java', 'Spring Boot, Jakarta EE', 'Quarkus, Micronaut, which start faster and also include a lot'],
        ['Python', 'Django', 'Flask, FastAPI'],
        ['TypeScript', 'NestJS, Next.js', 'Express, Fastify']
      ] }
    },
    'framework:csharp': {
      know: ['All three share the same hosting, middleware, dependency injection and data libraries, so switching style inside ASP.NET Core costs little.', 'Blazor is the odd one out: you write the interface in C# as well.']
    },
    'framework:go': {
      know: ['Gin and Echo are both built on Go\'s standard <code>net/http</code>, so that knowledge carries over directly.', 'Since Go 1.22, the standard library can route by method and path by itself, which removes the main reason many projects added a framework.', 'Handlers look different in each, which is the main cost of switching.']
    },
    'framework:java': {
      know: ['Jakarta EE is a set of standard APIs, and the others reuse parts of it, such as Jakarta Persistence and Jakarta Inject.', 'Quarkus and Micronaut do more work when compiling, so they start faster and use less memory than a classic setup.', 'Dependency injection and annotations carry over between all four.']
    },
    'framework:python': {
      know: ['Flask and FastAPI feel alike: small apps, with routes written as decorated functions.', 'FastAPI adds automatic validation and API docs from your type hints.', 'Django includes its own database layer, login and admin site, so less of its knowledge moves to the other two.']
    },
    'framework:typescript': {
      know: ['Express and Fastify are close: both are small, with routes as functions.', 'NestJS runs on top of Express or Fastify, and adds structure much like Spring Boot.', 'Next.js is different: it combines your React frontend and backend in one project.']
    },
    build: {
      shared: ['Both download from Maven Central, using the same library names', 'Both use the same <code>src/main/java</code> layout', 'Both come with a wrapper script, so no separate install is needed'],
      differs: ['Maven uses a fixed XML file, which is verbose but predictable', 'Gradle uses a script, which is shorter and more flexible, and is usually faster on large projects'],
      carries: ['Knowing how dependencies and build phases work carries over completely.']
    },
    frontend: {
      shared: ['HTML, CSS and browser JavaScript', 'Forms, accessibility and how the browser talks to your server', 'Escaping user input, which every option here does by default'],
      differs: ['Where the page is built: in the browser, or on the server', 'How much JavaScript the visitor downloads', 'Whether you need a separate build step and an API'],
      carries: ['Components and state carry over well between React, Vue and Angular, though the syntax differs.', 'Templates with htmx share little with those three, but your server skills apply directly.'],
      table: { head: ['Idea', 'React', 'Vue', 'Angular'], rows: [
        ['Value that updates the page', '<code>useState</code>', '<code>ref</code>', '<code>signal</code>'],
        ['Run code when something changes', '<code>useEffect</code>', '<code>watch</code>', '<code>effect</code>'],
        ['Reusable piece of page', 'Function component', 'Single-file component', 'Component class']
      ] }
    },
    frontendLanguage: {
      shared: ['The same language underneath, because TypeScript is JavaScript with types added', 'The same frameworks, libraries and browser features', 'The same code once it reaches the browser'],
      differs: ['TypeScript checks your code before it runs, and JavaScript doesn\'t', 'TypeScript needs a build step, though React and Vue projects have one anyway', 'TypeScript asks you to describe your data'],
      carries: ['Everything you learn in JavaScript applies in TypeScript. Moving from one to the other can happen a file at a time.'],
      know: ['TypeScript\'s types are removed when it compiles, so they don\'t check data at runtime. You still validate what comes from outside.']
    },
    api: {
      shared: ['REST and GraphQL both run over HTTP and usually send JSON', 'Login, validation and permission checks work the same way'],
      differs: ['REST has one URL per kind of thing, which browsers and proxies can cache easily', 'GraphQL has one URL, and the client asks for exactly the fields it wants', 'Server-rendered pages send HTML, so there\'s no separate API to maintain'],
      carries: ['Your data code stays the same whichever you pick, so you can add another later.']
    },
    transport: {
      shared: ['The server tells browsers that something changed', 'Each connection stays open, which uses server resources', 'With several copies of your app, the copies need a way to tell each other'],
      differs: ['Server-Sent Events only go from server to browser, and browsers reconnect by themselves', 'WebSockets go both ways, and you handle reconnecting yourself', 'SignalR and Socket.IO add reconnection and fallbacks, but need their own client library', 'A managed service handles the connections for a monthly price'],
      carries: ['The pattern of sending a small message that tells the page to reload its data works with all of them.']
    },
    saves: {
      shared: ['Save a version number with your data, so old saves still load after updates', 'Assume a save file can be damaged or edited'],
      differs: ['Local saves are simple, but stay on one device', 'Store cloud saves sync for free, but only on that store', 'Your own backend works everywhere and can\'t be edited easily, but you run it']
    },
    database: {
      shared: ['The SQL databases share tables, joins, indexes and transactions', 'Designing your data carefully matters in all of them, MongoDB included', 'Backups and connection settings are needed for any of them'],
      differs: ['SQL dialects: auto-numbered IDs, dates and JSON columns are written differently', 'SQLite and H2 run inside your app from a file, while the others are separate servers', 'MongoDB stores flexible documents rather than tables'],
      carries: ['Basic SQL moves between PostgreSQL, MySQL, SQL Server, SQLite and H2 with small changes.', 'MongoDB has its own query style, so less carries over, but indexing ideas still apply.'],
      table: { head: ['Database', 'Kind', 'Runs as'], rows: [
        ['PostgreSQL', 'SQL', 'A server'],
        ['MySQL or MariaDB', 'SQL', 'A server'],
        ['SQL Server', 'SQL', 'A server'],
        ['SQLite', 'SQL', 'A file, inside your app'],
        ['H2', 'SQL', 'A file or memory, inside your Java app'],
        ['MongoDB', 'Documents', 'A server']
      ] }
    },
    data: {
      shared: ['It all becomes SQL in the end, so knowing SQL helps with every option', 'Values are passed separately from the query, which prevents SQL injection'],
      differs: ['How much SQL you write yourself', 'How much is checked before you run the app', 'How easily you can tune a slow query'],
      carries: ['The same three styles exist in every language, so choosing a style carries over even when the library changes.'],
      table: { head: ['Language', 'Maps rows to objects', 'Builds or checks SQL', 'Plain SQL'], rows: [
        ['C#', 'Entity Framework Core', 'None of these', 'Dapper, ADO.NET'],
        ['Go', 'GORM, Ent', 'sqlc', 'database/sql, pgx'],
        ['Java', 'Hibernate, Spring Data JPA', 'jOOQ', 'MyBatis, Spring Data JDBC'],
        ['Python', 'Django ORM, SQLAlchemy', 'SQLAlchemy Core', 'psycopg'],
        ['TypeScript', 'Prisma, TypeORM', 'Kysely, Drizzle', 'None of these']
      ] }
    },
    migrations: {
      shared: ['Changes are kept in files, in order, and committed with your code', 'The tool records which have run in a table of its own', 'Never edit a change after it has run. Add a new one instead'],
      differs: ['Whether you write the SQL, or a tool generates it from your code', 'Whether it also comes with your data library', 'How well it can undo a change'],
      carries: ['The workflow is the same everywhere. Flyway also works with every language here, so it can follow you between stacks.']
    },
    login: {
      shared: ['Passwords are stored as one-way hashes, never as text', 'Sessions or tokens, cookies and logging out', 'Permission checks on the server'],
      differs: ['Whether you hold the passwords, or a provider does', 'What happens when you outgrow it, and what it costs per user', 'Who handles password resets and multi-factor login'],
      carries: ['Keycloak, Auth0 and Entra all use OpenID Connect, so moving between them is mostly settings, not code.', 'Login built into your framework stays with that framework.']
    },
    admin: {
      shared: ['The server must check permissions, whatever the screen looks like', 'They all read and change the same data'],
      differs: ['How much you build yourself', 'Whether it lives in your app or runs as a separate tool', 'How far it can be customized'],
      carries: ['Your permission rules carry over, so you can start simple and switch tools later.']
    },
    payment: {
      shared: ['Your server asks the provider for a payment page, then sends the customer there', 'Card details never touch your server', 'Secret keys stay on the server', 'Confirm each payment on your server, not from the return page'],
      differs: ['Fees and which countries they serve', 'Which payment methods customers can use', 'Whether they suit small shops or large businesses'],
      carries: ['The checkout flow is the same with all of them, so most of your code around it can stay when you change provider.']
    },
    hosting: {
      shared: ['Your app reads settings from environment variables', 'A Docker image runs much the same on most of these', 'You need logs, backups and HTTPS on all of them'],
      differs: ['How much you manage yourself, and what you pay for that', 'Whether it scales by itself', 'Who applies operating system updates'],
      carries: ['Start simple. With a Docker image, moving to a bigger option later is mostly configuration.']
    },
    platforms: {
      shared: ['Most game engines can export to several of these from one project'],
      differs: ['Input: mouse and keyboard, touch or a controller', 'Performance limits, especially on phones and in browsers', 'Consoles need a developer agreement before you can even get the tools'],
      know: ['Decide early, because input and performance affect your design more than your code.']
    },
    graphics: {
      shared: ['Game loops, input, audio, sound design and game rules', 'Vectors, collisions and timing'],
      differs: ['3D adds cameras, lighting, models and animation rigs, which take much more art and time', '2D is usually the quicker way to finish a first game'],
      carries: ['Game design and code structure carry over fully. 3D math extends what you learned in 2D.']
    },
    multiplayer: {
      shared: ['Never trust what a player\'s device reports, if cheating matters', 'Plan for lag and for players dropping out'],
      differs: ['Who runs the game: a player, or a server you pay for', 'How quickly updates must arrive', 'Turn-based games can use ordinary web requests, which are far simpler'],
      know: ['Adding online play to a finished game is hard, so choose before you start building.']
    },
    gameExtras: {
      shared: ['Each one can be added late, unlike online play', 'Stores and services often offer these ready-made'],
      know: ['If you collect data about players, check the privacy rules that apply to them.']
    },
    engine: {
      shared: SHARED_ENGINE,
      differs: ['Full engines give you an editor, while libraries like SDL or raylib give you only code', 'Licence terms and fees', 'Which languages you write in, and which platforms they export to'],
      carries: ['Game loops, vectors, state machines and asset pipelines carry over between all of them.', 'Scene and node ideas in Godot, Unity and Unreal are similar, though each has its own names.', 'Editor habits and engine-specific code don\'t carry over.'],
      table: { head: ['Kind', 'Examples', 'You mainly learn'], rows: [
        ['Full engine with editor', 'Godot, Unity, Unreal, GameMaker', 'That engine\'s tools'],
        ['Code library', 'SDL, raylib, MonoGame, libGDX, SFML', 'How games work underneath'],
        ['Runs in a browser', 'Phaser, Three.js, Babylon.js, PlayCanvas', 'Web skills plus game skills']
      ] }
    },
    scripting: {
      shared: ['Variables, conditions, events and game state exist in every option', 'The engine\'s own objects and tools stay the same whichever you pick'],
      differs: ['Text code is easier to compare, review and search', 'Visual scripting is quicker to start, but gets harder to manage as it grows', 'Lower-level languages run faster, and take longer to write'],
      carries: ['The way you think about game logic carries over, even from visual tools to code.']
    },
    gameBackend: {
      shared: ['Player accounts, storing data and matching players are the usual jobs', 'Check everything on the server, because players can tamper with the game'],
      differs: ['Whether you run the servers', 'Whether it ties you to one store or company', 'How much you can customize'],
      carries: ['A custom game backend uses the same skills as a web backend, so the website stages of this page apply to it.']
    },
    achievements: {
      shared: ['The game decides when something is earned, and then records it'],
      differs: ['Whether players see it in the store\'s own interface', 'How hard it is to cheat', 'Whether it works across stores'],
      carries: ['Keep your award logic in one place, so you can add stores later without changing the rules.']
    },
    crash: {
      shared: ['All of them capture what happened just before a crash', 'Player data may be included, so check what gets sent'],
      differs: ['Whether reports reach you automatically', 'How much setup and cost they bring', 'Which platforms they support']
    },
    analytics: {
      shared: ['You record named events, such as a level being finished', 'Privacy rules apply, so collect only what you\'ll use'],
      differs: ['Who holds the data', 'How much you can analyse beyond what\'s built in', 'Which engines they work with'],
      carries: ['Your list of events carries over, so sending them through one function in your code makes switching easy.']
    },
    serviceHost: {
      shared: ['Nakama works the same in each, so your game code doesn\'t change', 'It needs a database and backups'],
      differs: ['How much you operate yourself', 'Cost at small and large scale']
    },
    distribution: {
      shared: ['Store pages, screenshots and a trailer matter everywhere', 'Your game build stays mostly the same on PC stores'],
      differs: ['The share of each sale they take, and their review process', 'Whether they bring you an audience', 'Consoles and phones add approval steps'],
      carries: ['You can usually sell on several at once, unless a deal makes you exclusive.']
    }
  };
  Kit.stepNote = function (id, a) {
    var base = NOTES[id];
    var extra = NOTES[id + ':' + (a && a.language)];
    if (!base) return null;
    return extra ? Object.assign({}, base, { know: (base.know || []).concat(extra.know || []) }) : base;
  };
  Kit.stepNoteIds = Object.keys(NOTES);
})(StackKit);
