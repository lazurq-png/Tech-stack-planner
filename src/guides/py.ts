// @ts-nocheck -- moved from the single-file page; types are added module by module.
import { StackKit } from '../stack-kit';

// Guide for FastAPI.
(function (Kit) {
  var DB_URL = {
    sqlalchemy: { postgresql: 'postgresql+psycopg://postgres:your-password@localhost:5432/demo', mysql: 'mysql+pymysql://root:your-password@localhost:3306/demo', sqlserver: 'mssql+pymssql://sa:your-password@localhost:1433/demo', sqlite: 'sqlite:///./demo.db' },
    psycopg: { postgresql: 'postgresql://postgres:your-password@localhost:5432/demo' }
  };
  var DRIVER = { postgresql: '"psycopg[binary]"', mysql: 'pymysql', sqlserver: 'pymssql', sqlite: '' };

  function dataItems(a, withUsers) {
    var items = [];
    if (a.database === 'mongodb') {
      items.push({ cmd: 'pip install pymongo', lines: [['pymongo', 'MongoDB\'s official Python driver.']] });
      items.push({ cmd: 'export DATABASE_URL=mongodb://localhost:27017/demo', manual: true, lines: [['DATABASE_URL', 'Where the database is. Reading it from the environment keeps secrets out of your code.']] });
      items.push({ file: 'app/tasks.py', lang: 'python', code: "import os\n\nfrom bson import ObjectId\nfrom pydantic import BaseModel\nfrom pymongo import MongoClient\n\nclient = MongoClient(os.environ.get(\"DATABASE_URL\", \"mongodb://localhost:27017/demo\"))\ndb = client.get_default_database()\n\n\nclass Task(BaseModel):\n    id: str\n    title: str\n    done: bool\n\n\ndef to_task(doc) -> Task:\n    return Task(id=str(doc[\"_id\"]), title=doc[\"title\"], done=doc[\"done\"])\n\n\ndef list_tasks() -> list[Task]:\n    return [to_task(doc) for doc in db.tasks.find().sort(\"_id\", 1)]\n\n\ndef add_task(title: str) -> Task:\n    result = db.tasks.insert_one({\"title\": title, \"done\": False})\n    return Task(id=str(result.inserted_id), title=title, done=False)\n\n\ndef set_done(task_id: str, done: bool) -> None:\n    db.tasks.update_one({\"_id\": ObjectId(task_id)}, {\"$set\": {\"done\": done}})\n\n\ndef delete_task(task_id: str) -> None:\n    db.tasks.delete_one({\"_id\": ObjectId(task_id)})\n" + (withUsers ? "\n\ndef get_user(email: str):\n    return db.users.find_one({\"email\": email})\n\n\ndef add_user(email: str, password_hash: str) -> None:\n    db.users.insert_one({\"email\": email, \"password_hash\": password_hash})\n" : ''), lines: [
        ['MongoClient', 'Connects to the server named in the URL.'],
        ['get_default_database', 'Uses the database named in the URL.'],
        ['class Task(BaseModel)', 'Pydantic checks this shape and turns it into JSON. IDs are strings, so every database behaves the same.'],
        ['db.tasks', 'A collection, which is MongoDB\'s equivalent of a table. It\'s created on first use.'],
        ['ObjectId', 'MongoDB\'s ID type. URLs carry it as a string, so it\'s converted here.'],
        ['$set', 'Changes only the listed field.']
      ] });
      return items;
    }
    if (a.data === 'psycopg') {
      items.push({ cmd: 'pip install "psycopg[binary]" "psycopg[pool]"', lines: [['psycopg[binary]', 'The PostgreSQL driver, with its compiled parts included.'], ['psycopg[pool]', 'Adds a connection pool, which reuses connections instead of opening one per request.']] });
      items.push({ cmd: 'export DATABASE_URL="' + DB_URL.psycopg.postgresql + '"', manual: true, lines: [['DATABASE_URL', 'Where the database is, including its password.']] });
      items.push({ file: 'app/tasks.py', lang: 'python', code: "import os\n\nfrom psycopg.rows import dict_row\nfrom psycopg_pool import ConnectionPool\nfrom pydantic import BaseModel\n\npool = ConnectionPool(os.environ[\"DATABASE_URL\"], kwargs={\"row_factory\": dict_row}, open=True)\n\n\nclass Task(BaseModel):\n    id: str\n    title: str\n    done: bool\n\n\ndef to_task(row) -> Task:\n    return Task(id=str(row[\"id\"]), title=row[\"title\"], done=row[\"done\"])\n\n\ndef list_tasks() -> list[Task]:\n    with pool.connection() as conn:\n        return [to_task(row) for row in conn.execute(\"select id, title, done from tasks order by id\")]\n\n\ndef add_task(title: str) -> Task:\n    with pool.connection() as conn:\n        row = conn.execute(\"insert into tasks (title) values (%s) returning id, title, done\", (title,)).fetchone()\n        return to_task(row)\n\n\ndef set_done(task_id: str, done: bool) -> None:\n    with pool.connection() as conn:\n        conn.execute(\"update tasks set done = %s where id = %s\", (done, int(task_id)))\n\n\ndef delete_task(task_id: str) -> None:\n    with pool.connection() as conn:\n        conn.execute(\"delete from tasks where id = %s\", (int(task_id),))\n" + (withUsers ? "\n\ndef get_user(email: str):\n    with pool.connection() as conn:\n        return conn.execute(\"select email, password_hash from users where email = %s\", (email,)).fetchone()\n\n\ndef add_user(email: str, password_hash: str) -> None:\n    with pool.connection() as conn:\n        conn.execute(\"insert into users (email, password_hash) values (%s, %s)\", (email, password_hash))\n" : ''), lines: [
        ['ConnectionPool', 'Keeps a set of open connections to reuse.'],
        ['dict_row', 'Returns rows as dictionaries, so you can write <code>row["title"]</code>.'],
        ['with pool.connection()', 'Borrows a connection, commits when the block ends, and rolls back if it fails.'],
        ['%s', 'A placeholder. The driver sends the value separately, which prevents SQL injection. Never build SQL by joining strings.'],
        ['class Task(BaseModel)', 'Pydantic checks this shape and turns it into JSON.']
      ] });
      return items;
    }
    var driver = DRIVER[a.database];
    items.push({ cmd: 'pip install sqlalchemy' + (driver ? ' ' + driver : ''), lines: [['sqlalchemy', 'Python\'s main database toolkit.']].concat(driver ? [[driver.replace(/"/g, ''), 'The driver SQLAlchemy uses to reach your database.']] : []) });
    items.push({ cmd: 'export DATABASE_URL="' + DB_URL.sqlalchemy[a.database] + '"', manual: true, lines: [['DATABASE_URL', 'Where the database is, including its password. The first part names the driver.']] });
    items.push({ file: 'app/tasks.py', lang: 'python', code: "import os\n\nfrom pydantic import BaseModel\nfrom sqlalchemy import String, create_engine, select\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column\n\nengine = create_engine(os.environ.get(\"DATABASE_URL\", \"sqlite:///./demo.db\"))\n\n\nclass Base(DeclarativeBase):\n    pass\n\n\nclass TaskRow(Base):\n    __tablename__ = \"tasks\"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    title: Mapped[str] = mapped_column(String(200))\n    done: Mapped[bool] = mapped_column(default=False)\n\n" + (withUsers ? "\nclass UserRow(Base):\n    __tablename__ = \"users\"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    email: Mapped[str] = mapped_column(String(200), unique=True)\n    password_hash: Mapped[str] = mapped_column(String(300))\n    role: Mapped[str] = mapped_column(String(20), default=\"user\")\n\n" : '') + "\nclass Task(BaseModel):\n    id: str\n    title: str\n    done: bool\n\n\ndef to_task(row: TaskRow) -> Task:\n    return Task(id=str(row.id), title=row.title, done=row.done)\n\n\ndef list_tasks() -> list[Task]:\n    with Session(engine) as session:\n        return [to_task(row) for row in session.scalars(select(TaskRow).order_by(TaskRow.id))]\n\n\ndef add_task(title: str) -> Task:\n    with Session(engine) as session:\n        row = TaskRow(title=title, done=False)\n        session.add(row)\n        session.commit()\n        return to_task(row)\n\n\ndef set_done(task_id: str, done: bool) -> None:\n    with Session(engine) as session:\n        row = session.get(TaskRow, int(task_id))\n        if row:\n            row.done = done\n            session.commit()\n\n\ndef delete_task(task_id: str) -> None:\n    with Session(engine) as session:\n        row = session.get(TaskRow, int(task_id))\n        if row:\n            session.delete(row)\n            session.commit()\n" + (withUsers ? "\n\ndef get_user(email: str):\n    with Session(engine) as session:\n        row = session.scalar(select(UserRow).where(UserRow.email == email))\n        return {\"email\": row.email, \"password_hash\": row.password_hash} if row else None\n\n\ndef add_user(email: str, password_hash: str) -> None:\n    with Session(engine) as session:\n        session.add(UserRow(email=email, password_hash=password_hash))\n        session.commit()\n" : ''), lines: [
      ['create_engine', 'Sets up connections to the database. It connects when first needed.'],
      ['DeclarativeBase', 'The parent of your table classes. It keeps a list of them, which Alembic reads.'],
      ['Mapped and mapped_column', 'SQLAlchemy 2\'s typed way to declare columns.'],
      ['class Task(BaseModel)', 'The shape the rest of the app uses. It\'s separate from the table class, and Pydantic turns it into JSON.'],
      ['with Session(engine)', 'A unit of work with the database, closed when the block ends.'],
      ['select(TaskRow)', 'Builds the SQL query. <code>scalars</code> returns the objects themselves.'],
      ['session.commit()', 'Saves the changes.']
    ] });
    return items;
  }

  function migrationItems(a, withUsers) {
    if (a.database === 'mongodb') return [{ p: 'MongoDB has no fixed table structure, so there are no migrations to run.' }];
    if (a.migrations === 'alembic') return [
      { cmd: 'pip install alembic\nalembic init alembic', lines: [['alembic', 'The migration tool made for SQLAlchemy.'], ['alembic init', 'Creates its settings file and an <code>alembic</code> folder.']] },
      { file: 'alembic/env.py', lang: 'python', code: "import os\nimport sys\n\nfrom alembic import context\nfrom sqlalchemy import create_engine\n\nsys.path.insert(0, os.getcwd())\nfrom app.tasks import Base  # noqa: E402\n\nurl = os.environ.get(\"DATABASE_URL\", \"sqlite:///./demo.db\")\n\nwith create_engine(url).connect() as connection:\n    context.configure(connection=connection, target_metadata=Base.metadata)\n    with context.begin_transaction():\n        context.run_migrations()\n", lines: [
        ['env.py', 'Alembic runs this for each command. This replaces the generated file with a shorter one that reads your environment variable.'],
        ['target_metadata', 'Your table classes, so Alembic can compare them to the database.'],
        ['sys.path.insert', 'Lets this file import your <code>app</code> package.']
      ] },
      { cmd: 'alembic revision --autogenerate -m "create tables"\nalembic upgrade head', lines: [['--autogenerate', 'Compares your classes to the database and writes a migration into <code>alembic/versions</code>. Always read it, because it can miss some changes.'], ['upgrade head', 'Runs every migration that hasn\'t run yet. Run the same command in production.']] }
    ];
    return Kit.flywayItems(a, { users: withUsers });
  }

  var LOGIN_HTML = "<!doctype html>\n<html lang=\"en\">\n<meta charset=\"utf-8\">\n<title>Log in</title>\n<h1>Log in or sign up</h1>\n{% if error %}<p role=\"alert\">{{ error }}</p>{% endif %}\n<form method=\"post\">\n  <label>Email <input name=\"email\" type=\"email\" required></label>\n  <label>Password <input name=\"password\" type=\"password\" minlength=\"8\" required></label>\n  <button formaction=\"/login\">Log in</button>\n  <button formaction=\"/signup\">Sign up</button>\n</form>\n</html>\n";

  function paymentSection(a, sections) {
    // Payments
    if (a.payment) {
      var payBody = {
        stripe: "def create_checkout(base_url: str) -> str:\n    res = httpx.post(\n        \"https://api.stripe.com/v1/checkout/sessions\",\n        headers={\"Authorization\": \"Bearer \" + os.environ[\"STRIPE_SECRET_KEY\"]},\n        data={\n            \"mode\": \"payment\",\n            \"success_url\": base_url + \"/?paid=1\",\n            \"cancel_url\": base_url + \"/\",\n            \"line_items[0][quantity]\": \"1\",\n            \"line_items[0][price_data][currency]\": \"eur\",\n            \"line_items[0][price_data][unit_amount]\": \"1000\",\n            \"line_items[0][price_data][product_data][name]\": \"Example product\",\n        },\n    )\n    res.raise_for_status()\n    return res.json()[\"url\"]\n",
        paypal: "API = \"https://api-m.sandbox.paypal.com\"\n\n\ndef create_checkout(base_url: str) -> str:\n    token = httpx.post(\n        API + \"/v1/oauth2/token\",\n        auth=(os.environ[\"PAYPAL_CLIENT_ID\"], os.environ[\"PAYPAL_SECRET\"]),\n        data={\"grant_type\": \"client_credentials\"},\n    )\n    token.raise_for_status()\n    res = httpx.post(\n        API + \"/v2/checkout/orders\",\n        headers={\"Authorization\": \"Bearer \" + token.json()[\"access_token\"]},\n        json={\n            \"intent\": \"CAPTURE\",\n            \"purchase_units\": [{\"amount\": {\"currency_code\": \"EUR\", \"value\": \"10.00\"}}],\n            \"payment_source\": {\"paypal\": {\"experience_context\": {\"return_url\": base_url + \"/?paid=1\", \"cancel_url\": base_url + \"/\"}}},\n        },\n    )\n    res.raise_for_status()\n    return next(link[\"href\"] for link in res.json()[\"links\"] if link[\"rel\"] == \"payer-action\")\n",
        adyen: "def create_checkout(base_url: str) -> str:\n    res = httpx.post(\n        \"https://checkout-test.adyen.com/v72/paymentLinks\",\n        headers={\"X-API-Key\": os.environ[\"ADYEN_API_KEY\"]},\n        json={\n            \"merchantAccount\": os.environ[\"ADYEN_MERCHANT\"],\n            \"reference\": \"order-\" + str(int(time.time())),\n            \"amount\": {\"currency\": \"EUR\", \"value\": 1000},\n            \"returnUrl\": base_url + \"/?paid=1\",\n        },\n    )\n    res.raise_for_status()\n    return res.json()[\"url\"]\n",
        klarna: "API = \"https://api.playground.klarna.com\"\n\n\ndef create_checkout(base_url: str) -> str:\n    login = (os.environ[\"KLARNA_USER\"], os.environ[\"KLARNA_PASSWORD\"])\n    session = httpx.post(\n        API + \"/payments/v1/sessions\",\n        auth=login,\n        json={\n            \"purchase_country\": \"SE\",\n            \"purchase_currency\": \"SEK\",\n            \"locale\": \"sv-SE\",\n            \"order_amount\": 10000,\n            \"order_lines\": [{\"name\": \"Example product\", \"quantity\": 1, \"unit_price\": 10000, \"total_amount\": 10000}],\n        },\n    )\n    session.raise_for_status()\n    res = httpx.post(\n        API + \"/hpp/v1/sessions\",\n        auth=login,\n        json={\n            \"payment_session_url\": API + \"/payments/v1/sessions/\" + session.json()[\"session_id\"],\n            \"merchant_urls\": {\"success\": base_url + \"/?paid=1\", \"cancel\": base_url + \"/\", \"back\": base_url + \"/\", \"failure\": base_url + \"/\", \"error\": base_url + \"/\"},\n        },\n    )\n    res.raise_for_status()\n    return res.json()[\"redirect_url\"]\n"
      }[a.payment];
      var payLines = {
        stripe: [['/v1/checkout/sessions', 'Creates a Stripe-hosted payment page.'], ['Bearer', 'Logs in with your secret key. It only ever belongs on the server.'], ['data=', 'Stripe\'s API takes form-encoded data, not JSON.'], ['unit_amount', 'The price in the smallest unit, so 1000 is 10.00 euros.'], ['raise_for_status', 'Turns an error response into an exception.']],
        paypal: [['api-m.sandbox', 'PayPal\'s test system. Use <code>api-m.paypal.com</code> in production.'], ['/v1/oauth2/token', 'Exchanges your app\'s credentials for a short-lived token.'], ['intent: CAPTURE', 'Takes payment immediately once the buyer approves.'], ['payer-action', 'The link where the buyer approves. After they return, capture the order on your server to actually take the money.']],
        adyen: [['checkout-test.adyen.com', 'Adyen\'s test system. Production uses a URL specific to your account.'], ['/paymentLinks', 'Creates an Adyen-hosted payment page.'], ['X-API-Key', 'Logs in with your API key.'], ['value: 1000', 'The price in the smallest unit, so 10.00 euros.']],
        klarna: [['api.playground.klarna.com', 'Klarna\'s test system. Production uses <code>api.klarna.com</code> or a regional address.'], ['/payments/v1/sessions', 'Describes the order. Amounts are in the smallest unit, so 10000 is 100.00 SEK.'], ['/hpp/v1/sessions', 'Creates the Klarna-hosted payment page for that order.'], ['redirect_url', 'The payment page to send the customer to.']]
      }[a.payment];
      var fake = { stripe: "{\"url\": \"https://pay.example/1\"}", adyen: "{\"url\": \"https://pay.example/1\"}", paypal: "{\"access_token\": \"t\", \"links\": [{\"rel\": \"payer-action\", \"href\": \"https://pay.example/1\"}]}", klarna: "{\"session_id\": \"s\", \"redirect_url\": \"https://pay.example/1\"}" }[a.payment];
      var envSet = Kit.PAYMENT[a.payment].env.map(function (e) { return "    monkeypatch.setenv(\"" + e[0] + "\", \"test\")\n"; }).join('');
      sections.push({ id: 'pay', title: 'Add payments with ' + Kit.PAYMENT[a.payment].name, items: Kit.paymentIntro(a).concat([
        { file: 'app/checkout.py', lang: 'python', code: "import os\n" + (a.payment === 'adyen' ? 'import time\n' : '') + "\nimport httpx\n\n\n" + payBody, lines: payLines },
        { file: 'tests/test_checkout.py', lang: 'python', code: "import httpx\n\nfrom app.checkout import create_checkout\n\n\ndef test_asks_the_provider_for_a_payment_page(monkeypatch):\n" + envSet + "    fake = httpx.Response(200, json=" + fake + ", request=httpx.Request(\"POST\", \"https://example.test\"))\n    monkeypatch.setattr(httpx, \"post\", lambda *args, **kwargs: fake)\n    assert create_checkout(\"http://localhost:8000\") == \"https://pay.example/1\"\n", lines: [['monkeypatch', 'A pytest tool that replaces something during one test. Here it simulates the provider, so the test needs no account and spends no money.']] }
      ]).concat(Kit.paymentOutro(a)) });
    }

  }

  function viewsSection(a, sections) {
    var templates = a.frontend === 'server-templates', login = !!a.login;
    if (templates || a.admin === 'in-app') {
      var views = [];
      if (templates) {
        var liveScript = a.transport === 'sse' ? "<script>new EventSource('/api/live').onmessage = () => htmx.trigger('#list', 'reload');</script>\n" : a.transport === 'websocket' ? "<script>\n  const scheme = location.protocol === 'https:' ? 'wss://' : 'ws://';\n  new WebSocket(scheme + location.host + '/live').onmessage = () => htmx.trigger('#list', 'reload');\n</script>\n" : a.transport === 'managed' ? "<script src=\"https://cdn.ably.com/lib/ably.min-2.js\"></script>\n<script>\n  new Ably.Realtime({ authUrl: '/api/live-token' }).channels.get('tasks').subscribe(() => htmx.trigger('#list', 'reload'));\n</script>\n" : '';
        views.push({ file: 'templates/index.html', lang: 'html', code: "<!doctype html>\n<html lang=\"en\">\n<meta charset=\"utf-8\">\n<title>Tasks</title>\n<script src=\"https://unpkg.com/htmx.org@2.0.11\"></script>\n<h1>Tasks</h1>\n" + (login ? "<form method=\"post\" action=\"/logout\"><button>Log out</button></form>\n" : '') + (a.payment ? "<form method=\"post\" action=\"/api/checkout\"><button>Buy example product</button></form>\n" : '') + "<form hx-post=\"/tasks\" hx-target=\"#list\" hx-on::after-request=\"this.reset()\">\n  <input name=\"title\" maxlength=\"200\" required>\n  <button>Add</button>\n</form>\n<div id=\"list\" hx-get=\"/tasks\" hx-trigger=\"reload\">{% include \"list.html\" %}</div>\n" + liveScript + "</html>\n", lines: [['htmx', 'A small library that lets HTML attributes make requests and update part of the page.'], ['hx-post', 'Submits the form to this URL without reloading the page.'], ['hx-target', 'Replaces this element with the response.'], ['hx-on::after-request', 'Clears the form after it submits.'], ['{% include %}', 'Inserts another template.']] });
        views.push({ file: 'templates/list.html', lang: 'html', code: "<ul>\n  {% for task in tasks %}\n    <li>\n      <label>\n        <input type=\"checkbox\" name=\"done\" {{ 'checked' if task.done }} hx-post=\"/tasks/{{ task.id }}/toggle\" hx-target=\"#list\">\n        {{ task.title }}\n      </label>\n    </li>\n  {% endfor %}\n</ul>\n", lines: [['{% for %}', 'Repeats the row per task.'], ['{{ task.title }}', 'Prints the value and escapes it, so a title can\'t inject HTML or scripts.']] });
      }
      if (a.admin === 'in-app') views.push({ file: 'templates/admin.html', lang: 'html', code: "<!doctype html>\n<html lang=\"en\">\n<meta charset=\"utf-8\">\n<title>Admin</title>\n<h1>Admin: all tasks</h1>\n<table>\n  {% for task in tasks %}\n    <tr>\n      <td>{{ task.title }}</td>\n      <td>{{ 'Done' if task.done else 'Open' }}</td>\n      <td><form method=\"post\" action=\"/admin/tasks/{{ task.id }}/delete\"><button>Delete</button></form></td>\n    </tr>\n  {% endfor %}\n</table>\n</html>\n", lines: [['form method="post"', 'Deleting uses POST, so a link or a search engine can\'t trigger it.'], ['/admin', 'A small page rendered by the server, whichever frontend you chose.']] });
      sections.push({ id: 'views', title: templates ? 'Write the pages' : 'Write the admin page', items: views });
    }
  }

  function fastapi(a) {
    var sections = [];
    var spa = Kit.isSpa(a), templates = a.frontend === 'server-templates', login = !!a.login, oidc = Kit.usesOidc(a), own = login && !oidc;
    var isRest = a.api === 'rest', isGql = a.api === 'graphql';
    var usesJinja = templates || a.admin === 'in-app' || own;
    sections.push({ id: 'tools', title: 'Install your tools', items: [
      { p: 'You need <a href="https://www.python.org/downloads/">Python</a> 3.10 or newer. Commands assume a Unix-style terminal. On Windows, use Git Bash or WSL.' },
      { cmd: 'python --version', lines: [['python', 'Runs Python. On some systems the command is <code>python3</code>.']] }
    ] });
    sections.push({ id: 'project', title: 'Create the project', items: [
      { cmd: 'mkdir demo\ncd demo\npython -m venv .venv\n. .venv/Scripts/activate 2>/dev/null || . .venv/bin/activate', lines: [
        ['python -m venv .venv', 'Creates a virtual environment: a private folder of libraries for this project only.'],
        ['activate', 'Makes this terminal use that environment. Windows and other systems keep the script in different folders, so this tries both. Run it again in each new terminal.']
      ] },
      { cmd: 'pip install "fastapi[standard]" pytest' + (isGql ? ' "strawberry-graphql[fastapi]"' : '') + (oidc ? ' authlib itsdangerous' : '') + (own ? ' "pwdlib[argon2]" itsdangerous' : ''), lines: [
        ['fastapi[standard]', 'FastAPI plus its usual extras: the web server, form parsing, the Jinja2 template language and <code>httpx</code>, which tests use.'],
        ['pytest', 'Python\'s most common test runner.']
      ].concat(isGql ? [['strawberry-graphql', 'A GraphQL library that builds the schema from Python classes.']] : []).concat(oidc ? [['authlib', 'Handles the OpenID Connect login flow.']] : []).concat(own ? [['pwdlib[argon2]', 'Hashes passwords with Argon2, as FastAPI\'s docs recommend.']] : []).concat(login ? [['itsdangerous', 'Signs the session cookie, so visitors can\'t alter it.']] : []) },
      { file: '.gitignore', lang: 'text', code: '.venv\n__pycache__\n.env\n*.db\nnode_modules\ndist\n', lines: [['.gitignore', 'Tells Git what to leave out. Libraries can be installed again, and secrets and database files should never be committed.']] },
      { file: 'app/__init__.py', lang: 'python', code: '', lines: [['__init__.py', 'An empty file that marks <code>app</code> as a package, so its files can import each other.']] }
    ] });
    sections.push({ id: 'db', title: 'Set up the database', items: Kit.dbSetup(a).concat(dataItems(a, own)).concat(migrationItems(a, own)) });

    if (oidc) sections.push({ id: 'login', title: 'Set up your login provider', items: Kit.oidcSetup(a, '/auth/callback', 8000) });
    if (login) {
      var authCode = "import os\n\nfrom fastapi import HTTPException, Request\n\n\nadmin_emails = {e.strip().lower() for e in os.environ.get(\"ADMIN_EMAILS\", \"\").split(\",\")}\n\n\ndef current_user(request: Request):\n    return request.session.get(\"email\")\n\n\ndef require_user(request: Request) -> str:\n    email = current_user(request)\n    if not email:\n        raise HTTPException(status_code=401, detail=\"Log in first\")\n    return email\n\n\ndef is_admin(email: str | None) -> bool:\n    return bool(email) and email.lower() in admin_emails\n";
      sections.push({ id: 'auth', title: 'Add login', items: [
        { cmd: 'export SESSION_SECRET="$(openssl rand -hex 32)"\nexport ADMIN_EMAILS=you@example.com', lines: [['SESSION_SECRET', 'Signs the session cookie. Anyone with it could forge a login. Save the value and reuse it, because changing it logs everyone out.'], ['ADMIN_EMAILS', 'A comma-separated list of admin accounts.']] },
        { file: 'app/auth.py', lang: 'python', code: authCode, lines: [
          ['request.session', 'Data stored in a signed cookie by <code>SessionMiddleware</code>, which you\'ll add below.'],
          ['HTTPException', 'Stops the request and returns that status.'],
          ['require_user', 'A dependency: routes list it, and FastAPI runs it first.'],
          ['is_admin', 'Treats the emails in <code>ADMIN_EMAILS</code> as admins, so you don\'t need a roles system to start.']
        ] }
      ].concat(own ? [
        { file: 'templates/login.html', lang: 'html', code: LOGIN_HTML, lines: [['formaction', 'Each button posts the same form to a different URL.'], ['{{ error }}', 'Jinja2 inserts the value and escapes it, so it can\'t inject HTML.']] },
        { warn: 'This signs people up without confirming their email. Before you use <code>ADMIN_EMAILS</code> on a public site, add email verification, so nobody can register an admin\'s address first.' }
      ] : []) });
    }

    // Live updates
    if (a.transport) {
      var liveCode, liveLines, liveItems = [];
      if (a.transport === 'websocket') {
        liveCode = "import asyncio\n\nfrom anyio import from_thread\nfrom fastapi import APIRouter, WebSocket, WebSocketDisconnect\n\nrouter = APIRouter()\nsockets: set[WebSocket] = set()\n\n\n@router.websocket(\"/live\")\nasync def live(websocket: WebSocket):\n    await websocket.accept()\n    sockets.add(websocket)\n    try:\n        while True:\n            await websocket.receive_text()\n    except WebSocketDisconnect:\n        sockets.discard(websocket)\n\n\nasync def broadcast():\n    for socket in list(sockets):\n        await socket.send_text(\"changed\")\n\n\ndef tasks_changed():\n    try:\n        from_thread.run(broadcast)\n    except RuntimeError:\n        asyncio.get_running_loop().create_task(broadcast())\n";
        liveLines = [['@router.websocket', 'Accepts WebSocket connections at this path.'], ['sockets', 'Every open connection, so a change can reach them all.'], ['receive_text', 'Waits for the browser, and raises an error when it disconnects.'], ['from_thread.run', 'Normal <code>def</code> routes run in a worker thread, and this calls async code from there.'], ['RuntimeError', 'Happens when already on the main loop, as in GraphQL resolvers. It then schedules the work directly.']];
      }
      if (a.transport === 'sse') {
        liveCode = "import asyncio\nfrom collections.abc import AsyncIterable\n\nfrom anyio import from_thread\nfrom fastapi import APIRouter\nfrom fastapi.sse import EventSourceResponse\n\nrouter = APIRouter()\nqueues: set[asyncio.Queue] = set()\n\n\n@router.get(\"/api/live\", response_class=EventSourceResponse)\nasync def live() -> AsyncIterable[str]:\n    queue: asyncio.Queue = asyncio.Queue()\n    queues.add(queue)\n    try:\n        while True:\n            yield await queue.get()\n    finally:\n        queues.discard(queue)\n\n\nasync def broadcast():\n    for queue in list(queues):\n        queue.put_nowait(\"changed\")\n\n\ndef tasks_changed():\n    try:\n        from_thread.run(broadcast)\n    except RuntimeError:\n        asyncio.get_running_loop().create_task(broadcast())\n";
        liveLines = [['EventSourceResponse', 'FastAPI\'s built-in Server-Sent Events response. Each <code>yield</code> sends one event.'], ['asyncio.Queue', 'One waiting list per browser. <code>await queue.get()</code> sleeps until there\'s news.'], ['finally', 'Runs when the browser disconnects, so the queue is removed.'], ['from_thread.run', 'Normal <code>def</code> routes run in a worker thread, and this calls async code from there.']];
      }
      if (a.transport === 'managed') {
        liveItems.push({ p: 'Create a free <a href="https://ably.com/docs/getting-started">Ably</a> account and copy an API key.' }, { cmd: 'pip install ably', lines: [['ably', 'Ably\'s official Python library.']] }, { cmd: 'export ABLY_API_KEY=your-key', manual: true, lines: [['ABLY_API_KEY', 'Your secret key. It stays on the server.']] });
        liveCode = "import os\n\nimport httpx\nfrom ably import AblyRest\nfrom fastapi import APIRouter\n\nrouter = APIRouter()\nkey = os.environ.get(\"ABLY_API_KEY\", \"\")\n\n\n@router.get(\"/api/live-token\")\nasync def live_token():\n    token = await AblyRest(key).auth.create_token_request({\"capability\": {\"tasks\": [\"subscribe\"]}})\n    return token.to_dict()\n\n\ndef tasks_changed():\n    if not key:\n        return\n    name, secret = key.split(\":\", 1)\n    httpx.post(\"https://rest.ably.io/channels/tasks/messages\", auth=(name, secret), json={\"name\": \"changed\"}, timeout=5)\n";
        liveLines = [['create_token_request', 'Gives the browser a short-lived permission that can only subscribe, so your key stays secret.'], ['httpx.post', 'Publishes through Ably\'s REST API, which is simple to call from normal routes.']];
      }
      liveItems.push({ file: 'app/live.py', lang: 'python', code: liveCode, lines: liveLines });
      sections.push({ id: 'live', title: 'Add live updates', items: liveItems });
    }

    paymentSection(a, sections);

    // The app
    var imports = ["import os", "", "from fastapi import " + ['Depends', 'FastAPI', 'Form', 'HTTPException', 'Request', 'Response'].filter(function (n) {
      if (n === 'Depends') return login;
      if (n === 'Form') return templates || own;
      if (n === 'HTTPException') return isRest || a.admin === 'in-app' || a.admin === 'react-admin';
      if (n === 'Response') return isRest;
      return true;
    }).join(', ')];
    var respImports = [];
    if (usesJinja) respImports.push('HTMLResponse');
    if (login || a.payment) respImports.push('RedirectResponse');
    if (respImports.length) imports.push('from fastapi.responses import ' + respImports.join(', '));
    if (spa) imports.push('from fastapi.staticfiles import StaticFiles');
    if (usesJinja) imports.push('from fastapi.templating import Jinja2Templates');
    if (isRest) imports.push('from pydantic import BaseModel');
    if (login) imports.push('from starlette.middleware.sessions import SessionMiddleware');
    if (isGql) { imports.push('import strawberry'); imports.push('from strawberry.fastapi import GraphQLRouter'); }
    if (oidc) imports.push('from authlib.integrations.starlette_client import OAuth');
    if (own) imports.push('from pwdlib import PasswordHash');
    imports.push('');
    if (login) imports.push('from app.auth import current_user, is_admin, require_user');
    if (a.payment) imports.push('from app.checkout import create_checkout');
    if (a.transport) imports.push('from app.live import router as live_router, tasks_changed');
    imports.push('from app.tasks import ' + ['Task', 'add_task', 'delete_task', 'list_tasks', 'set_done'].concat(own ? ['add_user', 'get_user'] : []).sort(function (x, y) { return x.toLowerCase() < y.toLowerCase() ? -1 : 1; }).join(', '));
    var notify = a.transport ? '\n    tasks_changed()' : '';
    var guardDep = login ? ', dependencies=[Depends(require_user)]' : '';
    var code = imports.join('\n') + "\n\napp = FastAPI()\n";
    if (usesJinja) code += 'templates = Jinja2Templates(directory="templates")\n';
    if (login) code += 'app.add_middleware(SessionMiddleware, secret_key=os.environ["SESSION_SECRET"], same_site="lax", https_only=os.environ.get("HTTPS_ONLY") == "1")\n';
    if (a.transport) code += 'app.include_router(live_router)\n';
    if (own) code += "password_hash = PasswordHash.recommended()\n\n\n@app.get(\"/login\", response_class=HTMLResponse)\ndef login_page(request: Request):\n    return templates.TemplateResponse(request=request, name=\"login.html\", context={})\n\n\n@app.post(\"/login\")\ndef log_in(request: Request, email: str = Form(), password: str = Form()):\n    user = get_user(email.lower())\n    if not user or not password_hash.verify(password, user[\"password_hash\"]):\n        return templates.TemplateResponse(request=request, name=\"login.html\", context={\"error\": \"Wrong email or password.\"}, status_code=401)\n    request.session[\"email\"] = email.lower()\n    return RedirectResponse(\"/\", status_code=303)\n\n\n@app.post(\"/signup\")\ndef sign_up(request: Request, email: str = Form(), password: str = Form(min_length=8)):\n    if get_user(email.lower()):\n        return templates.TemplateResponse(request=request, name=\"login.html\", context={\"error\": \"That email is already registered.\"}, status_code=409)\n    add_user(email.lower(), password_hash.hash(password))\n    request.session[\"email\"] = email.lower()\n    return RedirectResponse(\"/\", status_code=303)\n";
    if (oidc) code += "oauth = OAuth()\noauth.register(\n    \"provider\",\n    client_id=os.environ.get(\"OIDC_CLIENT_ID\"),\n    client_secret=os.environ.get(\"OIDC_CLIENT_SECRET\"),\n    server_metadata_url=os.environ.get(\"OIDC_ISSUER\", \"\").rstrip(\"/\") + \"/.well-known/openid-configuration\",\n    client_kwargs={\"scope\": \"openid email profile\"},\n)\n\n\n@app.get(\"/login\")\nasync def log_in(request: Request):\n    return await oauth.provider.authorize_redirect(request, str(request.url_for(\"auth_callback\")))\n\n\n@app.get(\"/auth/callback\")\nasync def auth_callback(request: Request):\n    token = await oauth.provider.authorize_access_token(request)\n    request.session[\"email\"] = token[\"userinfo\"][\"email\"].lower()\n    return RedirectResponse(\"/\")\n";
    if (login) code += "\n\n@app.post(\"/logout\")\ndef log_out(request: Request):\n    request.session.clear()\n    return RedirectResponse(\"/login\", status_code=303)\n";
    if (isRest) {
      code += "\n\nclass NewTask(BaseModel):\n    title: str\n\n\nclass DoneChange(BaseModel):\n    done: bool\n\n\n@app.get(\"/api/tasks\"" + guardDep + ")\ndef get_tasks(response: Response) -> list[Task]:\n    tasks = list_tasks()\n    response.headers[\"Content-Range\"] = f\"tasks 0-{len(tasks)}/{len(tasks)}\"\n    response.headers[\"Access-Control-Expose-Headers\"] = \"Content-Range\"\n    return tasks\n\n\n@app.get(\"/api/tasks/{task_id}\"" + guardDep + ")\ndef get_task(task_id: str) -> Task:\n    task = next((t for t in list_tasks() if t.id == task_id), None)\n    if task is None:\n        raise HTTPException(status_code=404)\n    return task\n\n\n@app.post(\"/api/tasks\", status_code=201" + guardDep + ")\ndef create_task(body: NewTask) -> Task:\n    title = body.title.strip()\n    if not title or len(title) > 200:\n        raise HTTPException(status_code=400, detail=\"A title of 1 to 200 characters is required\")\n    task = add_task(title)" + notify + "\n    return task\n\n\n@app.put(\"/api/tasks/{task_id}\"" + guardDep + ")\ndef change_task(task_id: str, body: DoneChange) -> Task | None:\n    set_done(task_id, body.done)" + notify + "\n    return next((t for t in list_tasks() if t.id == task_id), None)\n";
    }
    if (isGql) {
      code += "\n\n@strawberry.type\nclass TaskType:\n    id: strawberry.ID\n    title: str\n    done: bool\n\n\ndef to_type(task: Task) -> TaskType:\n    return TaskType(id=strawberry.ID(task.id), title=task.title, done=task.done)\n\n\n@strawberry.type\nclass Query:\n    @strawberry.field\n    def tasks(self) -> list[TaskType]:\n        return [to_type(t) for t in list_tasks()]\n\n\n@strawberry.type\nclass Mutation:\n    @strawberry.mutation\n    def add_task(self, title: str) -> TaskType:\n        task = add_task(title)" + notify.replace('\n    ', '\n        ') + "\n        return to_type(task)\n\n    @strawberry.mutation\n    def set_done(self, id: strawberry.ID, done: bool) -> bool:\n        set_done(str(id), done)" + notify.replace('\n    ', '\n        ') + "\n        return True\n\n\napp.include_router(GraphQLRouter(strawberry.Schema(Query, Mutation)), prefix=\"/graphql\"" + guardDep + ")\n";
    }
    if (templates) {
      code += "\n\ndef list_part(request: Request):\n    return templates.TemplateResponse(request=request, name=\"list.html\", context={\"tasks\": list_tasks()})\n\n\n@app.get(\"/\", response_class=HTMLResponse)\ndef home(request: Request):\n" + (login ? "    if not current_user(request):\n        return RedirectResponse(\"/login\")\n" : '') + "    return templates.TemplateResponse(request=request, name=\"index.html\", context={\"tasks\": list_tasks()})\n\n\n@app.get(\"/tasks\", response_class=HTMLResponse" + guardDep + ")\ndef tasks_part(request: Request):\n    return list_part(request)\n\n\n@app.post(\"/tasks\", response_class=HTMLResponse" + guardDep + ")\ndef add_from_form(request: Request, title: str = Form(max_length=200)):\n    add_task(title.strip())" + notify + "\n    return list_part(request)\n\n\n@app.post(\"/tasks/{task_id}/toggle\", response_class=HTMLResponse" + guardDep + ")\ndef toggle(request: Request, task_id: str, done: str | None = Form(default=None)):\n    set_done(task_id, done == \"on\")" + notify + "\n    return list_part(request)\n";
    }
    if (a.admin === 'in-app') {
      code += "\n\n@app.get(\"/admin\", response_class=HTMLResponse)\ndef admin_page(request: Request):\n    email = current_user(request)\n    if not email:\n        return RedirectResponse(\"/login\")\n    if not is_admin(email):\n        raise HTTPException(status_code=403)\n    return templates.TemplateResponse(request=request, name=\"admin.html\", context={\"tasks\": list_tasks()})\n\n\n@app.post(\"/admin/tasks/{task_id}/delete\")\ndef admin_delete(request: Request, task_id: str):\n    if not is_admin(current_user(request)):\n        raise HTTPException(status_code=403)\n    delete_task(task_id)" + notify + "\n    return RedirectResponse(\"/admin\", status_code=303)\n";
    }
    if (a.admin === 'react-admin') {
      code += "\n\n@app.delete(\"/api/tasks/{task_id}\")\ndef remove_task(request: Request, task_id: str):\n    if not is_admin(current_user(request)):\n        raise HTTPException(status_code=403)\n    delete_task(task_id)" + notify + "\n    return {\"id\": task_id}\n";
    }
    if (a.payment) {
      code += "\n\n@app.post(\"/api/checkout\"" + guardDep + ")\ndef checkout(request: Request):\n    base_url = os.environ.get(\"PUBLIC_URL\", str(request.base_url).rstrip(\"/\"))\n    return RedirectResponse(create_checkout(base_url), status_code=303)\n";
    }
    if (spa) code += "\n\napp.mount(\"/\", StaticFiles(directory=\"" + Kit.spaDistPath(a) + "\", html=True, check_dir=False))\n";
    var mainLines = [['FastAPI()', 'Creates the app. Its type hints also generate API docs at <code>/docs</code>.']];
    if (login) mainLines.push(['SessionMiddleware', 'Stores the session in a signed cookie. Reading the secret with <code>os.environ[...]</code> makes the app refuse to start without one, rather than run with an empty secret. Set <code>HTTPS_ONLY=1</code> in production, so the cookie is only sent over HTTPS.'], ['/logout', 'Clears the session. It\'s a POST so other sites can\'t log someone out with a link.']);
    if (own) mainLines.push(['Form()', 'Reads this value from a posted HTML form.'], ['password_hash.verify', 'Checks a password against its stored hash.'], ['status_code=303', 'Makes the browser follow the redirect with a GET, so refreshing doesn\'t resend the form.']);
    if (oidc) mainLines.push(['server_metadata_url', 'A standard address where the provider publishes its login and token URLs.'], ['authorize_redirect', 'Sends the visitor to your provider\'s login page.'], ['authorize_access_token', 'Handles the return from the provider, checks the response and gets the user\'s details.']);
    if (isRest) mainLines.push(['dependencies=[Depends(require_user)]', 'Runs the login check before this route.'].slice(0, login ? 2 : 0));
    if (isRest) mainLines = mainLines.filter(function (l) { return l.length; }).concat([['class NewTask(BaseModel)', 'Describes the JSON body. FastAPI checks it and returns a 422 error if it doesn\'t fit.'], ['-> list[Task]', 'The return type. FastAPI uses it to filter and document the response.'], ['Content-Range', 'Tells clients how many rows exist. React-admin needs this.'], ['def, not async def', 'FastAPI runs normal functions in a worker thread, so slow database calls don\'t block other requests.']]);
    if (isGql) mainLines.push(['@strawberry.type', 'Turns a class into a GraphQL type, using its type hints.'], ['@strawberry.mutation', 'Marks a field that changes data.'], ['GraphQLRouter', 'Serves GraphQL at <code>/graphql</code>.']);
    if (templates) mainLines.push(['TemplateResponse', 'Fills in a template and sends the HTML.'], ['list_part', 'Returns only the list, because htmx swaps just that part of the page.'], ['done: str | None', 'A checked checkbox sends <code>on</code>, and an unchecked one sends nothing.']);
    if (a.admin === 'in-app') mainLines.push(['is_admin', 'The check runs on the server. Hiding a link isn\'t protection, because anyone can type a URL.'], ['403', 'Means logged in, but not allowed.']);
    if (a.payment) mainLines.push(['PUBLIC_URL', 'Your site\'s real address. Set this in production, because the <code>Host</code> header can be forged.']);
    if (spa) mainLines.push(['app.mount("/", StaticFiles', 'Serves your built frontend. It comes last, so API routes match first.']);
    sections.push({ id: 'app', title: 'Write the app', items: [{ file: 'app/main.py', lang: 'python', code: code, lines: mainLines }] });

    viewsSection(a, sections);
    if (spa) sections.push({ id: 'frontend', title: 'Build the frontend', items: Kit.spaItems(a, 8000) });
    if (a.admin === 'react-admin') sections.push({ id: 'admin', title: 'Add the admin app', items: Kit.reactAdminItems(a, 8000) });
    if (a.admin === 'low-code') sections.push({ id: 'admin', title: 'Add the admin tool', items: Kit.lowCodeItems(a) });

    // Tests
    var test = "from fastapi.testclient import TestClient\n\nfrom app.main import app\nfrom app.tasks import add_task, list_tasks, set_done\n\nclient = TestClient(app)\n\n\ndef test_data_layer_saves_and_changes_a_task():\n    task = add_task(\"From the test\")\n    set_done(task.id, True)\n    assert next(t for t in list_tasks() if t.id == task.id).done is True\n";
    if (login) {
      var probe = isRest ? '"/api/tasks"' : isGql ? '"/graphql"' : '"/tasks"';
      test += "\n\ndef test_logged_out_visitors_are_blocked():\n    res = client.post(" + probe + ", json={\"title\": \"x\"}, follow_redirects=False)\n    assert res.status_code == 401\n";
      if (own) test += "\n\ndef test_sign_up_then_use_the_app():\n    import uuid\n    logged_in = TestClient(app)\n    res = logged_in.post(\"/signup\", data={\"email\": uuid.uuid4().hex + \"@example.com\", \"password\": \"long enough password\"}, follow_redirects=False)\n    assert res.status_code == 303\n" + (isRest ? "    assert logged_in.get(\"/api/tasks\").status_code == 200\n" : '') + (templates ? "    assert logged_in.get(\"/tasks\").status_code == 200\n" : '');
    } else if (isRest) {
      test += "\n\ndef test_rest_api_adds_changes_and_lists_tasks():\n    created = client.post(\"/api/tasks\", json={\"title\": \"Through the API\"})\n    assert created.status_code == 201\n    task = created.json()\n    changed = client.put(\"/api/tasks/\" + task[\"id\"], json={\"done\": True})\n    assert changed.json()[\"done\"] is True\n    listed = client.get(\"/api/tasks\")\n    assert \"content-range\" in listed.headers\n    assert any(t[\"id\"] == task[\"id\"] for t in listed.json())\n\n\ndef test_empty_title_is_rejected():\n    assert client.post(\"/api/tasks\", json={\"title\": \" \"}).status_code == 400\n";
    } else if (isGql) {
      test += "\n\ndef test_graphql_adds_and_lists_tasks():\n    added = client.post(\"/graphql\", json={\"query\": 'mutation { addTask(title: \"Through GraphQL\") { id } }'}).json()\n    assert added[\"data\"][\"addTask\"][\"id\"]\n    listed = client.post(\"/graphql\", json={\"query\": \"{ tasks { id title done } }\"}).json()\n    assert any(t[\"title\"] == \"Through GraphQL\" for t in listed[\"data\"][\"tasks\"])\n";
    }
    if (templates && !login) test += "\n\ndef test_page_shows_tasks_and_escapes_titles():\n    client.post(\"/tasks\", data={\"title\": \"<b>From a form</b>\"})\n    assert \"&lt;b&gt;From a form&lt;/b&gt;\" in client.get(\"/\").text\n";
    if (a.admin === 'in-app') test += "\n\ndef test_admin_page_needs_a_login():\n    assert TestClient(app).get(\"/admin\", follow_redirects=False).status_code == 307\n";
    sections.push({ id: 'test', title: 'Test it', items: [
      { file: 'tests/__init__.py', lang: 'python', code: '', lines: [['__init__.py', 'Marks <code>tests</code> as a package, so pytest can find your <code>app</code> package.']] },
      { file: 'tests/test_app.py', lang: 'python', code: test, lines: [['TestClient', 'Calls your app directly, without opening a port.'], ['assert', 'Fails the test if this isn\'t true.'], ['def test_', 'pytest runs every function that starts with <code>test_</code>.']] },
      { cmd: 'python -m pytest -q', lines: [['python -m pytest', 'Runs the tests, and adds the current folder to the import path. They use whichever database <code>DATABASE_URL</code> points at, so use a development database.'], ['-q', 'Shorter output.']] },
      { p: 'Then start it with the command below and open <code>http://localhost:8000</code>.' + (isRest ? ' You can also try the API at <code>http://localhost:8000/docs</code>.' : '') + (spa ? ' For the frontend, also run <code>npm run dev</code> inside <code>web</code>, and open the address it prints.' : '') },
      { cmd: 'fastapi dev app/main.py', manual: true, lines: [['fastapi dev', 'Starts the server and restarts it when you save a file. Press Ctrl+C to stop it.']] }
    ] });

    var envList = ['DATABASE_URL'];
    if (login) envList.push('SESSION_SECRET', 'HTTPS_ONLY', 'ADMIN_EMAILS');
    if (oidc) envList.push('OIDC_ISSUER', 'OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET');
    if (a.transport === 'managed') envList.push('ABLY_API_KEY');
    if (a.payment) { envList.push('PUBLIC_URL'); Kit.PAYMENT[a.payment].env.forEach(function (e) { envList.push(e[0]); }); }
    var spaBuild = spa ? "FROM node:24-slim AS frontend\nWORKDIR /web\nCOPY web/package*.json ./\nRUN npm ci\nCOPY web/ ./\nRUN npm run build\n\n" : '';
    var docker = spaBuild + "FROM python:3.13-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .\n" + (spa ? "COPY --from=frontend /web/dist ./web/dist\n" : '') + "RUN useradd --create-home app\nUSER app\nEXPOSE 8000\nCMD [\"fastapi\", \"run\", \"app/main.py\", \"--port\", \"8000\"]\n";
    var deploy = [{ p: 'Record the exact library versions, so the server installs the same ones:' }, { cmd: 'pip freeze > requirements.txt', lines: [['pip freeze', 'Lists every installed library and its version.']] }];
    sections.push({ id: 'deploy', title: 'Deploy it', items: deploy.concat(Kit.hostingItems(a, { port: 8000, env: envList, dockerfile: docker, dockerignore: '.venv\n__pycache__\nweb/node_modules\nweb/dist\nadmin/node_modules\n.git\n.env\n*.db\n', dockerLines: [
      ['python:3.13-slim', 'A small official image with Python.'],
      ['pip install -r', 'Installs exactly the versions you recorded.'],
    ].concat(spa ? [['AS frontend', 'A first stage builds the frontend, and only its finished files are copied into the final image.']] : []).concat([
      ['useradd and USER', 'Runs as a limited user rather than as root.'],
      ['fastapi run', 'Starts the production server.']
    ]) })) });
    return sections;
  }
  Kit.frameworks.fastapi = fastapi;
  Kit.py = { dataItems: dataItems, migrationItems: migrationItems, paymentSection: paymentSection, viewsSection: viewsSection, LOGIN_HTML: LOGIN_HTML };
})(StackKit);
