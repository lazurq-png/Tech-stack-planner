// @ts-nocheck -- moved from the single-file page; types are added module by module.
// Guide parts shared by every language. Each framework file builds its sections from these.
export const StackKit: any = (function () {
  var frameworks = {};

  function isSpa(a) { return ['react', 'vue', 'angular'].indexOf(a.frontend) >= 0; }
  function hasNeed(a, n) { return (a.needs || []).indexOf(n) >= 0; }
  function wantsLogin(a) { return !!a.login; }
  function usesOidc(a) { return ['keycloak', 'auth0', 'entra'].indexOf(a.login) >= 0; }

  // Plain SQL, for tools that run SQL files.
  function ddlTasks(db) {
    if (db === 'postgresql') return 'create table tasks (\n  id integer generated always as identity primary key,\n  title varchar(200) not null,\n  done boolean not null default false\n);\n';
    if (db === 'mysql') return 'create table tasks (\n  id integer not null auto_increment primary key,\n  title varchar(200) not null,\n  done boolean not null default false\n);\n';
    if (db === 'sqlserver') return 'create table tasks (\n  id int identity(1,1) primary key,\n  title nvarchar(200) not null,\n  done bit not null default 0\n);\n';
    return 'create table tasks (\n  id integer primary key autoincrement,\n  title varchar(200) not null,\n  done boolean not null default 0\n);\n';
  }
  function ddlUsers(db) {
    if (db === 'postgresql') return 'create table users (\n  id integer generated always as identity primary key,\n  email varchar(200) not null unique,\n  password_hash varchar(300) not null,\n  role varchar(20) not null default \'user\'\n);\n';
    if (db === 'mysql') return 'create table users (\n  id integer not null auto_increment primary key,\n  email varchar(200) not null unique,\n  password_hash varchar(300) not null,\n  role varchar(20) not null default \'user\'\n);\n';
    if (db === 'sqlserver') return 'create table users (\n  id int identity(1,1) primary key,\n  email nvarchar(200) not null unique,\n  password_hash nvarchar(300) not null,\n  role nvarchar(20) not null default \'user\'\n);\n';
    return 'create table users (\n  id integer primary key autoincrement,\n  email varchar(200) not null unique,\n  password_hash varchar(300) not null,\n  role varchar(20) not null default \'user\'\n);\n';
  }
  var DDL_LINES = [
    ['create table tasks', 'Makes the table that holds your tasks.'],
    ['id', 'A number the database generates for each row. It identifies the task in URLs.'],
    ['title varchar(200) not null', 'Text of up to 200 characters. <code>not null</code> means every task must have one.'],
    ['done', 'Whether the task is finished. New tasks start unfinished.']
  ];
  var USER_DDL_LINES = [
    ['unique', 'Stops two accounts from using the same email.'],
    ['password_hash', 'A one-way scrambled form of the password. Never store the password itself.'],
    ['role', 'Either <code>user</code> or <code>admin</code>. The app checks it before showing admin screens.']
  ];

  function dbSetup(a) {
    var items = [];
    if (a.database === 'postgresql') {
      items.push({ p: 'Install PostgreSQL from <a href="https://www.postgresql.org/download/">postgresql.org</a> and make sure it\'s running. Most installers start it automatically and ask you to choose a password for the <code>postgres</code> user. Then create the database:' });
      items.push({ cmd: 'createdb -U postgres demo', manual: true, lines: [['createdb', 'A tool that comes with PostgreSQL. If it isn\'t found, add PostgreSQL\'s <code>bin</code> folder to your <code>PATH</code>.'], ['-U postgres', 'Connects as the <code>postgres</code> user.'], ['demo', 'The new database\'s name.']] });
    }
    if (a.database === 'mysql') {
      items.push({ p: 'Install MySQL Community Server from <a href="https://dev.mysql.com/downloads/mysql/">mysql.com</a>, or MariaDB from <a href="https://mariadb.org/download/">mariadb.org</a>, and make sure it\'s running. Then create the database:' });
      items.push({ cmd: 'mysql -u root -p -e "create database demo"', manual: true, lines: [['-u root', 'Connects as the <code>root</code> user.'], ['-p', 'Asks for the password.'], ['-e', 'Runs one SQL statement and exits.']] });
    }
    if (a.database === 'sqlserver') {
      items.push({ p: 'Install <a href="https://www.microsoft.com/en-us/sql-server/sql-server-downloads">SQL Server</a>, or use a hosted server such as Azure SQL. Create an empty database called <code>demo</code> with your usual tool, such as <code>sqlcmd</code>:' });
      items.push({ cmd: 'sqlcmd -S localhost -U sa -C -Q "create database demo"', manual: true, lines: [['-S localhost', 'The server to connect to.'], ['-U sa', 'The administrator login. It asks for the password.'], ['-C', 'Trusts the server\'s development certificate.'], ['-Q', 'Runs one statement and exits.']] });
    }
    if (a.database === 'mongodb') items.push({ p: 'Install MongoDB Community Server from <a href="https://www.mongodb.com/try/download/community">mongodb.com</a> and make sure it\'s running. MongoDB creates the <code>demo</code> database the first time you save data, so there\'s nothing else to set up.' });
    if (a.database === 'sqlite') items.push({ p: 'SQLite stores everything in one file inside your project, so there\'s nothing to install or start. It suits development and small single-server sites.' });
    return items;
  }

  // Flyway works with any language, so every framework shares this.
  function flywayItems(a, opts) {
    var url = { postgresql: 'jdbc:postgresql://localhost:5432/demo', mysql: 'jdbc:mysql://localhost:3306/demo', sqlserver: 'jdbc:sqlserver://localhost:1433;databaseName=demo;trustServerCertificate=true', sqlite: 'jdbc:sqlite:demo.db' }[a.database];
    var items = [{ p: 'Flyway runs numbered SQL files in order and records which have run. Download the Flyway command-line tool from the <a href="https://documentation.red-gate.com/flyway/getting-started-with-flyway/quickstart-guides/quickstart-command-line">Flyway quickstart</a>, extract it and add its folder to your <code>PATH</code>.' }];
    items.push({ file: 'sql/V1__create_tasks.sql', lang: 'sql', code: ddlTasks(a.database), lines: DDL_LINES.concat([['V1__create_tasks.sql', 'The name matters: <code>V1</code> is the version, two underscores separate it from the description. Never edit a file after it has run. Add a new one instead.']]) });
    if (opts && opts.users) items.push({ file: 'sql/V2__create_users.sql', lang: 'sql', code: ddlUsers(a.database), lines: USER_DDL_LINES });
    var needsCredentials = a.database !== 'sqlite';
    items.push({ cmd: 'flyway -url="' + url + '"' + (needsCredentials ? ' -user="$DB_USER" -password="$DB_PASSWORD"' : '') + ' -locations=filesystem:sql migrate', flyway: true, lines: [['-url', 'The database in JDBC form, which is how Flyway connects.'], ['-locations=filesystem:sql', 'Where your SQL files are.'], ['migrate', 'Runs every file that hasn\'t run yet.']] });
    return items;
  }

  // ---------- Single-page frontends ----------
  function spaFetchNote(a) {
    return a.api === 'graphql' ? 'It sends GraphQL queries to <code>/graphql</code>.' : 'It calls the REST endpoints under <code>/api/tasks</code>.';
  }
  function clientApi(a) {
    var csrf = a.framework === 'django' ? "const csrf = () => document.cookie.match(/csrftoken=([^;]+)/)?.[1] ?? '';\n\n" : '';
    var csrfHeader = a.framework === 'django' ? ", 'X-CSRFToken': csrf()" : '';
    var csrfLine = a.framework === 'django' ? [['X-CSRFToken', 'Django rejects logged-in changes without this token, which it stores in a cookie. It proves the request came from your own site.']] : [];
    var login = wantsLogin(a) ? "\n  if (res.status === 401" + (a.framework === 'quarkus' && usesOidc(a) ? " || res.status === 499" : '') + ") {\n    location.href = '/login';\n    await new Promise(() => {});\n  }" : '';
    if (a.api === 'graphql') {
      return { file: 'web/src/api.ts', lang: 'typescript', code: "export type Task = { id: string; title: string; done: boolean };\n\n" + csrf + "async function gql(query: string, variables: object = {}) {\n  const res = await fetch('/graphql', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json'" + csrfHeader + " },\n    body: JSON.stringify({ query, variables }),\n  });" + login + "\n  const body = await res.json();\n  if (body.errors) throw new Error(body.errors[0].message);\n  return body.data;\n}\n\nexport async function listTasks(): Promise<Task[]> {\n  return (await gql('{ tasks { id title done } }')).tasks;\n}\n\nexport async function addTask(title: string): Promise<void> {\n  await gql('mutation ($title: String!) { addTask(title: $title) { id } }', { title });\n}\n\nexport async function setDone(id: string, done: boolean): Promise<void> {\n  await gql('mutation ($id: ID!, $done: Boolean!) { setDone(id: $id, done: $done) }', { id, done });\n}\n", lines: [
        ['type Task', 'Describes one task, so TypeScript can check how you use it.'],
        ['new Promise(() => {})', 'Only used with login. The browser is leaving for the login page, so this waits forever rather than raising an error.'],
        ['gql', 'A small helper that sends a query and returns its data. GraphQL always uses one URL and POST.'],
        ['body.errors', 'GraphQL reports many errors with a normal 200 status, so you must check this field.'],
        ['$title: String!', 'A variable. The <code>!</code> means it\'s required. Variables keep user input out of the query text.']
      ].concat(csrfLine) };
    }
    return { file: 'web/src/api.ts', lang: 'typescript', code: "export type Task = { id: string; title: string; done: boolean };\n\n" + csrf + "async function send(path: string, method = 'GET', body?: object) {\n  const res = await fetch(path, {\n    method,\n    headers: body ? { 'Content-Type': 'application/json'" + csrfHeader + " } : undefined,\n    body: body ? JSON.stringify(body) : undefined,\n  });" + login + "\n  if (!res.ok) throw new Error('Request failed: ' + res.status);\n  return res.status === 204 ? null : res.json();\n}\n\nexport const listTasks = (): Promise<Task[]> => send('/api/tasks');\nexport const addTask = (title: string) => send('/api/tasks', 'POST', { title });\nexport const setDone = (id: string, done: boolean) => send('/api/tasks/' + id, 'PUT', { done });\n", lines: [
      ['type Task', 'Describes one task, so TypeScript can check how you use it.'],
      ['new Promise(() => {})', 'Only used with login. The browser is leaving for the login page, so this waits forever rather than raising an error.'],
      ['send', 'A small helper around the browser\'s <code>fetch</code>, so each call below is one line.'],
      ['res.ok', 'True for any 2xx status. <code>fetch</code> doesn\'t treat a 404 or 500 as an error by itself.'],
      ['204', 'Means success with no body, so there is no JSON to read.']
    ].concat(csrfLine) };
  }
  function liveClient(a) {
    if (!a.transport) return null;
    var body = {
      websocket: "export function onTasksChanged(run: () => void) {\n  const scheme = location.protocol === 'https:' ? 'wss://' : 'ws://';\n  const socket = new WebSocket(scheme + location.host + '/live');\n  socket.onmessage = () => run();\n  socket.onclose = () => setTimeout(() => onTasksChanged(run), 2000);\n}\n",
      sse: "export function onTasksChanged(run: () => void) {\n  const events = new EventSource('/api/live');\n  events.onmessage = () => run();\n}\n",
      library: a.language === 'csharp'
        ? "import * as signalR from '@microsoft/signalr';\n\nexport function onTasksChanged(run: () => void) {\n  const connection = new signalR.HubConnectionBuilder().withUrl('/live').withAutomaticReconnect().build();\n  connection.on('tasksChanged', run);\n  connection.start();\n}\n"
        : "import { io } from 'socket.io-client';\n\nexport function onTasksChanged(run: () => void) {\n  io().on('tasksChanged', run);\n}\n",
      managed: "import * as Ably from 'ably';\n\nexport function onTasksChanged(run: () => void) {\n  const client = new Ably.Realtime({ authUrl: '/api/live-token' });\n  client.channels.get('tasks').subscribe(() => run());\n}\n"
    }[a.transport];
    var lines = {
      websocket: [['new WebSocket', 'Opens a connection that stays open in both directions.'], ['onmessage', 'Runs when the server pushes a message. This app reloads the list rather than reading the message.'], ['onclose', 'WebSockets don\'t reconnect by themselves, so this tries again after 2 seconds.']],
      sse: [['EventSource', 'The browser\'s built-in client for Server-Sent Events. It reconnects by itself if the connection drops.']],
      library: [['withAutomaticReconnect', 'SignalR\'s built-in reconnect.'], ['tasksChanged', 'The name of the message the server sends.'], ['io()', 'Socket.IO connects to the same site and handles reconnecting.']],
      managed: [['authUrl', 'The browser asks your server for a short-lived token, so your secret Ably key never reaches it.'], ['channels.get', 'A named stream of messages. Your server publishes to the same name.']]
    }[a.transport];
    return { file: 'web/src/live.ts', lang: 'typescript', code: body, lines: lines };
  }
  function liveNpm(a) {
    if (a.transport === 'library') return a.language === 'csharp' ? ' @microsoft/signalr' : ' socket.io-client';
    if (a.transport === 'managed') return ' ably';
    return '';
  }

  // Plain forms work from any frontend, because the server answers with a redirect.
  function spaButtons(a, pad) {
    var out = '';
    if (wantsLogin(a)) out += pad + '<form method="post" action="/logout"><button>Log out</button></form>\n';
    if (a.payment) out += pad + '<form method="post" action="/api/checkout"><button>Buy example product</button></form>\n';
    return out;
  }
  // Turns the TypeScript frontend into JavaScript, so both versions always match.
  function frontendToJs(items) {
    var swaps = [
      [/export type Task = \{[^}]*\};\n\n/, ''],
      [/: Promise<[^>\n]*(?:\[\])?>/g, ''], [/, type Task/g, ''], [/, type FormEvent/g, ''], [/useState<Task\[\]>/g, 'useState'], [/ref<Task\[\]>/g, 'ref'],
      [/\(query: string, variables: object = \{\}\)/g, '(query, variables = {})'], [/\(path: string, method = 'GET', body\?: object\)/g, "(path, method = 'GET', body)"],
      [/\(title: string\)/g, '(title)'], [/\(id: string, done: boolean\)/g, '(id, done)'], [/\(run: \(\) => void\)/g, '(run)'], [/\(event: FormEvent\)/g, '(event)'], [/\(task: Task, event: Event\)/g, '(task, event)'],
      [/\(event\.target as HTMLInputElement\)\.checked/g, 'event.target.checked'], [/<script setup lang="ts">/g, '<script setup>']
    ];
    items.forEach(function (it) {
      if (it.file && /^web\//.test(it.file)) {
        swaps.forEach(function (s) { it.code = it.code.replace(s[0], s[1]); });
        it.file = it.file.replace(/\.tsx$/, '.jsx').replace(/\.ts$/, '.js');
        if (it.lang === 'typescript') it.lang = 'javascript';
        if (it.lang === 'tsx') it.lang = 'jsx';
        if (it.lines) it.lines = it.lines.filter(function (l) { return l[0] !== 'type Task'; });
      }
    });
    return items;
  }
  function spaItems(a, backendPort) {
    var js = a.frontendLanguage === 'javascript' && a.frontend !== 'angular';
    var built = spaItemsTs(a, backendPort);
    return js ? frontendToJs(built) : built;
  }
  function spaItemsTs(a, backendPort) {
    var js = a.frontendLanguage === 'javascript';
    var items = [];
    var live = liveClient(a);
    var liveImport = live ? "import { onTasksChanged } from './live';\n" : '';
    var proxy = "{\n      '/api': 'http://localhost:" + backendPort + "',\n      '/graphql': 'http://localhost:" + backendPort + "',\n      '/login': 'http://localhost:" + backendPort + "',\n      '/signup': 'http://localhost:" + backendPort + "',\n      '/logout': 'http://localhost:" + backendPort + "',\n      '/admin': 'http://localhost:" + backendPort + "'" + (a.transport === 'websocket' || a.transport === 'library' ? ",\n      '/live': { target: 'ws://localhost:" + backendPort + "', ws: true }" : '') + (a.transport === 'library' && a.language !== 'csharp' ? ",\n      '/socket.io': { target: 'ws://localhost:" + backendPort + "', ws: true }" : '') + "\n    }";
    if (a.frontend === 'react' || a.frontend === 'vue') {
      var template = (a.frontend === 'react' ? 'react' : 'vue') + (js ? '' : '-ts');
      items.push({ p: 'Vite creates the frontend and runs it during development. Run this from your project folder:' });
      items.push({ cmd: 'npm create vite@latest web -- --template ' + template + ' --no-interactive', lines: [['npm create vite@latest', 'Downloads and runs the Vite project creator.'], ['web', 'The folder to create.'], ['--', 'Passes what follows to Vite rather than to npm.'], ['--template ' + template, 'Starts from ' + (a.frontend === 'react' ? 'React' : 'Vue') + (js ? ' with JavaScript.' : ' with TypeScript.')], ['--no-interactive', 'Skips the questions, so it doesn\'t ask to start a server.']] });
      items.push({ cmd: 'cd web && npm install' + liveNpm(a) + ' && cd ..', lines: [['npm install', 'Downloads the libraries listed in <code>package.json</code>.']] });
      items.push({ file: 'web/vite.config.ts', lang: 'typescript', code: "import { defineConfig } from 'vite';\nimport " + (a.frontend === 'react' ? "react from '@vitejs/plugin-react'" : "vue from '@vitejs/plugin-vue'") + ";\n\nexport default defineConfig({\n  plugins: [" + (a.frontend === 'react' ? 'react()' : 'vue()') + "],\n  server: {\n    proxy: " + proxy + ",\n  },\n});\n", lines: [
        ['plugins', 'Teaches Vite how to compile ' + (a.frontend === 'react' ? 'React\'s JSX' : 'Vue\'s <code>.vue</code> files') + '.'],
        ['server.proxy', 'While developing, Vite runs on its own port. This forwards API calls to your backend, so the browser sees one site and you avoid cross-origin problems.']
      ] });
    }
    if (a.frontend === 'angular') {
      items.push({ p: 'The Angular CLI creates the frontend and runs it during development. Run this from your project folder:' });
      items.push({ cmd: 'npx --yes @angular/cli@latest new web --defaults --skip-git --ssr=false --ai-config=none' + (liveNpm(a) ? ' && cd web && npm install' + liveNpm(a) + ' && cd ..' : ''), lines: [['npx --yes @angular/cli@latest', 'Downloads and runs the latest Angular CLI, without installing it globally.'], ['new web', 'Creates a project in the <code>web</code> folder.'], ['--defaults', 'Accepts the default answers.'], ['--skip-git', 'Doesn\'t create a Git repository inside your project.'], ['--ssr=false', 'Turns off server rendering, because your backend is separate.'], ['--ai-config=none', 'Skips the question about AI tool configuration files.']] });
      items.push({ file: 'web/proxy.conf.json', lang: 'json', code: JSON.stringify(proxyAngular(a, backendPort), null, 2) + '\n', lines: [['/api', 'While developing, the Angular server forwards these paths to your backend, so the browser sees one site.'], ['target', 'Where your backend runs.']] });
      items.push({ p: 'Tell the development server to use it:' });
      items.push({ cmd: 'cd web && npx ng config projects.web.architect.serve.options.proxyConfig proxy.conf.json && cd ..', lines: [['ng config', 'Changes a setting in <code>angular.json</code>.']] });
    }
    items.push(clientApi(a));
    if (live) items.push(live);
    if (a.frontend === 'react') {
      items.push({ file: 'web/src/App.tsx', lang: 'tsx', code: "import { useEffect, useState, type FormEvent } from 'react';\nimport { addTask, listTasks, setDone, type Task } from './api';\n" + liveImport + "\nexport default function App() {\n  const [tasks, setTasks] = useState<Task[]>([]);\n  const [title, setTitle] = useState('');\n\n  const load = () => listTasks().then(setTasks);\n\n  useEffect(() => {\n    load();" + (live ? "\n    onTasksChanged(load);" : '') + "\n  }, []);\n\n  async function submit(event: FormEvent) {\n    event.preventDefault();\n    await addTask(title);\n    setTitle('');\n    await load();\n  }\n\n  return (\n    <main>\n      <h1>Tasks</h1>\n" + spaButtons(a, '      ') + "      <form onSubmit={submit}>\n        <input value={title} onChange={(e) => setTitle(e.target.value)} required />\n        <button>Add</button>\n      </form>\n      <ul>\n        {tasks.map((task) => (\n          <li key={task.id}>\n            <label>\n              <input\n                type=\"checkbox\"\n                checked={task.done}\n                onChange={(e) => setDone(task.id, e.target.checked).then(load)}\n              />\n              {task.title}\n            </label>\n          </li>\n        ))}\n      </ul>\n    </main>\n  );\n}\n", lines: [
        ['useState', 'Holds a value in the component. Changing it redraws the component.'],
        ['useEffect', 'Runs code after the first draw. The empty <code>[]</code> means only once. This loads the tasks.'],
        ['event.preventDefault()', 'Stops the browser from reloading the page when the form submits.'],
        ['value and onChange', 'Keeps the text box and <code>title</code> in step, which React calls a controlled input.'],
        ['tasks.map', 'Turns each task into a list item.'],
        ['key', 'A stable ID that lets React update the right row.']
      ] });
      items.push({ cmd: 'rm -f web/src/App.css', optional: true, lines: [['rm -f', 'Removes the sample styles, which your new page doesn\'t use.']] });
    }
    if (a.frontend === 'vue') {
      items.push({ file: 'web/src/App.vue', lang: 'vue', code: "<script setup lang=\"ts\">\nimport { onMounted, ref } from 'vue';\nimport { addTask, listTasks, setDone, type Task } from './api';\n" + liveImport + "\nconst tasks = ref<Task[]>([]);\nconst title = ref('');\n\nasync function load() {\n  tasks.value = await listTasks();\n}\n\nasync function submit() {\n  await addTask(title.value);\n  title.value = '';\n  await load();\n}\n\nasync function toggle(task: Task, event: Event) {\n  await setDone(task.id, (event.target as HTMLInputElement).checked);\n  await load();\n}\n\nonMounted(() => {\n  load();" + (live ? "\n  onTasksChanged(load);" : '') + "\n});\n</script>\n\n<template>\n  <main>\n    <h1>Tasks</h1>\n" + spaButtons(a, '    ') + "    <form @submit.prevent=\"submit\">\n      <input v-model=\"title\" required />\n      <button>Add</button>\n    </form>\n    <ul>\n      <li v-for=\"task in tasks\" :key=\"task.id\">\n        <label>\n          <input type=\"checkbox\" :checked=\"task.done\" @change=\"toggle(task, $event)\" />\n          {{ task.title }}\n        </label>\n      </li>\n    </ul>\n  </main>\n</template>\n", lines: [
        ['script setup', 'Everything declared here is available to the template below.'],
        ['ref', 'A value Vue watches. Read and write it through <code>.value</code> in code. Templates unwrap it for you.'],
        ['onMounted', 'Runs after the component first appears. This loads the tasks.'],
        ['@submit.prevent', 'Calls <code>submit</code> and stops the browser from reloading the page.'],
        ['v-model', 'Keeps the text box and <code>title</code> in step.'],
        ['v-for and :key', 'Repeats the row per task. The key helps Vue update the right row.'],
        ['{{ task.title }}', 'Shows the value, and escapes it so it can\'t inject HTML.']
      ] });
    }
    if (a.frontend === 'angular') {
      items.push({ file: 'web/src/app/app.ts', lang: 'typescript', code: "import { Component, OnInit, signal } from '@angular/core';\nimport { addTask, listTasks, setDone, type Task } from '../api';\n" + liveImport.replace("'./live'", "'../live'") + "\n@Component({\n  selector: 'app-root',\n  template: `\n    <main>\n      <h1>Tasks</h1>\n" + spaButtons(a, '      ') + "      <form (submit)=\"submit($event, input.value); input.value = ''\">\n        <input #input required />\n        <button>Add</button>\n      </form>\n      <ul>\n        @for (task of tasks(); track task.id) {\n          <li>\n            <label>\n              <input type=\"checkbox\" [checked]=\"task.done\" (change)=\"toggle(task, $event)\" />\n              {{ task.title }}\n            </label>\n          </li>\n        }\n      </ul>\n    </main>\n  `,\n})\nexport class App implements OnInit {\n  tasks = signal<Task[]>([]);\n\n  ngOnInit() {\n    this.load();" + (live ? "\n    onTasksChanged(() => this.load());" : '') + "\n  }\n\n  async load() {\n    this.tasks.set(await listTasks());\n  }\n\n  async submit(event: Event, title: string) {\n    event.preventDefault();\n    await addTask(title);\n    await this.load();\n  }\n\n  async toggle(task: Task, event: Event) {\n    await setDone(task.id, (event.target as HTMLInputElement).checked);\n    await this.load();\n  }\n}\n", lines: [
        ['@Component', 'Marks the class as a piece of the page and holds its HTML template.'],
        ['(submit)', 'Calls a method when the form submits.'],
        ['#input', 'Gives the template a name for this element.'],
        ['@for ... track', 'Repeats the row per task. <code>track</code> tells Angular which row is which.'],
        ['signal', 'A value Angular watches. Setting it updates the page.'],
        ['ngOnInit', 'Runs when the component starts. This loads the tasks.']
      ] });
      items.push({ p: 'New Angular projects also generate <code>app.html</code> and a test for the sample page. This component has its own template, so delete them:' });
      items.push({ cmd: 'rm -f web/src/app/app.html web/src/app/app.css web/src/app/app.spec.ts', lines: [['rm -f', 'Removes the files if they exist, and does nothing if they don\'t.']] });
    }
    items.push({ p: 'Check that it compiles. ' + spaFetchNote(a) });
    items.push({ cmd: 'cd web && npm run build && cd ..', lines: [['npm run build', (js ? 'Writes' : 'Type-checks the code and writes') + ' the finished files that your backend can serve.']] });
    return items;
  }
  function proxyAngular(a, port) {
    var t = 'http://localhost:' + port;
    var out = { '/api': { target: t }, '/graphql': { target: t }, '/login': { target: t }, '/signup': { target: t }, '/logout': { target: t }, '/admin': { target: t } };
    if (a.transport === 'websocket' || a.transport === 'library') out['/live'] = { target: t, ws: true };
    if (a.transport === 'library' && a.language !== 'csharp') out['/socket.io'] = { target: t, ws: true };
    return out;
  }
  function spaDistPath(a) { return a.frontend === 'angular' ? 'web/dist/web/browser' : 'web/dist'; }

  // ---------- Hosted login providers ----------
  function oidcSetup(a, callback, port) {
    var items = [];
    var cb = 'http://localhost:' + port + callback;
    if (a.login === 'keycloak') {
      items.push({ p: 'Keycloak is a login server you run yourself. It needs Java, as listed in its <a href="https://www.keycloak.org/getting-started/getting-started-zip">getting started guide</a>. Download the ZIP from there, extract it and start it on another port:' });
      items.push({ cmd: 'bin/kc.sh start-dev --http-port=8180', manual: true, lines: [['start-dev', 'Development mode. Use the production mode described in its docs for a real site.'], ['--http-port=8180', 'Moves it off port 8080.']] });
      items.push({ p: 'Open <code>http://localhost:8180</code> and create the first admin. Under <strong>Manage realms</strong>, create a realm called <code>demo</code>. Under <strong>Users</strong>, create a user and set a password with <strong>Temporary</strong> off. Give the user an email address, because the app identifies admins by the emails in <code>ADMIN_EMAILS</code>.' });
      items.push({ p: 'Under <strong>Clients</strong>, create an OpenID Connect client called <code>demo-app</code>. Turn on <strong>Client authentication</strong>, keep <strong>Standard flow</strong>, and set <strong>Valid redirect URIs</strong> to <code>' + cb + '</code>. The secret is on the client\'s <strong>Credentials</strong> tab.' });
      items.push({ cmd: 'export OIDC_ISSUER=http://localhost:8180/realms/demo\nexport OIDC_CLIENT_ID=demo-app\nexport OIDC_CLIENT_SECRET=your-client-secret', manual: true, lines: [['OIDC_ISSUER', 'The address that identifies your realm. The app finds everything else from it, at <code>/.well-known/openid-configuration</code>.']] });
    }
    if (a.login === 'auth0') {
      items.push({ p: 'In the <a href="https://auth0.com/docs/get-started/auth0-overview/create-applications/regular-web-apps">Auth0 dashboard</a>, go to <strong>Applications</strong>, click <strong>Create Application</strong> and choose <strong>Regular Web Applications</strong>. On the application\'s settings, add <code>' + cb + '</code> to <strong>Allowed Callback URLs</strong>. Copy the domain, client ID and client secret.' });
      items.push({ cmd: 'export OIDC_ISSUER=https://your-tenant.eu.auth0.com/\nexport OIDC_CLIENT_ID=your-client-id\nexport OIDC_CLIENT_SECRET=your-client-secret', manual: true, lines: [['OIDC_ISSUER', 'Your tenant\'s address. Keep the trailing slash, because Auth0\'s issuer includes it.']] });
    }
    if (a.login === 'entra') {
      items.push({ p: 'In the <a href="https://entra.microsoft.com">Microsoft Entra admin center</a>, <a href="https://learn.microsoft.com/en-us/entra/external-id/customers/quickstart-tenant-setup">set up an external tenant</a>. Then <a href="https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app">register an application</a> in it, add a <strong>Web</strong> redirect URI of <code>' + cb + '</code>, create a client secret, and grant admin consent under <strong>API permissions</strong>. Create a sign-up and sign-in user flow and add your application to it.' });
      items.push({ cmd: 'export OIDC_ISSUER=https://your-tenant.ciamlogin.com/your-tenant-id/v2.0\nexport OIDC_CLIENT_ID=your-application-id\nexport OIDC_CLIENT_SECRET=your-client-secret', manual: true, lines: [['ciamlogin.com', 'The sign-in address for external tenants. Replace both placeholders with your tenant\'s name and ID.']] });
    }
    items.push({ p: 'When you deploy, add your real address to the provider too, such as <code>https://example.com' + callback + '</code>. Login fails with a redirect error if it isn\'t listed.' });
    items.push({ warn: 'Never commit the client secret. Keep it in environment variables, and use your host\'s secret settings in production.' });
    items.push({ p: 'This part needs a real login provider, so the login itself wasn\'t run. The app\'s check that blocks logged-out users was.' });
    return items;
  }

  // ---------- Payments: each provider's hosted checkout, called over HTTP ----------
  var PAYMENT = {
    stripe: {
      name: 'Stripe', docs: 'https://docs.stripe.com/payments/checkout/how-checkout-works',
      env: [['STRIPE_SECRET_KEY', 'Your secret test key from the Stripe dashboard. It starts with <code>sk_test_</code>.']],
      steps: 'Create a <a href="https://dashboard.stripe.com/register">Stripe account</a> and copy your test secret key from <strong>Developers</strong>, <strong>API keys</strong>.',
      test: 'Pay with card number <code>4242 4242 4242 4242</code>, any future date and any security code.'
    },
    paypal: {
      name: 'PayPal', docs: 'https://developer.paypal.com/docs/api/orders/v2/',
      env: [['PAYPAL_CLIENT_ID', 'From an app in the PayPal developer dashboard.'], ['PAYPAL_SECRET', 'The secret for the same app.']],
      steps: 'Create a <a href="https://developer.paypal.com/dashboard/">PayPal developer account</a> and a sandbox app.',
      test: 'Pay with a sandbox buyer account from the developer dashboard.'
    },
    adyen: {
      name: 'Adyen', docs: 'https://docs.adyen.com/unified-commerce/pay-by-link/',
      env: [['ADYEN_API_KEY', 'From your Adyen test Customer Area, under <strong>Developers</strong>, <strong>API credentials</strong>.'], ['ADYEN_MERCHANT', 'Your merchant account name.']],
      steps: 'Create an <a href="https://www.adyen.com/signup">Adyen test account</a> and an API credential with permission to create payment links.',
      test: 'Pay with one of Adyen\'s <a href="https://docs.adyen.com/development-resources/test-cards-and-credentials/">test cards</a>.'
    },
    klarna: {
      name: 'Klarna', docs: 'https://docs.klarna.com/acquirer/klarna/web-payments/integrate-with-klarna-payments/integrate-via-hpp/before-you-start/accept-klarna-payments-using-hosted-payment-page/',
      env: [['KLARNA_USER', 'The API username from your Klarna playground account.'], ['KLARNA_PASSWORD', 'The API password for the same account.']],
      steps: 'Create a <a href="https://docs.klarna.com/">Klarna playground account</a> and API credentials. Klarna\'s Hosted Payment Page needs a payment session, which this code creates first.',
      test: 'Use Klarna\'s sample customer data, from its <a href="https://docs.klarna.com/">docs</a>, in the playground.'
    }
  };
  function paymentIntro(a) {
    var p = PAYMENT[a.payment];
    return [
      { p: p.steps + ' Your server asks ' + p.name + ' for a payment page, then sends the customer there. Card details never touch your server, so most card-security rules don\'t apply to you.' },
      { cmd: p.env.map(function (e) { return 'export ' + e[0] + '=your-value'; }).join('\n'), manual: true, lines: p.env }
    ];
  }
  function paymentOutro(a) {
    var p = PAYMENT[a.payment];
    return [
      { p: 'Test it: ' + p.test },
      { warn: 'The return page doesn\'t prove the customer paid, because anyone can open that URL. Before you ship anything, confirm each payment on your server, using ' + p.name + '\'s <a href="' + p.docs + '">webhooks or status API</a>.' },
      { p: 'The test simulates ' + p.name + '\'s response, and the request format comes from its docs. I didn\'t call ' + p.name + ' itself, because that needs an account.' }
    ];
  }

  // ---------- Admin tools that don't depend on the framework ----------
  function reactAdminItems(a, port) {
    return [
      { p: 'React-admin is a separate small app that talks to your REST API. Run this from your project folder:' },
      { cmd: 'npm create vite@latest admin -- --template react-ts --no-interactive\ncd admin\nnpm install react-admin ra-data-simple-rest\ncd ..', lines: [['admin', 'A separate folder, so the admin app has its own dependencies.'], ['ra-data-simple-rest', 'Connects React-admin to a REST API that follows simple conventions.']] },
      { file: 'admin/vite.config.ts', lang: 'typescript', code: "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n  server: { port: 5174, proxy: { '/api': 'http://localhost:" + port + "' } },\n});\n", lines: [['port: 5174', 'Keeps it away from your main frontend\'s port.'], ['proxy', 'Forwards API calls to your backend while developing.']] },
      { file: 'admin/src/App.tsx', lang: 'tsx', code: "import { Admin, Resource, ListGuesser, EditGuesser } from 'react-admin';\nimport simpleRestProvider from 'ra-data-simple-rest';\n\nconst dataProvider = simpleRestProvider('/api');\n\nexport default function App() {\n  return (\n    <Admin dataProvider={dataProvider}>\n      <Resource name=\"tasks\" list={ListGuesser} edit={EditGuesser} />\n    </Admin>\n  );\n}\n", lines: [
        ['simpleRestProvider', 'Turns React-admin\'s actions into calls such as <code>GET /api/tasks</code>.'],
        ['Resource name="tasks"', 'One kind of record to manage. It maps to <code>/api/tasks</code>.'],
        ['ListGuesser and EditGuesser', 'Build the screens by looking at your data. Replace them with your own components when you want more control.']
      ] },
      { cmd: 'cd admin && npm run build && cd ..', lines: [['npm run build', 'Checks that the admin app compiles.']] },
      { p: 'React-admin expects a <code>Content-Range</code> header on the list, which your API already sends. This simple API returns every row, so add real paging using the <code>range</code> parameter before you have thousands of rows.' },
      { warn: 'Your API protects these endpoints with the same login as the rest of the app. Log in on the main site first, or host the admin app on the same domain so it shares the cookie.' }
    ];
  }
  function lowCodeItems(a) {
    return [
      { p: 'Retool and Appsmith let you build admin screens by dragging components onto a page. They connect straight to your database or API.' },
      { p: 'Sign up for <a href="https://retool.com/">Retool</a>, or use <a href="https://www.appsmith.com/">Appsmith</a> as a hosted account or on your own server. Add your database as a resource using a separate account that only has access to the tables staff need. Create a table on a new page, and connect it to a query such as <code>select * from tasks</code>.' + (a.database === 'mongodb' ? ' For MongoDB, connect with its MongoDB resource type and read the <code>tasks</code> collection.' : '') },
      { warn: 'A hosted tool has to reach your database over the internet. Allow only its published IP addresses, require encrypted connections, and never use your app\'s main database password.' },
      { p: 'I didn\'t run this, because it needs an account with one of these services.' }
    ];
  }

  // ---------- Hosting ----------
  function migrationStep(a) {
    if (a.database === 'mongodb') return [];
    var tool = {
      'prisma-migrate': ['npx prisma migrate deploy', 'Applies existing migration files, and never creates new ones.'],
      'drizzle-kit': ['npx drizzle-kit migrate', 'Runs any SQL files that haven\'t run yet.'],
      'node-pg-migrate': ['npx node-pg-migrate up', 'Runs any migrations that haven\'t run yet.'],
      alembic: ['alembic upgrade head', 'Runs any migrations that haven\'t run yet.'],
      'ef-migrations': ['dotnet ef database update --project Demo', 'Runs any migrations that haven\'t run yet.'],
      'flyway-any': ['flyway -url="$JDBC_URL" -user="$DB_USER" -password="$DB_PASSWORD" -locations=filesystem:sql migrate', 'Runs any SQL files that haven\'t run yet. Use your production database\'s address.']
    }[a.migrations];
    if (a.language === 'go') {
      var goTool = { goose: 'go tool goose -dir migrations ' + { postgresql: 'postgres', mysql: 'mysql', sqlserver: 'mssql', sqlite: 'sqlite3' }[a.database] + ' "$DATABASE_URL" up', 'golang-migrate': 'go run -tags ' + { postgresql: 'postgres', mysql: 'mysql', sqlserver: 'sqlserver', sqlite: 'sqlite' }[a.database] + ' github.com/golang-migrate/migrate/v4/cmd/migrate@latest -path migrations -database "' + (a.database === 'mysql' ? 'mysql://$DATABASE_URL' : a.database === 'sqlite' ? 'sqlite://$DATABASE_URL' : '$DATABASE_URL') + '" up', atlas: 'atlas migrate apply --dir file://migrations --url "$ATLAS_URL"' }[a.migrations];
      if (goTool) tool = [goTool, 'Runs any migrations that haven\'t run yet.'];
    }
    if (a.migrations === 'dbup' || a.migrations === 'fluentmigrator') return [{ p: 'Your migrations run by themselves when the app starts. With several copies of the app, they can start at the same moment, so roll out one copy first.' }];
    var items = [];
    if (tool) {
      items.push({ p: 'Before each new version starts, update the production database. Run this from your own machine or your deployment pipeline, with <code>DATABASE_URL</code> set to the production database:' });
      items.push({ cmd: tool[0], manual: true, lines: [[tool[0].split(' -')[0], tool[1]]] });
    }
    if (a.login && ['express', 'fastify', 'nestjs', 'nextjs'].indexOf(a.framework) >= 0) items.push({ cmd: 'npx --yes auth@latest migrate --yes --config ' + (a.framework === 'nextjs' ? 'lib' : 'src') + '/auth.ts', manual: true, lines: [['auth@latest migrate', 'Creates or updates the login tables in the same database.']] });
    return items;
  }
  function hostingItems(a, info) {
    var items = [{ file: 'Dockerfile', lang: 'dockerfile', code: info.dockerfile, lines: info.dockerLines }];
    items.push({ file: '.dockerignore', lang: 'text', code: info.dockerignore, lines: [['.dockerignore', 'Files Docker shouldn\'t copy into the image, which keeps it small and keeps secrets out.']] });
    var env = info.env.map(function (e) { return '<code>' + e + '</code>'; }).join(', ');
    if (a.hosting === 'paas') {
      items.push({ p: 'Push your code to GitHub, then create a web service on a platform such as <a href="https://render.com/docs/web-services">Render</a> and point it at your repository. Choose its Docker option, so it builds this <code>Dockerfile</code>. Set the port to ' + info.port + '.' });
      items.push({ p: 'Add a managed database from the same provider if you need one. In the service settings, set these environment variables: ' + env + '.' });
    }
    if (a.hosting === 'containers') {
      items.push({ p: 'Build the image and run it on a service such as <a href="https://docs.cloud.google.com/run/docs/deploying-source-code">Google Cloud Run</a>. These commands assume you\'ve installed and logged in with <code>gcloud</code>:' });
      items.push({ cmd: 'gcloud run deploy demo --source . --port ' + info.port + ' --set-env-vars ' + info.env.map(function (e) { return e + '=your-value'; }).join(','), manual: true, lines: [['--source .', 'Builds from your <code>Dockerfile</code> and stores the image.'], ['--port', 'The port your app listens on.'], ['--set-env-vars', 'Settings for your app. Use Secret Manager for real secrets.']] });
    }
    if (a.hosting === 'vps') {
      items.push({ p: 'Rent a Linux server, install <a href="https://docs.docker.com/engine/install/">Docker</a> and copy your project to it. Create a file called <code>.env</code> on the server with one <code>NAME=value</code> line for each of these settings: ' + env + '. Then build and run the app:' });
      items.push({ cmd: 'docker build -t demo .\ndocker run -d --restart unless-stopped --env-file .env -p 127.0.0.1:' + info.port + ':' + info.port + ' demo', manual: true, lines: [['docker build -t demo .', 'Builds an image called <code>demo</code>.'], ['-d', 'Runs it in the background.'], ['--restart unless-stopped', 'Starts it again after crashes and reboots.'], ['--env-file .env', 'Reads settings from a file on the server. Keep it out of Git.'], ['-p 127.0.0.1:', 'Exposes the port only to the server itself, so visitors must come through the web server below.']] });
      items.push({ p: 'Install <a href="https://caddyserver.com/docs/install">Caddy</a> as the public web server. It gets HTTPS certificates automatically:' });
      items.push({ file: '/etc/caddy/Caddyfile', lang: 'text', code: 'example.com {\n  reverse_proxy 127.0.0.1:' + info.port + '\n}\n', lines: [['example.com', 'Your domain, which must already point at this server.'], ['reverse_proxy', 'Passes each request to your app.']], manual: true });
      items.push({ p: 'You\'re now responsible for operating system updates, backups and a firewall that only allows ports 22, 80 and 443.' });
    }
    if (a.hosting === 'kubernetes') {
      items.push({ p: 'Push your image to a registry, then describe the app to a managed cluster such as <a href="https://cloud.google.com/kubernetes-engine/docs">GKE</a>, <a href="https://learn.microsoft.com/en-us/azure/aks/">AKS</a> or <a href="https://docs.aws.amazon.com/eks/">EKS</a>.' });
      items.push({ file: 'k8s.yaml', lang: 'yaml', code: 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: demo\nspec:\n  replicas: 2\n  selector:\n    matchLabels:\n      app: demo\n  template:\n    metadata:\n      labels:\n        app: demo\n    spec:\n      containers:\n        - name: demo\n          image: registry.example.com/demo:1.0.0\n          ports:\n            - containerPort: ' + info.port + '\n          envFrom:\n            - secretRef:\n                name: demo-settings\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: demo\nspec:\n  selector:\n    app: demo\n  ports:\n    - port: 80\n      targetPort: ' + info.port + '\n', lines: [['Deployment', 'Keeps the requested number of copies of your app running.'], ['replicas: 2', 'Two copies, so one can fail or restart safely.' + (a.database === 'sqlite' ? ' SQLite only works with one copy, so use 1 or change database.' : '')], ['secretRef', 'Reads settings from a Kubernetes secret called <code>demo-settings</code>, which you create separately with these keys: ' + info.env.join(', ') + '.'], ['Service', 'A stable address inside the cluster for those copies. Add an Ingress to expose it publicly.']], noRun: true });
      items.push({ cmd: 'kubectl apply -f k8s.yaml', manual: true, lines: [['kubectl apply', 'Tells the cluster to match this description.']] });
    }
    migrationStep(a).forEach(function (i) { items.push(i); });
    if (a.database === 'sqlite') items.push({ warn: 'SQLite keeps data in a file. Most container hosts lose files when a container restarts, so attach a persistent disk or move to a server database.' });
    items.push({ p: 'I checked the app builds and runs outside Docker. I didn\'t run this deployment, because it needs Docker and a hosting account.' });
    return items;
  }

  function plan(a) {
    var build = frameworks[a.framework];
    return build ? build(a) : null;
  }
  return {
    frameworks: frameworks, plan: plan, isSpa: isSpa, hasNeed: hasNeed, wantsLogin: wantsLogin, usesOidc: usesOidc,
    ddlTasks: ddlTasks, ddlUsers: ddlUsers, DDL_LINES: DDL_LINES, USER_DDL_LINES: USER_DDL_LINES, dbSetup: dbSetup, flywayItems: flywayItems,
    spaItems: spaItems, spaDistPath: spaDistPath, liveClient: liveClient, oidcSetup: oidcSetup, PAYMENT: PAYMENT, paymentIntro: paymentIntro, paymentOutro: paymentOutro,
    reactAdminItems: function (a, port) {
      var made = reactAdminItems(a, port);
      if (a.frontendLanguage === 'javascript') made.unshift({ p: 'The admin app is a separate project, and this guide keeps it in TypeScript, even though your main frontend uses JavaScript.' });
      return made;
    }, lowCodeItems: lowCodeItems, hostingItems: hostingItems
  };
})();
