// @ts-nocheck -- moved from the single-file page; types are added module by module.
import { StackKit } from '../stack-kit';

// Guide for Django, which brings its own ORM, migrations, templates, login and admin.
(function (Kit) {
  var DB_URL = { postgresql: 'postgresql://postgres:your-password@localhost:5432/demo', mysql: 'mysql://root:your-password@localhost:3306/demo', sqlserver: 'mssql://sa:your-password@localhost:1433/demo', mongodb: 'mongodb://localhost:27017/demo' };
  var LOGIN = "<!doctype html>\n<html lang=\"en\">\n<meta charset=\"utf-8\">\n<title>Log in</title>\n<h1>Log in or sign up</h1>\n{% if error %}<p role=\"alert\">{{ error }}</p>{% endif %}\n<form method=\"post\">\n  {% csrf_token %}\n  <label>Email <input name=\"email\" type=\"email\" required></label>\n  <label>Password <input name=\"password\" type=\"password\" minlength=\"8\" required></label>\n  <button formaction=\"/login\">Log in</button>\n  <button formaction=\"/signup\">Sign up</button>\n</form>\n</html>\n";

  function django(a) {
    var s = [];
    var spa = Kit.isSpa(a), templates = a.frontend === 'server-templates', login = !!a.login, oidc = Kit.usesOidc(a), own = login && !oidc;
    var isRest = a.api === 'rest', isGql = a.api === 'graphql', mongo = a.database === 'mongodb', flyway = a.migrations === 'flyway-any';
    var channels = a.transport === 'websocket';
    s.push({ id: 'tools', title: 'Install your tools', items: [
      { p: 'You need <a href="https://www.python.org/downloads/">Python</a> 3.12 or newer, which current Django requires. Commands assume a Unix-style terminal. On Windows, use Git Bash or WSL.' },
      { cmd: 'python --version', lines: [['python', 'Runs Python. On some systems the command is <code>python3</code>.']] }
    ] });
    var driver = { postgresql: '"psycopg[binary]"', mysql: 'mysqlclient', sqlserver: 'mssql-django', mongodb: 'django-mongodb-backend', sqlite: '' }[a.database];
    var pk = [mongo ? driver : 'django', 'pytest pytest-django whitenoise'];
    if (!mongo) pk.push('dj-database-url');
    if (!mongo && driver) pk.push(driver);
    if (isRest) pk.push('djangorestframework');
    if (isGql) pk.push('strawberry-graphql');
    if (oidc) pk.push('authlib requests');
    if (channels) pk.push('channels daphne');
    if (a.payment || a.transport === 'managed') pk.push('httpx');
    if (a.transport === 'managed') pk.push('ably');
    s.push({ id: 'project', title: 'Create the project', items: [
      { cmd: 'mkdir demo\ncd demo\npython -m venv .venv\n. .venv/Scripts/activate 2>/dev/null || . .venv/bin/activate', lines: [
        ['python -m venv .venv', 'Creates a virtual environment: a private folder of libraries for this project only.'],
        ['activate', 'Makes this terminal use that environment. Windows and other systems keep the script in different folders, so this tries both. Run it again in each new terminal.']
      ] },
      { cmd: 'pip install ' + pk.join(' ') + '\ndjango-admin startproject config . ' + (mongo ? '--template https://github.com/mongodb-labs/django-mongodb-project/archive/refs/heads/6.0.x.zip' : '') + '\npython manage.py startapp tasks', lines: [
        [mongo ? 'django-mongodb-backend' : 'django', mongo ? 'Lets Django use MongoDB. It installs the version of Django it supports.' : 'The web framework.'],
        ['pytest pytest-django', 'Runs tests, with helpers for Django.'],
        ['whitenoise', 'Lets your app serve its own static files in production.'],
      ].concat(mongo ? [] : [['dj-database-url', 'Reads the database address from one environment variable.']]).concat(mongo || !driver ? [] : [[driver.replace(/"/g, ''), 'The driver for your database.' + (a.database === 'sqlserver' ? ' It also needs Microsoft\'s ODBC driver installed.' : '')]]).concat(isRest ? [['djangorestframework', 'The most widely used REST toolkit for Django.']] : []).concat(isGql ? [['strawberry-graphql', 'A GraphQL library that builds the schema from Python classes.']] : []).concat(oidc ? [['authlib requests', 'Handle the OpenID Connect login flow.']] : []).concat(channels ? [['channels daphne', 'Add WebSocket support. Django itself doesn\'t handle them.']] : []).concat([
        ['startproject config .', 'Creates the project\'s settings in a <code>config</code> folder, and <code>manage.py</code> in this one.'],
        ['startapp tasks', 'Creates a <code>tasks</code> app for your feature. A Django project is a set of apps.']
      ]).concat(mongo ? [['--template', 'Uses MongoDB\'s project template, which includes the migrations that Django\'s built-in apps need on MongoDB.']] : []) },
      { file: '.gitignore', lang: 'text', code: '.venv\n__pycache__\n.env\n*.db\n*.sqlite3\nstaticfiles\nnode_modules\ndist\n', lines: [['.gitignore', 'Tells Git what to leave out. Libraries can be installed again, and secrets and database files should never be committed.']] }
    ] });

    // Settings
    var settings = "\n\n# Everything below this line was added for this project.\nimport os\n\n" + (mongo ? "" : "import dj_database_url\n") + "\nSECRET_KEY = os.environ[\"SECRET_KEY\"]\nDEBUG = os.environ.get(\"DEBUG\") == \"1\"\nALLOWED_HOSTS = [\"localhost\", \"127.0.0.1\"] + [h for h in os.environ.get(\"ALLOWED_HOSTS\", \"\").split(\",\") if h]\n";
    if (mongo) settings += "database_url = os.environ.get(\"DATABASE_URL\", \"mongodb://localhost:27017/demo\")\nDATABASES = {\"default\": {\"ENGINE\": \"django_mongodb_backend\", \"HOST\": database_url, \"NAME\": database_url.rsplit(\"/\", 1)[1]}}\n";
    else if (a.database === 'sqlite') settings += "DATABASES = {\"default\": dj_database_url.parse(os.environ.get(\"DATABASE_URL\", \"sqlite:///\" + str(BASE_DIR / \"demo.db\")))}\n";
    else settings += "DATABASES = {\"default\": dj_database_url.parse(os.environ[\"DATABASE_URL\"])}\n";
    var apps = ['tasks'];
    if (isRest) apps.push('rest_framework');
    if (channels) apps.unshift('daphne');
    settings += "INSTALLED_APPS = " + (channels ? '["daphne"] + INSTALLED_APPS + ' + JSON.stringify(apps.filter(function (x) { return x !== 'daphne'; })) : 'INSTALLED_APPS + ' + JSON.stringify(apps)) + "\nMIDDLEWARE.insert(1, \"whitenoise.middleware.WhiteNoiseMiddleware\")\nSTATIC_ROOT = BASE_DIR / \"staticfiles\"\n";
    if (spa) settings += "WHITENOISE_ROOT = BASE_DIR / \"" + Kit.spaDistPath(a) + "\"\nWHITENOISE_INDEX_FILE = True\nCSRF_TRUSTED_ORIGINS = [\"http://localhost:5173\", \"http://localhost:4200\"]\n";
    if (login) settings += "ADMIN_EMAILS = {e.strip().lower() for e in os.environ.get(\"ADMIN_EMAILS\", \"\").split(\",\")}\nSESSION_COOKIE_SECURE = CSRF_COOKIE_SECURE = os.environ.get(\"HTTPS_ONLY\") == \"1\"\n";
    if (isRest) settings += "REST_FRAMEWORK = {\n    \"DEFAULT_AUTHENTICATION_CLASSES\": [\"tasks.authentication.SessionAuthentication401\"],\n    \"DEFAULT_PERMISSION_CLASSES\": [\"rest_framework.permissions." + (login ? 'IsAuthenticated' : 'AllowAny') + "\"],\n    \"DEFAULT_RENDERER_CLASSES\": [\"rest_framework.renderers.JSONRenderer\"],\n}\n";
    if (channels) settings += "ASGI_APPLICATION = \"config.asgi.application\"\nCHANNEL_LAYERS = {\"default\": {\"BACKEND\": \"channels.layers.InMemoryChannelLayer\"}}\n";
    var setLines = [
      ['SECRET_KEY', 'Signs sessions and other security features. Reading it from the environment replaces the placeholder Django generated, and the app refuses to start without one.'],
      ['DEBUG', 'Shows detailed error pages. It\'s off unless you turn it on, because those pages expose your code and settings.'],
      ['ALLOWED_HOSTS', 'Which addresses this site answers to. Add your real domain through the environment variable.'],
      ['DATABASES', 'Where the data is, read from <code>DATABASE_URL</code>.'],
      ['INSTALLED_APPS', 'Turns on your app and the libraries that need registering.'],
      ['WhiteNoiseMiddleware', 'Serves static files from your app itself, which is simple and works on most hosts.'],
      ['STATIC_ROOT', 'Where <code>collectstatic</code> gathers static files for production.']
    ];
    if (spa) setLines.push(['WHITENOISE_ROOT', 'Serves your built frontend from the same server.'], ['CSRF_TRUSTED_ORIGINS', 'Lets your development frontend, which runs on its own port, send forms and API calls.']);
    if (isRest) setLines.push(['REST_FRAMEWORK', 'Settings for the REST toolkit, covering who may call the API and that it returns JSON.']);
    if (channels) setLines.push(['CHANNEL_LAYERS', 'How parts of the app message each other. The in-memory layer only works with one process, so use the Redis layer with several.']);
    s.push({ id: 'settings', title: 'Set up the project', items: [
      { cmd: 'export SECRET_KEY="$(python -c \'from django.core.management.utils import get_random_secret_key as k; print(k())\')"\nexport DEBUG=1' + (login ? '\nexport ADMIN_EMAILS=you@example.com' : ''), lines: [['get_random_secret_key', 'Generates a random secret. Save the value and reuse it, because changing it logs everyone out.'], ['DEBUG=1', 'Turns on detailed errors for development only.']].concat(login ? [['ADMIN_EMAILS', 'A comma-separated list of admin accounts.']] : []) },
      { file: 'config/settings.py', append: true, lang: 'python', code: settings, lines: setLines },
      { p: 'Add those lines to the end of the generated file.' }
    ] });

    // Database and model
    var dbItems = Kit.dbSetup(a);
    if (a.database !== 'sqlite') dbItems.push({ cmd: 'export DATABASE_URL="' + DB_URL[a.database] + '"', manual: true, lines: [['DATABASE_URL', 'Where the database is, including its password.']] });
    if (mongo) dbItems.push({ file: 'tasks/apps.py', lang: 'python', code: "from django.apps import AppConfig\n\n\nclass TasksConfig(AppConfig):\n    default_auto_field = \"django_mongodb_backend.fields.ObjectIdAutoField\"\n    name = \"tasks\"\n", lines: [['default_auto_field', 'Gives this app MongoDB' + "'" + 's ObjectId IDs, rather than the numbers SQL databases use.']] });
    dbItems.push({ file: 'tasks/models.py', lang: 'python', code: "from django.db import models\n\n\nclass Task(models.Model):\n    title = models.CharField(max_length=200)\n    done = models.BooleanField(default=False)\n\n    class Meta:\n        db_table = \"tasks\"\n        ordering = [\"id\"]\n" + (flyway ? "        managed = False\n" : '') + "\n    def __str__(self):\n        return self.title\n", lines: [['class Task(models.Model)', 'A table, described as a class. Django adds an <code>id</code> column.'], ['CharField(max_length=200)', 'Text of up to 200 characters.'], ['db_table', 'Names the table <code>tasks</code>.'], ['ordering', 'Sorts rows by ID unless a query says otherwise.']].concat(flyway ? [['managed = False', 'Tells Django that Flyway owns this table, so Django won\'t create or change it.']] : []).concat([['__str__', 'How a task appears in the admin.']]) });
    if (flyway) {
      dbItems = dbItems.concat(Kit.flywayItems(a));
      dbItems.push({ p: 'Django still needs its own tables for logins and sessions, so run its migrations too:' });
      dbItems.push({ cmd: 'python manage.py migrate', lines: [['migrate', 'Creates Django\'s built-in tables. Your <code>tasks</code> table stays with Flyway.']] });
    } else {
      dbItems.push({ cmd: 'python manage.py makemigrations tasks\npython manage.py migrate', lines: [['makemigrations', 'Compares your classes to earlier migrations and writes a new file into <code>tasks/migrations</code>. Commit that folder.'], ['migrate', 'Runs every migration that hasn\'t run, including Django\'s built-in ones.']] });
    }
    s.push({ id: 'db', title: 'Set up the database', items: dbItems });

    if (oidc) s.push({ id: 'login', title: 'Set up your login provider', items: Kit.oidcSetup(a, '/auth/callback', 8000) });
    if (own) s.push({ id: 'auth', title: 'Add the login page', items: [
      { file: 'tasks/templates/login.html', lang: 'html', code: LOGIN, lines: [['{% csrf_token %}', 'A hidden value that proves the form came from your own site. Django rejects posts without it.'], ['formaction', 'Each button posts the same form to a different URL.'], ['{{ error }}', 'Django inserts the value and escapes it, so it can\'t inject HTML.']] },
      { warn: 'This signs people up without confirming their email. Before you use <code>ADMIN_EMAILS</code> on a public site, add email verification, so nobody can register an admin\'s address first.' }
    ] });

    // Live
    var notify = a.transport ? '\n    tasks_changed()' : '';
    if (a.transport) {
      var li = [], code, lines;
      if (channels) {
        code = "from asgiref.sync import async_to_sync\nfrom channels.generic.websocket import AsyncWebsocketConsumer\nfrom channels.layers import get_channel_layer\n\n\nclass LiveConsumer(AsyncWebsocketConsumer):\n    async def connect(self):\n        await self.channel_layer.group_add(\"tasks\", self.channel_name)\n        await self.accept()\n\n    async def disconnect(self, code):\n        await self.channel_layer.group_discard(\"tasks\", self.channel_name)\n\n    async def tasks_changed(self, event):\n        await self.send(text_data=\"changed\")\n\n\ndef tasks_changed():\n    async_to_sync(get_channel_layer().group_send)(\"tasks\", {\"type\": \"tasks.changed\"})\n";
        lines = [['AsyncWebsocketConsumer', 'The class that handles one WebSocket connection.'], ['group_add', 'Joins a named group, so one message can reach every browser.'], ['tasks_changed method', 'Runs when the group gets a <code>tasks.changed</code> message.'], ['async_to_sync', 'Calls async code from normal Django views.']];
        li.push({ file: 'config/asgi.py', lang: 'python', code: "import os\n\nfrom channels.routing import ProtocolTypeRouter, URLRouter\nfrom django.core.asgi import get_asgi_application\nfrom django.urls import path\n\nos.environ.setdefault(\"DJANGO_SETTINGS_MODULE\", \"config.settings\")\ndjango_app = get_asgi_application()\n\nfrom tasks.live import LiveConsumer  # noqa: E402\n\napplication = ProtocolTypeRouter({\n    \"http\": django_app,\n    \"websocket\": URLRouter([path(\"live\", LiveConsumer.as_asgi())]),\n})\n", lines: [['ProtocolTypeRouter', 'Sends normal requests to Django, and WebSockets to your consumer.'], ['get_asgi_application', 'Must run before importing your code, so Django is ready.']] });
      }
      if (a.transport === 'sse') {
        code = "import queue\n\nfrom django.http import StreamingHttpResponse\n\nlisteners = set()\n\n\ndef live(request):\n    waiting = queue.Queue()\n    listeners.add(waiting)\n\n    def events():\n        try:\n            yield \": connected\\n\\n\"\n            while True:\n                yield \"data: \" + waiting.get() + \"\\n\\n\"\n        finally:\n            listeners.discard(waiting)\n\n    response = StreamingHttpResponse(events(), content_type=\"text/event-stream\")\n    response[\"Cache-Control\"] = \"no-cache\"\n    return response\n\n\ndef tasks_changed():\n    for waiting in list(listeners):\n        waiting.put(\"changed\")\n";
        lines = [['StreamingHttpResponse', 'A response that keeps sending data over time.'], ['text/event-stream', 'Tells the browser this response carries events.'], ['queue.Queue', 'One waiting list per browser. <code>get</code> sleeps until there\'s news.'], ['finally', 'Runs when the browser disconnects, so the queue is removed.']];
        li.push({ warn: 'Each open connection holds a server thread, so run the production server below with many threads, in one process. Thousands of viewers call for a managed service.' });
      }
      if (a.transport === 'managed') {
        li.push({ p: 'Create a free <a href="https://ably.com/docs/getting-started">Ably</a> account and copy an API key.' }, { cmd: 'export ABLY_API_KEY=your-key', manual: true, lines: [['ABLY_API_KEY', 'Your secret key. It stays on the server.']] });
        code = "import os\n\nimport httpx\nfrom ably import AblyRest\nfrom asgiref.sync import async_to_sync\nfrom django.http import JsonResponse\n\nkey = os.environ.get(\"ABLY_API_KEY\", \"\")\n\n\ndef live_token(request):\n    token = async_to_sync(AblyRest(key).auth.create_token_request)({\"capability\": {\"tasks\": [\"subscribe\"]}})\n    return JsonResponse(token.to_dict())\n\n\ndef tasks_changed():\n    if not key:\n        return\n    name, secret = key.split(\":\", 1)\n    httpx.post(\"https://rest.ably.io/channels/tasks/messages\", auth=(name, secret), json={\"name\": \"changed\"}, timeout=5)\n";
        lines = [['create_token_request', 'Gives the browser a short-lived permission that can only subscribe, so your key stays secret.'], ['httpx.post', 'Publishes through Ably\'s REST API.']];
      }
      li.push({ file: 'tasks/live.py', lang: 'python', code: code, lines: lines });
      s.push({ id: 'live', title: 'Add live updates', items: li });
    }

    // Payments reuse the Python code, in this project's folder.
    if (a.payment) {
      var holder = [];
      Kit.py.paymentSection(a, holder);
      holder[0].items.forEach(function (it) {
        if (it.file === 'app/checkout.py') it.file = 'tasks/checkout.py';
        if (it.file === 'tests/test_checkout.py') { it.file = 'tasks/test_checkout.py'; it.code = it.code.replace('from app.checkout', 'from tasks.checkout'); }
      });
      s.push(holder[0]);
    }

    // API
    if (isRest) {
      s.push({ id: 'api', title: 'Write the API', items: [{ file: 'tasks/authentication.py', lang: 'python', code: "from rest_framework.authentication import SessionAuthentication\n\n\nclass SessionAuthentication401(SessionAuthentication):\n    def authenticate_header(self, request):\n        return \"Session\"\n", lines: [['SessionAuthentication401', 'Makes logged-out API calls get a 401, which the frontend uses to go to the login page. The toolkit would otherwise send a 403.']] }, { file: 'tasks/api.py', lang: 'python', code: "from rest_framework import serializers\nfrom rest_framework.decorators import api_view\n" + (a.admin === 'react-admin' ? "from rest_framework.exceptions import PermissionDenied\n" : '') + "from rest_framework.response import Response\n\nfrom tasks.models import Task\n" + (a.transport ? "from tasks.live import tasks_changed\n" : '') + "\n\nclass TaskSerializer(serializers.ModelSerializer):\n    id = serializers.CharField(read_only=True)\n\n    class Meta:\n        model = Task\n        fields = [\"id\", \"title\", \"done\"]\n\n\n@api_view([\"GET\", \"POST\"])\ndef task_list(request):\n    if request.method == \"POST\":\n        serializer = TaskSerializer(data={\"title\": str(request.data.get(\"title\", \"\")).strip()})\n        serializer.is_valid(raise_exception=True)\n        serializer.save()" + notify.replace('\n    ', '\n        ') + "\n        return Response(serializer.data, status=201)\n    tasks = TaskSerializer(Task.objects.all(), many=True).data\n    headers = {\"Content-Range\": f\"tasks 0-{len(tasks)}/{len(tasks)}\", \"Access-Control-Expose-Headers\": \"Content-Range\"}\n    return Response(tasks, headers=headers)\n\n\n@api_view([\"GET\", \"PUT\"" + (a.admin === 'react-admin' ? ', "DELETE"' : '') + "])\ndef task_detail(request, task_id):\n    task = Task.objects.filter(pk=task_id).first()\n    if task is None:\n        return Response(status=404)\n" + (a.admin === 'react-admin' ? "    if request.method == \"DELETE\":\n        if not request.user.is_staff:\n            raise PermissionDenied()\n        task.delete()" + notify + "\n        return Response({\"id\": task_id})\n" : '') + "    if request.method == \"PUT\":\n        task.done = bool(request.data.get(\"done\"))\n        task.save()" + notify.replace('\n    ', '\n        ') + "\n    return Response(TaskSerializer(task).data)\n", lines: [
        ['ModelSerializer', 'Turns a task into JSON and checks incoming data against the model, including the 200-character limit.'],
        ['CharField(read_only=True)', 'Sends the ID as a string, so every database behaves the same.'],
        ['@api_view', 'Marks a function as an API endpoint for these HTTP methods.'],
        ['raise_exception=True', 'Sends a 400 response automatically if the data isn\'t valid.'],
        ['Content-Range', 'Tells clients how many rows exist. React-admin needs this.']
      ] }, { p: 'For an OpenAPI description of this API, add <a href="https://drf-spectacular.readthedocs.io/">drf-spectacular</a>, which generates one from these classes.' }] });
    }
    if (isGql) {
      s.push({ id: 'api', title: 'Write the API', items: [{ file: 'tasks/schema.py', lang: 'python', code: "import strawberry\n\nfrom tasks.models import Task\n" + (a.transport ? "from tasks.live import tasks_changed\n" : '') + "\n\n@strawberry.type\nclass TaskType:\n    id: strawberry.ID\n    title: str\n    done: bool\n\n\ndef to_type(task: Task) -> TaskType:\n    return TaskType(id=strawberry.ID(str(task.pk)), title=task.title, done=task.done)\n\n\n@strawberry.type\nclass Query:\n    @strawberry.field\n    def tasks(self) -> list[TaskType]:\n        return [to_type(t) for t in Task.objects.all()]\n\n\n@strawberry.type\nclass Mutation:\n    @strawberry.mutation\n    def add_task(self, title: str) -> TaskType:\n        task = Task.objects.create(title=title)" + notify.replace('\n    ', '\n        ') + "\n        return to_type(task)\n\n    @strawberry.mutation\n    def set_done(self, id: strawberry.ID, done: bool) -> bool:\n        Task.objects.filter(pk=id).update(done=done)" + notify.replace('\n    ', '\n        ') + "\n        return True\n\n\nschema = strawberry.Schema(Query, Mutation)\n", lines: [['@strawberry.type', 'Turns a class into a GraphQL type, using its type hints.'], ['@strawberry.mutation', 'Marks a field that changes data.'], ['Task.objects', 'Django\'s way to read and change rows.']] }] });
    }

    // Views
    var imports = [];
    if (login) imports.push('from django.conf import settings', 'from django.contrib.auth import ' + (own ? 'authenticate, ' : '') + 'get_user_model, login, logout');
    if (a.admin === 'in-app') imports.push('from django.contrib.auth.decorators import login_required');
    var http = [];
    if (a.admin === 'in-app') http.push('HttpResponseForbidden');
    if (templates) http.push('HttpResponse');
    if (login && templates) http.push('JsonResponse');
    if (login && !templates) http.push('JsonResponse');
    http = http.filter(function (x, i, l) { return l.indexOf(x) === i; }).sort();
    if (http.length) imports.push('from django.http import ' + http.join(', '));
    var shortcut = ['redirect'];
    if (templates || own || a.admin === 'in-app') shortcut.unshift('render');
    if (login || a.admin === 'in-app' || a.payment || templates) imports.push('from django.shortcuts import ' + shortcut.join(', '));
    if (spa && (login || a.payment)) imports.push('from django.views.decorators.csrf import csrf_exempt');
    if (a.admin === 'in-app' || templates || a.payment || login) imports.push('from django.views.decorators.http import require_POST');
    if (oidc) imports.unshift('import os', '');
    if (a.payment && !oidc) imports.unshift('import os', '');
    if (oidc) imports.push('from authlib.integrations.django_client import OAuth');
    if (templates || a.admin === 'in-app') imports.push('', 'from tasks.models import Task');
    if (a.payment) imports.push('from tasks.checkout import create_checkout');
    if (a.transport && (templates || a.admin === 'in-app')) imports.push('from tasks.live import tasks_changed');
    var code2 = imports.join('\n').replace(/^\n+/, '') + '\n';
    if (login) code2 += "\nUser = get_user_model()\n\n\ndef sign_in_as(request, email):\n    user, _ = User.objects.get_or_create(username=email, defaults={\"email\": email})\n    is_admin = email in settings.ADMIN_EMAILS\n    if user.is_staff != is_admin:\n        user.is_staff = user.is_superuser = is_admin\n        user.save()\n    login(request, user, backend=\"django.contrib.auth.backends.ModelBackend\")\n";
    if (own) code2 += "\n\ndef login_page(request):\n    if request.method == \"GET\":\n        return render(request, \"login.html\")\n    email = request.POST[\"email\"].lower()\n    user = authenticate(request, username=email, password=request.POST[\"password\"])\n    if user is None:\n        return render(request, \"login.html\", {\"error\": \"Wrong email or password.\"}, status=401)\n    sign_in_as(request, email)\n    return redirect(\"/\")\n\n\n@require_POST\ndef signup(request):\n    email = request.POST[\"email\"].lower()\n    password = request.POST[\"password\"]\n    if len(password) < 8 or User.objects.filter(username=email).exists():\n        return render(request, \"login.html\", {\"error\": \"That didn't work. Use 8 or more characters and an unused email.\"}, status=400)\n    User.objects.create_user(username=email, email=email, password=password)\n    sign_in_as(request, email)\n    return redirect(\"/\")\n";
    if (oidc) code2 += "\n\noauth = OAuth()\noauth.register(\n    \"provider\",\n    client_id=os.environ.get(\"OIDC_CLIENT_ID\"),\n    client_secret=os.environ.get(\"OIDC_CLIENT_SECRET\"),\n    server_metadata_url=os.environ.get(\"OIDC_ISSUER\", \"\").rstrip(\"/\") + \"/.well-known/openid-configuration\",\n    client_kwargs={\"scope\": \"openid email profile\"},\n)\n\n\ndef login_page(request):\n    return oauth.provider.authorize_redirect(request, request.build_absolute_uri(\"/auth/callback\"))\n\n\ndef auth_callback(request):\n    token = oauth.provider.authorize_access_token(request)\n    sign_in_as(request, token[\"userinfo\"][\"email\"].lower())\n    return redirect(\"/\")\n";
    if (login) code2 += "\n\n" + (spa ? "@csrf_exempt\n" : "") + "@require_POST\ndef log_out(request):\n    logout(request)\n    return redirect(\"/login\")\n";
    if (templates) {
      code2 += "\n\ndef list_part(request):\n    return render(request, \"list.html\", {\"tasks\": Task.objects.all()})\n\n\ndef home(request):\n" + (login ? "    if not request.user.is_authenticated:\n        return redirect(\"/login\")\n" : '') + "    return render(request, \"index.html\", {\"tasks\": Task.objects.all()})\n\n\ndef tasks_part(request):\n" + (login ? "    if not request.user.is_authenticated:\n        return JsonResponse({\"error\": \"Log in first\"}, status=401)\n" : '') + "    if request.method == \"POST\":\n        title = request.POST.get(\"title\", \"\").strip()\n        if title and len(title) <= 200:\n            Task.objects.create(title=title)" + notify.replace('\n    ', '\n            ') + "\n    return list_part(request)\n\n\n@require_POST\ndef toggle(request, task_id):\n" + (login ? "    if not request.user.is_authenticated:\n        return JsonResponse({\"error\": \"Log in first\"}, status=401)\n" : '') + "    Task.objects.filter(pk=task_id).update(done=request.POST.get(\"done\") == \"on\")" + notify + "\n    return list_part(request)\n";
    }
    if (a.admin === 'in-app') code2 += "\n\n@login_required(login_url=\"/login\")\ndef admin_page(request):\n    if not request.user.is_staff:\n        return HttpResponseForbidden()\n    return render(request, \"admin_page.html\", {\"tasks\": Task.objects.all()})\n\n\n@require_POST\n@login_required(login_url=\"/login\")\ndef admin_delete(request, task_id):\n    if not request.user.is_staff:\n        return HttpResponseForbidden()\n    Task.objects.filter(pk=task_id).delete()" + notify + "\n    return redirect(\"/admin\")\n";
    if (a.payment) code2 += "\n\n" + (spa ? "@csrf_exempt\n" : "") + "@require_POST\ndef checkout(request):\n" + (login ? "    if not request.user.is_authenticated:\n        return redirect(\"/login\")\n" : '') + "    base_url = os.environ.get(\"PUBLIC_URL\", request.build_absolute_uri(\"/\").rstrip(\"/\"))\n    return redirect(create_checkout(base_url))\n";
    var viewsLines = [];
    if (spa && (login || a.payment)) viewsLines.push(['@csrf_exempt', 'Your frontend sends this as a plain form, which has no CSRF token. That is safe here because session cookies aren\'t sent with posts from other sites, and other changes still need the token.']);
    if (login) viewsLines.push(['sign_in_as', 'Logs the user in, and treats the emails in <code>ADMIN_EMAILS</code> as staff. Django\'s own admin also uses that flag.'], ['log_out', 'Ends the session. It only accepts POST, so other sites can\'t log someone out with a link.']);
    if (own) viewsLines.push(['authenticate', 'Checks the password against Django\'s stored hash.'], ['create_user', 'Creates an account, and hashes the password for you.']);
    if (oidc) viewsLines.push(['server_metadata_url', 'A standard address where the provider publishes its login and token URLs.'], ['authorize_redirect', 'Sends the visitor to your provider\'s login page.'], ['authorize_access_token', 'Handles the return from the provider, checks the response and gets the user\'s details.']);
    if (templates) viewsLines.push(['render', 'Fills in a template and returns the HTML.'], ['list_part', 'Returns only the list, because htmx swaps just that part of the page.'], ['request.POST', 'Reads a posted form. A checked checkbox sends <code>on</code>, and an unchecked one sends nothing.']);
    if (a.admin === 'in-app') viewsLines.push(['is_staff', 'The check runs on the server. Hiding a link isn\'t protection, because anyone can type a URL.']);
    if (a.payment) viewsLines.push(['PUBLIC_URL', 'Your site\'s real address. Set this in production, because the <code>Host</code> header can be forged.']);
    var hasViews = login || templates || a.admin === 'in-app' || a.payment;
    var appItems = [];
    if (hasViews) appItems.push({ file: 'tasks/views.py', lang: 'python', code: code2, lines: viewsLines });

    var urlImports = ['from django.urls import path'];
    var urls = [];
    if (a.admin === 'django-admin') { urlImports.unshift('from django.contrib import admin'); urls.push('path("django-admin/", admin.site.urls)'); }
    if (hasViews) urlImports.push('from tasks import views');
    if (isRest) { urlImports.push('from tasks import api'); urls.push('path("api/tasks", api.task_list)', 'path("api/tasks/<str:task_id>", api.task_detail)'); }
    if (isGql) { urlImports.unshift('from django.http import JsonResponse', 'from django.views.decorators.csrf import csrf_exempt'); urlImports.push('from strawberry.django.views import GraphQLView', 'from tasks.schema import schema'); urls.push('path("graphql", graphql)'); }
    if (a.transport === 'sse') { urlImports.push('from tasks.live import live'); urls.push('path("api/live", live)'); }
    if (a.transport === 'managed') { urlImports.push('from tasks.live import live_token'); urls.push('path("api/live-token", live_token)'); }
    if (own) urls.push('path("login", views.login_page)', 'path("signup", views.signup)');
    if (oidc) urls.push('path("login", views.login_page)', 'path("auth/callback", views.auth_callback)');
    if (login) urls.push('path("logout", views.log_out)');
    if (templates) urls.push('path("", views.home)', 'path("tasks", views.tasks_part)', 'path("tasks/<str:task_id>/toggle", views.toggle)');
    if (a.admin === 'in-app') urls.push('path("admin", views.admin_page)', 'path("admin/tasks/<str:task_id>/delete", views.admin_delete)');
    if (a.payment) urls.push('path("api/checkout", views.checkout)');
    var gql = isGql ? "\ngraphql_view = GraphQLView.as_view(schema=schema)\n\n\n@csrf_exempt\ndef graphql(request, *args, **kwargs):\n" + (login ? "    if not request.user.is_authenticated:\n        return JsonResponse({\"error\": \"Log in first\"}, status=401)\n" : '') + "    return graphql_view(request, *args, **kwargs)\n\n" : '';
    appItems.push({ file: 'config/urls.py', lang: 'python', code: urlImports.sort(function (x, y) { return x.split(' ')[1] < y.split(' ')[1] ? -1 : 1; }).join('\n') + "\n" + gql + "\nurlpatterns = [\n    " + urls.join(',\n    ') + ",\n]\n", lines: [['urlpatterns', 'Maps each URL to the code that answers it.'], ['<str:task_id>', 'A variable part of the URL, passed to the function.']].concat(a.admin === 'django-admin' ? [['django-admin/', 'Django\'s built-in admin.']] : []).concat(isGql ? [['csrf_exempt', 'GraphQL sends JSON, not forms, so it skips the form token. The session cookie\'s <code>SameSite=Lax</code> default stops other sites from sending it with cross-site posts.']] : []) });
    s.push({ id: 'app', title: 'Write the app', items: appItems });

    // Templates
    if (templates || a.admin === 'in-app') {
      var t = [];
      if (templates) {
        var liveScript = a.transport === 'sse' ? "<script>new EventSource('/api/live').onmessage = () => htmx.trigger('#list', 'reload');</script>\n" : a.transport === 'websocket' ? "<script>\n  const scheme = location.protocol === 'https:' ? 'wss://' : 'ws://';\n  new WebSocket(scheme + location.host + '/live').onmessage = () => htmx.trigger('#list', 'reload');\n</script>\n" : a.transport === 'managed' ? "<script src=\"https://cdn.ably.com/lib/ably.min-2.js\"></script>\n<script>\n  new Ably.Realtime({ authUrl: '/api/live-token' }).channels.get('tasks').subscribe(() => htmx.trigger('#list', 'reload'));\n</script>\n" : '';
        t.push({ file: 'tasks/templates/index.html', lang: 'html', code: "<!doctype html>\n<html lang=\"en\">\n<meta charset=\"utf-8\">\n<title>Tasks</title>\n<script src=\"https://unpkg.com/htmx.org@2.0.11\"></script>\n<body hx-headers='{\"X-CSRFToken\": \"{{ csrf_token }}\"}'>\n<h1>Tasks</h1>\n" + (login ? "<form method=\"post\" action=\"/logout\">{% csrf_token %}<button>Log out</button></form>\n" : '') + (a.payment ? "<form method=\"post\" action=\"/api/checkout\">{% csrf_token %}<button>Buy example product</button></form>\n" : '') + "<form hx-post=\"/tasks\" hx-target=\"#list\" hx-on::after-request=\"this.reset()\">\n  <input name=\"title\" maxlength=\"200\" required>\n  <button>Add</button>\n</form>\n<div id=\"list\" hx-get=\"/tasks\" hx-trigger=\"reload\">{% include \"list.html\" %}</div>\n" + liveScript + "</body>\n</html>\n", lines: [['htmx', 'A small library that lets HTML attributes make requests and update part of the page.'], ['hx-headers', 'Sends Django\'s CSRF token with every htmx request.'], ['hx-post', 'Submits the form to this URL without reloading the page.'], ['hx-target', 'Replaces this element with the response.'], ['{% include %}', 'Inserts another template.']] });
        t.push({ file: 'tasks/templates/list.html', lang: 'html', code: "<ul>\n  {% for task in tasks %}\n    <li>\n      <label>\n        <input type=\"checkbox\" name=\"done\" {% if task.done %}checked{% endif %} hx-post=\"/tasks/{{ task.pk }}/toggle\" hx-target=\"#list\">\n        {{ task.title }}\n      </label>\n    </li>\n  {% endfor %}\n</ul>\n", lines: [['{% for %}', 'Repeats the row per task.'], ['{{ task.title }}', 'Prints the value and escapes it, so a title can\'t inject HTML or scripts.']] });
      }
      if (a.admin === 'in-app') t.push({ file: 'tasks/templates/admin_page.html', lang: 'html', code: "<!doctype html>\n<html lang=\"en\">\n<meta charset=\"utf-8\">\n<title>Admin</title>\n<h1>Admin: all tasks</h1>\n<table>\n  {% for task in tasks %}\n    <tr>\n      <td>{{ task.title }}</td>\n      <td>{% if task.done %}Done{% else %}Open{% endif %}</td>\n      <td><form method=\"post\" action=\"/admin/tasks/{{ task.pk }}/delete\">{% csrf_token %}<button>Delete</button></form></td>\n    </tr>\n  {% endfor %}\n</table>\n</html>\n", lines: [['form method="post"', 'Deleting uses POST, so a link or a search engine can\'t trigger it.'], ['{% csrf_token %}', 'Proves the form came from your own site.']] });
      s.push({ id: 'views', title: templates ? 'Write the pages' : 'Write the admin page', items: t });
    }
    if (spa) s.push({ id: 'frontend', title: 'Build the frontend', items: Kit.spaItems(a, 8000) });
    if (a.admin === 'django-admin') s.push({ id: 'admin', title: 'Turn on the admin', items: [
      { file: 'tasks/admin.py', lang: 'python', code: "from django.contrib import admin\n\nfrom tasks.models import Task\n\n\n@admin.register(Task)\nclass TaskAdmin(admin.ModelAdmin):\n    list_display = [\"title\", \"done\"]\n    list_filter = [\"done\"]\n    search_fields = [\"title\"]\n", lines: [['@admin.register', 'Adds this table to Django\'s admin.'], ['list_display', 'The columns in the list.'], ['list_filter and search_fields', 'Add a filter and a search box.']] },
      { p: 'Sign in at <code>/django-admin/</code>. Accounts in <code>ADMIN_EMAILS</code> get access when they log in through the app. You can also make one directly:' },
      { cmd: 'python manage.py createsuperuser', manual: true, lines: [['createsuperuser', 'Asks for a username and password for a full administrator.']] }
    ] });
    if (a.admin === 'react-admin') {
      var ra = Kit.reactAdminItems(a, 8000);
      ra.forEach(function (it) {
        if (it.file === 'admin/src/App.tsx') {
          it.code = it.code.replace("import simpleRestProvider from 'ra-data-simple-rest';", "import { fetchUtils } from 'react-admin';\nimport simpleRestProvider from 'ra-data-simple-rest';").replace("const dataProvider = simpleRestProvider('/api');", "const csrf = () => document.cookie.match(/csrftoken=([^;]+)/)?.[1] ?? '';\nconst httpClient = (url: string, options: fetchUtils.Options = {}) => {\n  const headers = new Headers(options.headers);\n  headers.set('X-CSRFToken', csrf());\n  return fetchUtils.fetchJson(url, { ...options, headers });\n};\n\nconst dataProvider = simpleRestProvider('/api', httpClient);");
          it.lines = it.lines.concat([['httpClient', 'Adds Django\'s CSRF token to each request. Django rejects logged-in changes without it.']]);
        }
      });
      s.push({ id: 'admin', title: 'Add the admin app', items: ra });
    }
    if (a.admin === 'low-code') s.push({ id: 'admin', title: 'Add the admin tool', items: Kit.lowCodeItems(a) });

    // Tests
    var test = "import pytest\n" + (flyway ? "from django.db import connection\n" : '') + "\nfrom tasks.models import Task\n\npytestmark = pytest.mark.django_db\n" + (flyway ? "\n\n@pytest.fixture(autouse=True)\ndef tasks_table(django_db_setup, django_db_blocker):\n    # Flyway owns this table, so the test database needs it created here.\n    with django_db_blocker.unblock():\n        if \"tasks\" not in connection.introspection.table_names():\n            with connection.cursor() as cursor:\n                cursor.execute(\"\"\"" + Kit.ddlTasks(a.database).replace(/\n/g, " ").replace(/;\s*$/, "") + "\"\"\")\n" : '') + "\n\ndef test_model_saves_and_changes_a_task():\n    task = Task.objects.create(title=\"From the test\")\n    task.done = True\n    task.save()\n    assert Task.objects.get(pk=task.pk).done is True\n";
    if (login) {
      var probe = isRest ? '"/api/tasks"' : isGql ? '"/graphql"' : templates ? '"/tasks"' : null;
      if (probe) test += "\n\ndef test_logged_out_visitors_are_blocked(client):\n    assert client.post(" + probe + ", {\"title\": \"x\"}, content_type=\"application/json\").status_code == 401\n";
      if (own) test += "\n\ndef test_sign_up_log_out_and_log_in(client):\n    details = {\"email\": \"person@example.com\", \"password\": \"long enough password\"}\n    assert client.post(\"/signup\", details).status_code == 302\n    assert client.post(\"/logout\").status_code == 302\n    assert client.post(\"/login\", {**details, \"password\": \"wrong password here\"}).status_code == 401\n    assert client.post(\"/login\", details).status_code == 302\n";
    } else if (isRest) {
      test += "\n\ndef test_rest_api_adds_changes_and_lists_tasks(client):\n    created = client.post(\"/api/tasks\", {\"title\": \"Through the API\"}, content_type=\"application/json\")\n    assert created.status_code == 201\n    task = created.json()\n    changed = client.put(\"/api/tasks/\" + task[\"id\"], {\"done\": True}, content_type=\"application/json\")\n    assert changed.json()[\"done\"] is True\n    listed = client.get(\"/api/tasks\")\n    assert \"Content-Range\" in listed.headers\n    assert any(t[\"id\"] == task[\"id\"] for t in listed.json())\n\n\ndef test_empty_title_is_rejected(client):\n    assert client.post(\"/api/tasks\", {\"title\": \" \"}, content_type=\"application/json\").status_code == 400\n";
    } else if (isGql) {
      test += "\n\ndef test_graphql_adds_and_lists_tasks(client):\n    added = client.post(\"/graphql\", {\"query\": 'mutation { addTask(title: \"Through GraphQL\") { id } }'}, content_type=\"application/json\").json()\n    assert added[\"data\"][\"addTask\"][\"id\"]\n    listed = client.post(\"/graphql\", {\"query\": \"{ tasks { id title done } }\"}, content_type=\"application/json\").json()\n    assert any(t[\"title\"] == \"Through GraphQL\" for t in listed[\"data\"][\"tasks\"])\n";
    }
    if (templates && !login) test += "\n\ndef test_page_shows_tasks_and_escapes_titles(client):\n    client.post(\"/tasks\", {\"title\": \"<b>From a form</b>\"})\n    assert \"&lt;b&gt;From a form&lt;/b&gt;\" in client.get(\"/\").content.decode()\n";
    if (a.admin === 'in-app') test += "\n\ndef test_admin_page_needs_a_login(client):\n    assert client.get(\"/admin\").status_code == 302\n";
    s.push({ id: 'test', title: 'Test it', items: [
      { file: 'pytest.ini', lang: 'text', code: "[pytest]\nDJANGO_SETTINGS_MODULE = config.settings\n", lines: [['DJANGO_SETTINGS_MODULE', 'Tells pytest-django which settings to load.']] },
      { file: 'tasks/test_app.py', lang: 'python', code: test, lines: [['django_db', 'Lets tests use the database. pytest-django creates a separate test database, so your data is safe.'], ['client', 'A fake browser that calls your app directly. It keeps cookies between requests.'], ['assert', 'Fails the test if this isn\'t true.']] },
      { cmd: 'python -m pytest -q', lines: [['python -m pytest', 'Runs every <code>test_*.py</code> file.'], ['-q', 'Shorter output.']] },
      { p: 'Then start it with the command below and open <code>http://localhost:8000</code>.' + (spa ? ' For the frontend, also run <code>npm run dev</code> inside <code>web</code>, and open the address it prints.' : '') },
      { cmd: 'python manage.py runserver 8000', manual: true, lines: [['runserver', 'Starts a development server that reloads when you save a file. Press Ctrl+C to stop it.']] }
    ] });

    var envList = ['SECRET_KEY', 'ALLOWED_HOSTS', 'DATABASE_URL'];
    if (login) envList.push('HTTPS_ONLY', 'ADMIN_EMAILS');
    if (oidc) envList.push('OIDC_ISSUER', 'OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET');
    if (a.transport === 'managed') envList.push('ABLY_API_KEY');
    if (a.payment) { envList.push('PUBLIC_URL'); Kit.PAYMENT[a.payment].env.forEach(function (e) { envList.push(e[0]); }); }
    var spaBuild = spa ? "FROM node:24-slim AS frontend\nWORKDIR /web\nCOPY web/package*.json ./\nRUN npm ci\nCOPY web/ ./\nRUN npm run build\n\n" : '';
    var run = channels ? '"daphne", "-b", "0.0.0.0", "-p", "8000", "config.asgi:application"' : a.transport === 'sse' ? '"gunicorn", "--threads", "100", "--bind", "0.0.0.0:8000", "config.wsgi:application"' : '"gunicorn", "--workers", "2", "--bind", "0.0.0.0:8000", "config.wsgi:application"';
    var docker = spaBuild + "FROM python:3.13-slim\nWORKDIR /app\n" + (a.database === 'mysql' ? "RUN apt-get update && apt-get install -y --no-install-recommends gcc pkg-config default-libmysqlclient-dev && rm -rf /var/lib/apt/lists/*\n" : '') + "COPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .\n" + (spa ? "COPY --from=frontend /web/dist ./web/dist\n" : '') + "RUN SECRET_KEY=only-for-this-build python manage.py collectstatic --noinput\nRUN useradd --create-home app\nUSER app\nEXPOSE 8000\nCMD [" + run + "]\n";
    var deploy = [{ p: 'Django\'s own server is only for development.' + (channels ? ' Daphne, which you already installed, runs in production.' : ' Add Gunicorn, a production server.') + ' Record the exact library versions, so the server installs the same ones:' }, { cmd: (channels ? '' : 'pip install gunicorn\n') + 'pip freeze > requirements.txt', lines: (channels ? [] : [['gunicorn', 'A production server. It runs on Linux, which is what the container below uses, so it won\'t start on Windows itself.']]).concat([['pip freeze', 'Lists every installed library and its version.']]) }, { p: 'Don\'t set <code>DEBUG</code> in production.' }];
    var hosting = Kit.hostingItems(a, { port: 8000, env: envList, dockerfile: docker, dockerignore: '.venv\n__pycache__\nweb/node_modules\nweb/dist\nadmin/node_modules\nstaticfiles\n.git\n.env\n*.db\n', dockerLines: [
      ['python:3.13-slim', 'A small official image with Python.']
    ].concat(a.database === 'mysql' ? [['apt-get install', 'The MySQL driver needs these to build on Linux.']] : []).concat(spa ? [['AS frontend', 'A first stage builds the frontend, and only its finished files are copied into the final image.']] : []).concat([
      ['collectstatic', 'Gathers static files, such as the admin\'s styles. It only needs a placeholder secret here.'],
      ['useradd and USER', 'Runs as a limited user rather than as root.'],
      ['CMD', 'Starts the production server.' + (a.transport === 'sse' ? ' Many threads in one process keep live connections open, and let them all hear about changes.' : '')]
    ]) });
    s.push({ id: 'deploy', title: 'Deploy it', items: deploy.concat(hosting).concat(a.migrations === 'django-migrations' && a.database !== 'mongodb' ? [{ p: 'Before each new version starts, run this against the production database:' }, { cmd: 'python manage.py migrate', manual: true, lines: [['migrate', 'Runs any migrations that haven\'t run yet.']] }] : []) });
    return s;
  }
  Kit.frameworks.django = django;
})(StackKit);
