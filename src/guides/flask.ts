// @ts-nocheck -- moved from the single-file page; types are added module by module.
import { StackKit } from '../stack-kit';

// Guide for Flask. It shares its database, payment and page code with FastAPI.
(function (Kit) {
  function flask(a) {
    var sections = [];
    var spa = Kit.isSpa(a), templates = a.frontend === 'server-templates', login = !!a.login, oidc = Kit.usesOidc(a), own = login && !oidc;
    var isRest = a.api === 'rest', isGql = a.api === 'graphql';
    sections.push({ id: 'tools', title: 'Install your tools', items: [
      { p: 'You need <a href="https://www.python.org/downloads/">Python</a> 3.10 or newer. Commands assume a Unix-style terminal. On Windows, use Git Bash or WSL.' },
      { cmd: 'python --version', lines: [['python', 'Runs Python. On some systems the command is <code>python3</code>.']] }
    ] });
    var extras = [];
    if (isGql) extras.push('strawberry-graphql');
    if (oidc) extras.push('authlib requests');
    if (a.transport === 'websocket') extras.push('flask-sock');
    if (a.payment || a.transport === 'managed') extras.push('httpx');
    sections.push({ id: 'project', title: 'Create the project', items: [
      { cmd: 'mkdir demo\ncd demo\npython -m venv .venv\n. .venv/Scripts/activate 2>/dev/null || . .venv/bin/activate', lines: [
        ['python -m venv .venv', 'Creates a virtual environment: a private folder of libraries for this project only.'],
        ['activate', 'Makes this terminal use that environment. Windows and other systems keep the script in different folders, so this tries both. Run it again in each new terminal.']
      ] },
      { cmd: 'pip install flask pydantic pytest' + (extras.length ? ' ' + extras.join(' ') : ''), lines: [
        ['flask', 'The web framework. It includes the Jinja2 template language and signed session cookies.'],
        ['pydantic', 'Describes the shape of a task, and turns it into JSON.'],
        ['pytest', 'Python\'s most common test runner.']
      ].concat(isGql ? [['strawberry-graphql', 'A GraphQL library that builds the schema from Python classes.']] : []).concat(oidc ? [['authlib requests', 'Handle the OpenID Connect login flow.']] : []).concat(a.transport === 'websocket' ? [['flask-sock', 'Adds WebSocket routes to Flask.']] : []).concat(a.payment || a.transport === 'managed' ? [['httpx', 'Calls other services over HTTP.']] : []) },
      { file: '.gitignore', lang: 'text', code: '.venv\n__pycache__\n.env\n*.db\nnode_modules\ndist\n', lines: [['.gitignore', 'Tells Git what to leave out. Libraries can be installed again, and secrets and database files should never be committed.']] },
      { file: 'app/__init__.py', lang: 'python', code: '', lines: [['__init__.py', 'An empty file that marks <code>app</code> as a package, so its files can import each other.']] }
    ] });
    sections.push({ id: 'db', title: 'Set up the database', items: Kit.dbSetup(a).concat(Kit.py.dataItems(a, own)).concat(Kit.py.migrationItems(a, own)) });

    if (oidc) sections.push({ id: 'login', title: 'Set up your login provider', items: Kit.oidcSetup(a, '/auth/callback', 8000) });
    if (login) {
      sections.push({ id: 'auth', title: 'Add login', items: [
        { cmd: 'export SESSION_SECRET="$(openssl rand -hex 32)"\nexport ADMIN_EMAILS=you@example.com', lines: [['SESSION_SECRET', 'Signs the session cookie. Anyone with it could forge a login. Save the value and reuse it, because changing it logs everyone out.'], ['ADMIN_EMAILS', 'A comma-separated list of admin accounts.']] }
      ].concat(own ? [
        { file: 'templates/login.html', lang: 'html', code: Kit.py.LOGIN_HTML, lines: [['formaction', 'Each button posts the same form to a different URL.'], ['{{ error }}', 'Jinja2 inserts the value and escapes it, so it can\'t inject HTML.']] },
        { warn: 'This signs people up without confirming their email. Before you use <code>ADMIN_EMAILS</code> on a public site, add email verification, so nobody can register an admin\'s address first.' }
      ] : []) });
    }

    // Live updates
    if (a.transport) {
      var liveItems = [], liveCode, liveLines;
      if (a.transport === 'websocket') {
        liveCode = "from flask_sock import Sock\nfrom simple_websocket import ConnectionClosed\n\nsock = Sock()\nsockets = set()\n\n\n@sock.route(\"/live\")\ndef live(socket):\n    sockets.add(socket)\n    try:\n        while True:\n            socket.receive()\n    except ConnectionClosed:\n        pass\n    finally:\n        sockets.discard(socket)\n\n\ndef tasks_changed():\n    for socket in list(sockets):\n        try:\n            socket.send(\"changed\")\n        except ConnectionClosed:\n            sockets.discard(socket)\n";
        liveLines = [['Sock', 'Adds WebSocket routes to Flask.'], ['sockets', 'Every open connection, so a change can reach them all.'], ['socket.receive', 'Waits for the browser, and raises an error when it disconnects.'], ['tasks_changed', 'Tells every browser something changed.']];
      }
      if (a.transport === 'sse') {
        liveCode = "import queue\n\nfrom flask import Blueprint, Response\n\nbp = Blueprint(\"live\", __name__)\nlisteners = set()\n\n\n@bp.get(\"/api/live\")\ndef live():\n    waiting = queue.Queue()\n    listeners.add(waiting)\n\n    def events():\n        try:\n            yield \": connected\\n\\n\"\n            while True:\n                yield \"data: \" + waiting.get() + \"\\n\\n\"\n        finally:\n            listeners.discard(waiting)\n\n    return Response(events(), mimetype=\"text/event-stream\", headers={\"Cache-Control\": \"no-cache\"})\n\n\ndef tasks_changed():\n    for waiting in list(listeners):\n        waiting.put(\"changed\")\n";
        liveLines = [['text/event-stream', 'Tells the browser this response stays open and carries events.'], ['queue.Queue', 'One waiting list per browser. <code>get</code> sleeps until there\'s news.'], ['yield', 'Sends one event and keeps the response open.'], ['finally', 'Runs when the browser disconnects, so the queue is removed.']];
        liveItems.push({ warn: 'Each open connection holds a server thread, and the production server below needs enough threads. Thousands of viewers call for a different setup or a managed service.' });
      }
      if (a.transport === 'managed') {
        liveItems.push({ p: 'Create a free <a href="https://ably.com/docs/getting-started">Ably</a> account and copy an API key.' }, { cmd: 'pip install ably', lines: [['ably', 'Ably\'s official Python library.']] }, { cmd: 'export ABLY_API_KEY=your-key', manual: true, lines: [['ABLY_API_KEY', 'Your secret key. It stays on the server.']] });
        liveCode = "import asyncio\nimport os\n\nimport httpx\nfrom ably import AblyRest\nfrom flask import Blueprint\n\nbp = Blueprint(\"live\", __name__)\nkey = os.environ.get(\"ABLY_API_KEY\", \"\")\n\n\n@bp.get(\"/api/live-token\")\ndef live_token():\n    token = asyncio.run(AblyRest(key).auth.create_token_request({\"capability\": {\"tasks\": [\"subscribe\"]}}))\n    return token.to_dict()\n\n\ndef tasks_changed():\n    if not key:\n        return\n    name, secret = key.split(\":\", 1)\n    httpx.post(\"https://rest.ably.io/channels/tasks/messages\", auth=(name, secret), json={\"name\": \"changed\"}, timeout=5)\n";
        liveLines = [['create_token_request', 'Gives the browser a short-lived permission that can only subscribe, so your key stays secret.'], ['asyncio.run', 'Ably\'s library is async and Flask routes are normal functions, so this runs it to completion.'], ['httpx.post', 'Publishes through Ably\'s REST API.']];
      }
      liveItems.push({ file: 'app/live.py', lang: 'python', code: liveCode, lines: liveLines });
      sections.push({ id: 'live', title: 'Add live updates', items: liveItems });
    }

    Kit.py.paymentSection(a, sections);

    // The app
    var flaskNames = ['Flask'];
    if (isRest || a.payment || oidc || login || templates) flaskNames.push('request');
    if (isRest) flaskNames.push('jsonify');
    if (templates || a.admin === 'in-app' || own) flaskNames.push('render_template');
    if (login || a.payment) flaskNames.push('redirect');
    if (oidc) flaskNames.push('url_for');
    if (login) flaskNames.push('session');
    if (login || a.admin === 'in-app' || a.admin === 'react-admin' || isRest) flaskNames.push('abort');
    var imports = ['import os'];
    if (login) imports.push('from functools import wraps');
    imports.push('');
    if (isGql) imports.push('import strawberry');
    if (oidc) imports.push('from authlib.integrations.flask_client import OAuth');
    imports.push('from flask import ' + flaskNames.sort(function (x, y) { return x.toLowerCase() < y.toLowerCase() ? -1 : 1; }).join(', '));
    if (isGql) imports.push('from strawberry.flask.views import GraphQLView');
    if (own) imports.push('from werkzeug.security import check_password_hash, generate_password_hash');
    imports.push('');
    if (a.payment) imports.push('from app.checkout import create_checkout');
    if (a.transport === 'websocket') imports.push('from app.live import sock, tasks_changed');
    else if (a.transport) imports.push('from app.live import bp as live_bp, tasks_changed');
    imports.push('from app.tasks import ' + ['add_task', 'delete_task', 'list_tasks', 'set_done'].concat(own ? ['add_user', 'get_user'] : []).sort().join(', ') + (isGql ? ', Task' : ''));
    var notify = a.transport ? '\n    tasks_changed()' : '';
    var flaskArgs = spa ? '__name__, static_folder="../' + Kit.spaDistPath(a) + '", static_url_path=""' : '__name__, template_folder="../templates"';
    if (spa && (a.admin === 'in-app' || own)) flaskArgs += ', template_folder="../templates"';
    var code = imports.join('\n') + "\n\napp = Flask(" + flaskArgs + ")\n";
    if (login) code += "app.secret_key = os.environ[\"SESSION_SECRET\"]\napp.config.update(SESSION_COOKIE_SAMESITE=\"Lax\", SESSION_COOKIE_SECURE=os.environ.get(\"HTTPS_ONLY\") == \"1\")\nadmin_emails = {e.strip().lower() for e in os.environ.get(\"ADMIN_EMAILS\", \"\").split(\",\")}\n\n\ndef login_required(view):\n    @wraps(view)\n    def wrapper(*args, **kwargs):\n        if not session.get(\"email\"):\n            return {\"error\": \"Log in first\"}, 401\n        return view(*args, **kwargs)\n    return wrapper\n\n\ndef is_admin() -> bool:\n    return session.get(\"email\", \"\") in admin_emails\n";
    if (a.transport === 'websocket') code += "sock.init_app(app)\n";
    else if (a.transport) code += "app.register_blueprint(live_bp)\n";
    if (own) code += "\n\n@app.get(\"/login\")\ndef login_page():\n    return render_template(\"login.html\")\n\n\n@app.post(\"/login\")\ndef log_in():\n    email = request.form[\"email\"].lower()\n    user = get_user(email)\n    if not user or not check_password_hash(user[\"password_hash\"], request.form[\"password\"]):\n        return render_template(\"login.html\", error=\"Wrong email or password.\"), 401\n    session[\"email\"] = email\n    return redirect(\"/\", code=303)\n\n\n@app.post(\"/signup\")\ndef sign_up():\n    email = request.form[\"email\"].lower()\n    password = request.form[\"password\"]\n    if len(password) < 8:\n        return render_template(\"login.html\", error=\"Use at least 8 characters.\"), 400\n    if get_user(email):\n        return render_template(\"login.html\", error=\"That email is already registered.\"), 409\n    add_user(email, generate_password_hash(password))\n    session[\"email\"] = email\n    return redirect(\"/\", code=303)\n";
    if (oidc) code += "\n\noauth = OAuth(app)\noauth.register(\n    \"provider\",\n    client_id=os.environ.get(\"OIDC_CLIENT_ID\"),\n    client_secret=os.environ.get(\"OIDC_CLIENT_SECRET\"),\n    server_metadata_url=os.environ.get(\"OIDC_ISSUER\", \"\").rstrip(\"/\") + \"/.well-known/openid-configuration\",\n    client_kwargs={\"scope\": \"openid email profile\"},\n)\n\n\n@app.get(\"/login\")\ndef log_in():\n    return oauth.provider.authorize_redirect(url_for(\"auth_callback\", _external=True))\n\n\n@app.get(\"/auth/callback\")\ndef auth_callback():\n    token = oauth.provider.authorize_access_token()\n    session[\"email\"] = token[\"userinfo\"][\"email\"].lower()\n    return redirect(\"/\")\n";
    if (login) code += "\n\n@app.post(\"/logout\")\ndef log_out():\n    session.clear()\n    return redirect(\"/login\", code=303)\n";
    var guard = login ? '@login_required\n' : '';
    if (isRest) {
      code += "\n\n@app.get(\"/api/tasks\")\n" + guard + "def get_tasks():\n    tasks = [t.model_dump() for t in list_tasks()]\n    response = jsonify(tasks)\n    response.headers[\"Content-Range\"] = f\"tasks 0-{len(tasks)}/{len(tasks)}\"\n    response.headers[\"Access-Control-Expose-Headers\"] = \"Content-Range\"\n    return response\n\n\n@app.get(\"/api/tasks/<task_id>\")\n" + guard + "def get_task(task_id):\n    task = next((t for t in list_tasks() if t.id == task_id), None)\n    if task is None:\n        abort(404)\n    return task.model_dump()\n\n\n@app.post(\"/api/tasks\")\n" + guard + "def create_task():\n    title = str((request.get_json(silent=True) or {}).get(\"title\", \"\")).strip()\n    if not title or len(title) > 200:\n        return {\"error\": \"A title of 1 to 200 characters is required\"}, 400\n    task = add_task(title)" + notify + "\n    return task.model_dump(), 201\n\n\n@app.put(\"/api/tasks/<task_id>\")\n" + guard + "def change_task(task_id):\n    set_done(task_id, bool(request.get_json().get(\"done\")))" + notify + "\n    task = next((t for t in list_tasks() if t.id == task_id), None)\n    return task.model_dump() if task else ({}, 404)\n";
    }
    if (isGql) {
      code += "\n\n@strawberry.type\nclass TaskType:\n    id: strawberry.ID\n    title: str\n    done: bool\n\n\ndef to_type(task: Task) -> TaskType:\n    return TaskType(id=strawberry.ID(task.id), title=task.title, done=task.done)\n\n\n@strawberry.type\nclass Query:\n    @strawberry.field\n    def tasks(self) -> list[TaskType]:\n        return [to_type(t) for t in list_tasks()]\n\n\n@strawberry.type\nclass Mutation:\n    @strawberry.mutation\n    def add_task(self, title: str) -> TaskType:\n        task = add_task(title)" + notify.replace('\n    ', '\n        ') + "\n        return to_type(task)\n\n    @strawberry.mutation\n    def set_done(self, id: strawberry.ID, done: bool) -> bool:\n        set_done(str(id), done)" + notify.replace('\n    ', '\n        ') + "\n        return True\n\n\ngraphql_view = GraphQLView.as_view(\"graphql\", schema=strawberry.Schema(Query, Mutation))\napp.add_url_rule(\"/graphql\", view_func=" + (login ? 'login_required(graphql_view)' : 'graphql_view') + ")\n";
    }
    if (templates) {
      code += "\n\n@app.get(\"/\")\ndef home():\n" + (login ? "    if not session.get(\"email\"):\n        return redirect(\"/login\")\n" : '') + "    return render_template(\"index.html\", tasks=list_tasks())\n\n\n@app.get(\"/tasks\")\n" + guard + "def tasks_part():\n    return render_template(\"list.html\", tasks=list_tasks())\n\n\n@app.post(\"/tasks\")\n" + guard + "def add_from_form():\n    title = request.form.get(\"title\", \"\").strip()\n    if title and len(title) <= 200:\n        add_task(title)" + notify.replace('\n    ', '\n        ') + "\n    return render_template(\"list.html\", tasks=list_tasks())\n\n\n@app.post(\"/tasks/<task_id>/toggle\")\n" + guard + "def toggle(task_id):\n    set_done(task_id, request.form.get(\"done\") == \"on\")" + notify + "\n    return render_template(\"list.html\", tasks=list_tasks())\n";
    }
    if (a.admin === 'in-app') {
      code += "\n\n@app.get(\"/admin\")\ndef admin_page():\n    if not session.get(\"email\"):\n        return redirect(\"/login\")\n    if not is_admin():\n        abort(403)\n    return render_template(\"admin.html\", tasks=list_tasks())\n\n\n@app.post(\"/admin/tasks/<task_id>/delete\")\ndef admin_delete(task_id):\n    if not is_admin():\n        abort(403)\n    delete_task(task_id)" + notify + "\n    return redirect(\"/admin\", code=303)\n";
    }
    if (a.admin === 'react-admin') {
      code += "\n\n@app.delete(\"/api/tasks/<task_id>\")\ndef remove_task(task_id):\n    if not is_admin():\n        abort(403)\n    delete_task(task_id)" + notify + "\n    return {\"id\": task_id}\n";
    }
    if (a.payment) {
      code += "\n\n@app.post(\"/api/checkout\")\n" + guard + "def checkout():\n    base_url = os.environ.get(\"PUBLIC_URL\", request.host_url.rstrip(\"/\"))\n    return redirect(create_checkout(base_url), code=303)\n";
    }
    if (spa) code += "\n\n@app.get(\"/\")\ndef frontend():\n    return app.send_static_file(\"index.html\")\n";
    var lines = [['Flask(__name__', 'Creates the app, and says where its templates' + (spa ? ' and built frontend' : '') + ' are.']];
    if (login) lines.push(['app.secret_key', 'Signs the session cookie. Reading it with <code>os.environ[...]</code> makes the app refuse to start without one. Set <code>HTTPS_ONLY=1</code> in production, so the cookie is only sent over HTTPS.'], ['SESSION_COOKIE_SAMESITE', 'Stops other sites from sending your forms with the visitor\'s login.'], ['login_required', 'A decorator: it wraps a route, and answers 401 if nobody is logged in.'], ['is_admin', 'Treats the emails in <code>ADMIN_EMAILS</code> as admins, so you don\'t need a roles system to start.'], ['/logout', 'Clears the session. It\'s a POST so other sites can\'t log someone out with a link.']);
    if (own) lines.push(['generate_password_hash', 'Werkzeug, which comes with Flask, hashes the password so the original is never stored.'], ['check_password_hash', 'Checks a password against its stored hash.'], ['code=303', 'Makes the browser follow the redirect with a GET, so refreshing doesn\'t resend the form.']);
    if (oidc) lines.push(['server_metadata_url', 'A standard address where the provider publishes its login and token URLs.'], ['authorize_redirect', 'Sends the visitor to your provider\'s login page.'], ['authorize_access_token', 'Handles the return from the provider, checks the response and gets the user\'s details.']);
    if (isRest) lines.push(['@app.get', 'Runs this function for GET requests to the path.'], ['<task_id>', 'A variable part of the URL, passed to the function.'], ['model_dump', 'Turns a task into a dictionary, which Flask sends as JSON.'], ['Content-Range', 'Tells clients how many rows exist. React-admin needs this.'], ['len(title) > 200', 'Never trust input. This rejects anything the database wouldn\'t accept.'], [', 201', 'Returning a second value sets the status code.']);
    if (isGql) lines.push(['@strawberry.type', 'Turns a class into a GraphQL type, using its type hints.'], ['@strawberry.mutation', 'Marks a field that changes data.'], ['GraphQLView', 'Serves GraphQL at <code>/graphql</code>.']);
    if (templates) lines.push(['render_template', 'Fills in a template and returns the HTML.'], ['list.html', 'Returned on its own, because htmx swaps just that part of the page.'], ['request.form', 'Reads a posted HTML form. A checked checkbox sends <code>on</code>, and an unchecked one sends nothing.']);
    if (a.admin === 'in-app') lines.push(['is_admin()', 'The check runs on the server. Hiding a link isn\'t protection, because anyone can type a URL.'], ['abort(403)', 'Means logged in, but not allowed.']);
    if (a.payment) lines.push(['PUBLIC_URL', 'Your site\'s real address. Set this in production, because the <code>Host</code> header can be forged.']);
    if (spa) lines.push(['send_static_file', 'Serves your built frontend.']);
    sections.push({ id: 'app', title: 'Write the app', items: [{ file: 'app/main.py', lang: 'python', code: code, lines: lines }] });

    Kit.py.viewsSection(a, sections);
    if (spa) sections.push({ id: 'frontend', title: 'Build the frontend', items: Kit.spaItems(a, 8000) });
    if (a.admin === 'react-admin') sections.push({ id: 'admin', title: 'Add the admin app', items: Kit.reactAdminItems(a, 8000) });
    if (a.admin === 'low-code') sections.push({ id: 'admin', title: 'Add the admin tool', items: Kit.lowCodeItems(a) });

    // Tests
    var test = "from app.main import app\nfrom app.tasks import add_task, list_tasks, set_done\n\nclient = app.test_client()\n\n\ndef test_data_layer_saves_and_changes_a_task():\n    task = add_task(\"From the test\")\n    set_done(task.id, True)\n    assert next(t for t in list_tasks() if t.id == task.id).done is True\n";
    if (login) {
      var probe = isRest ? '"/api/tasks"' : isGql ? '"/graphql"' : '"/tasks"';
      test += "\n\ndef test_logged_out_visitors_are_blocked():\n    assert app.test_client().post(" + probe + ", json={\"title\": \"x\"}).status_code == 401\n";
      if (own) test += "\n\ndef test_sign_up_log_out_and_log_in():\n    import uuid\n    email = uuid.uuid4().hex + \"@example.com\"\n    user = app.test_client()\n    assert user.post(\"/signup\", data={\"email\": email, \"password\": \"long enough password\"}).status_code == 303\n    assert user.post(\"/logout\").status_code == 303\n    assert user.post(\"/login\", data={\"email\": email, \"password\": \"wrong password here\"}).status_code == 401\n    assert user.post(\"/login\", data={\"email\": email, \"password\": \"long enough password\"}).status_code == 303\n";
    } else if (isRest) {
      test += "\n\ndef test_rest_api_adds_changes_and_lists_tasks():\n    created = client.post(\"/api/tasks\", json={\"title\": \"Through the API\"})\n    assert created.status_code == 201\n    task = created.get_json()\n    changed = client.put(\"/api/tasks/\" + task[\"id\"], json={\"done\": True})\n    assert changed.get_json()[\"done\"] is True\n    listed = client.get(\"/api/tasks\")\n    assert \"Content-Range\" in listed.headers\n    assert any(t[\"id\"] == task[\"id\"] for t in listed.get_json())\n\n\ndef test_empty_title_is_rejected():\n    assert client.post(\"/api/tasks\", json={\"title\": \" \"}).status_code == 400\n";
    } else if (isGql) {
      test += "\n\ndef test_graphql_adds_and_lists_tasks():\n    added = client.post(\"/graphql\", json={\"query\": 'mutation { addTask(title: \"Through GraphQL\") { id } }'}).get_json()\n    assert added[\"data\"][\"addTask\"][\"id\"]\n    listed = client.post(\"/graphql\", json={\"query\": \"{ tasks { id title done } }\"}).get_json()\n    assert any(t[\"title\"] == \"Through GraphQL\" for t in listed[\"data\"][\"tasks\"])\n";
    }
    if (templates && !login) test += "\n\ndef test_page_shows_tasks_and_escapes_titles():\n    client.post(\"/tasks\", data={\"title\": \"<b>From a form</b>\"})\n    assert \"&lt;b&gt;From a form&lt;/b&gt;\" in client.get(\"/\").get_data(as_text=True)\n";
    if (a.admin === 'in-app') test += "\n\ndef test_admin_page_needs_a_login():\n    assert app.test_client().get(\"/admin\").status_code == 302\n";
    sections.push({ id: 'test', title: 'Test it', items: [
      { file: 'tests/__init__.py', lang: 'python', code: '', lines: [['__init__.py', 'Marks <code>tests</code> as a package, so pytest can find your <code>app</code> package.']] },
      { file: 'tests/test_app.py', lang: 'python', code: test, lines: [['test_client', 'Calls your app directly, without opening a port. It keeps cookies between requests, like a browser.'], ['assert', 'Fails the test if this isn\'t true.'], ['def test_', 'pytest runs every function that starts with <code>test_</code>.']] },
      { cmd: 'python -m pytest -q', lines: [['python -m pytest', 'Runs the tests, and adds the current folder to the import path. They use whichever database <code>DATABASE_URL</code> points at, so use a development database.'], ['-q', 'Shorter output.']] },
      { p: 'Then start it with the command below and open <code>http://localhost:8000</code>.' + (spa ? ' For the frontend, also run <code>npm run dev</code> inside <code>web</code>, and open the address it prints.' : '') },
      { cmd: 'flask --app app.main run --debug --port 8000', manual: true, lines: [['--app app.main', 'Says where your app is.'], ['--debug', 'Restarts when you save a file, and shows detailed errors. Never use this in production.']] }
    ] });

    var envList = ['DATABASE_URL'];
    if (login) envList.push('SESSION_SECRET', 'HTTPS_ONLY', 'ADMIN_EMAILS');
    if (oidc) envList.push('OIDC_ISSUER', 'OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET');
    if (a.transport === 'managed') envList.push('ABLY_API_KEY');
    if (a.payment) { envList.push('PUBLIC_URL'); Kit.PAYMENT[a.payment].env.forEach(function (e) { envList.push(e[0]); }); }
    var spaBuild = spa ? "FROM node:24-slim AS frontend\nWORKDIR /web\nCOPY web/package*.json ./\nRUN npm ci\nCOPY web/ ./\nRUN npm run build\n\n" : '';
    var threads = a.transport === 'sse' || a.transport === 'websocket' ? '"--threads", "100", ' : '"--workers", "2", ';
    var docker = spaBuild + "FROM python:3.13-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .\n" + (spa ? "COPY --from=frontend /web/dist ./web/dist\n" : '') + "RUN useradd --create-home app\nUSER app\nEXPOSE 8000\nCMD [\"gunicorn\", " + threads + "\"--bind\", \"0.0.0.0:8000\", \"app.main:app\"]\n";
    var deploy = [{ p: 'Flask\'s own server is only for development. Add Gunicorn, a production server, and record the exact library versions so the server installs the same ones:' }, { cmd: 'pip install gunicorn\npip freeze > requirements.txt', lines: [['gunicorn', 'A production server. It runs on Linux, which is what the container below uses, so it won\'t start on Windows itself.'], ['pip freeze', 'Lists every installed library and its version.']] }];
    sections.push({ id: 'deploy', title: 'Deploy it', items: deploy.concat(Kit.hostingItems(a, { port: 8000, env: envList, dockerfile: docker, dockerignore: '.venv\n__pycache__\nweb/node_modules\nweb/dist\nadmin/node_modules\n.git\n.env\n*.db\n', dockerLines: [
      ['python:3.13-slim', 'A small official image with Python.'],
      ['pip install -r', 'Installs exactly the versions you recorded.']
    ].concat(spa ? [['AS frontend', 'A first stage builds the frontend, and only its finished files are copied into the final image.']] : []).concat([
      ['useradd and USER', 'Runs as a limited user rather than as root.'],
      ['gunicorn', 'Starts the production server.' + (a.transport === 'sse' || a.transport === 'websocket' ? ' <code>--threads 100</code> keeps enough threads for open live connections, in one process, so they can all hear about changes.' : '')]
    ]) })) });
    return sections;
  }
  Kit.frameworks.flask = flask;
})(StackKit);
