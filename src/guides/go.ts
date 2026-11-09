// @ts-nocheck -- moved from the single-file page; types are added module by module.
import { StackKit } from '../stack-kit';

// Guides for Go: Gin, Echo and the standard library. The three share everything except how a handler looks.
(function (Kit) {
  function L() { return Array.prototype.join.call(arguments, '\n') + '\n'; }

  // Builds a sorted import block, with the standard library first, as gofmt and goimports expect.
  function imports(list) {
    var seen = {}, std = [], other = [];
    list.forEach(function (x) { if (x && !seen[x]) { seen[x] = true; (/^(_ |\w+ )?"[^./"]+(\/[^."]*)*"$/.test(x) && x.indexOf('demo/') < 0 ? std : other).push(x); } });
    var key = function (x) { return x.slice(x.indexOf('"')); };
    var by = function (p, q) { return key(p) < key(q) ? -1 : 1; };
    std.sort(by); other.sort(by);
    var lines = std.map(function (x) { return '\t' + x; });
    if (std.length && other.length) lines.push('');
    other.forEach(function (x) { lines.push('\t' + x); });
    return 'import (\n' + lines.join('\n') + '\n)\n';
  }

  // How each framework writes the same few things. Handlers below are written once, using these.
  var FW = {
    nethttp: {
      name: 'the standard library', sig: 'w http.ResponseWriter, r *http.Request', req: 'r', res: 'w', imp: [],
      param: function (n) { return 'r.PathValue("' + n + '")'; },
      form: function (n) { return 'r.FormValue("' + n + '")'; },
      header: function (k, v) { return 'w.Header().Set(' + k + ', ' + v + ')'; },
      json: function (s, v) { return 'writeJSON(w, ' + s + ', ' + v + ')\n\treturn'; },
      redirect: function (s, u) { return 'http.Redirect(w, r, ' + u + ', ' + s + ')\n\treturn'; },
      page: function (n, d) { return 'render(w, "' + n + '", ' + d + ')\n\treturn'; },
      fail: 'fail(w, r, err)\n\treturn', bind: 'json.NewDecoder(r.Body).Decode(&body)'
    },
    gin: {
      name: 'Gin', sig: 'c *gin.Context', req: 'c.Request', res: 'c.Writer', imp: ['"github.com/gin-gonic/gin"'],
      param: function (n) { return 'c.Param("' + n + '")'; },
      form: function (n) { return 'c.PostForm("' + n + '")'; },
      header: function (k, v) { return 'c.Header(' + k + ', ' + v + ')'; },
      json: function (s, v) { return 'c.JSON(' + s + ', ' + v + ')\n\treturn'; },
      redirect: function (s, u) { return 'c.Redirect(' + s + ', ' + u + ')\n\treturn'; },
      page: function (n, d) { return 'render(c.Writer, "' + n + '", ' + d + ')\n\treturn'; },
      fail: 'fail(c.Writer, c.Request, err)\n\treturn', bind: 'c.ShouldBindJSON(&body)'
    },
    echo: {
      name: 'Echo', sig: 'c *echo.Context', ret: ' error', req: 'c.Request()', res: 'c.Response()', imp: ['"github.com/labstack/echo/v5"'],
      param: function (n) { return 'c.Param("' + n + '")'; },
      form: function (n) { return 'c.FormValue("' + n + '")'; },
      header: function (k, v) { return 'c.Response().Header().Set(' + k + ', ' + v + ')'; },
      json: function (s, v) { return 'return c.JSON(' + s + ', ' + v + ')'; },
      redirect: function (s, u) { return 'return c.Redirect(' + s + ', ' + u + ')'; },
      page: function (n, d) { return 'return render(c.Response(), "' + n + '", ' + d + ')'; },
      fail: 'return err', bind: 'c.Bind(&body)'
    }
  };

  function handler(f, name, body) {
    // A final bare return adds nothing, so it's dropped to keep the code tidy.
    var clean = body.replace(/\n\treturn\s*$/, '').replace(/\n\t\treturn\n\t}\n$/, '\n\t\treturn\n\t}\n');
    return 'func ' + name + '(' + f.sig + ')' + (f.ret || '') + ' {\n\t' + clean.replace(/\s+$/, '') + '\n}\n';
  }

  // ---------- Connection details ----------
  var DRIVER = {
    postgresql: ['_ "github.com/jackc/pgx/v5/stdlib"', 'pgx', 'github.com/jackc/pgx/v5'],
    mysql: ['_ "github.com/go-sql-driver/mysql"', 'mysql', 'github.com/go-sql-driver/mysql'],
    sqlserver: ['_ "github.com/microsoft/go-mssqldb"', 'sqlserver', 'github.com/microsoft/go-mssqldb'],
    sqlite: ['_ "modernc.org/sqlite"', 'sqlite', 'modernc.org/sqlite']
  };
  var URL_GO = {
    postgresql: 'postgres://postgres:your-password@localhost:5432/demo?sslmode=disable',
    mysql: 'root:your-password@tcp(localhost:3306)/demo?parseTime=true',
    sqlserver: 'sqlserver://sa:your-password@localhost:1433?database=demo',
    sqlite: 'demo.db',
    mongodb: 'mongodb://localhost:27017/demo'
  };
  var URL_ATLAS = {
    postgresql: 'postgres://postgres:your-password@localhost:5432/demo?sslmode=disable',
    mysql: 'mysql://root:your-password@localhost:3306/demo',
    sqlserver: 'sqlserver://sa:your-password@localhost:1433?database=demo',
    sqlite: 'sqlite://demo.db'
  };

  function envItem(a) {
    var lines = [['DATABASE_URL', 'Where the database is, including its password. Reading it from the environment keeps secrets out of your code.'], ['export', 'Applies to this terminal and the programs it starts, so set it again in a new terminal.']];
    if (a.database === 'mysql') lines.push(['parseTime=true', 'The MySQL driver\'s own address format, which also turns dates into Go times.']);
    if (a.database === 'postgresql') lines.push(['sslmode=disable', 'Turns off encryption, which a database on your own machine usually doesn\'t use. Don\'t copy this to production.']);
    return { cmd: 'export DATABASE_URL="' + URL_GO[a.database] + '"', manual: true, lines: lines };
  }

  var COMMON = L(
    'package tasks',
    '',
    '// Task is the shape of one task everywhere else in the app.',
    'type Task struct {',
    '\tID    string `json:"id"`',
    '\tTitle string `json:"title"`',
    '\tDone  bool   `json:"done"`',
    '}');
  var COMMON_LINES = [
    ['package tasks', 'Every folder is a package. This one holds all database code, so changing library later only touches this folder.'],
    ['ID string', 'IDs are text outside this package, so the rest of the app doesn\'t depend on how the database numbers rows.'],
    ['`json:"id"`', 'The name this field gets in JSON. Capitalized fields are public in Go, while JSON names are usually lowercase.']
  ];
  var API_LINES = [
    ['context.Context', 'Carries the request\'s deadline and cancellation, so a query stops if the visitor goes away.'],
    ['error', 'Go has no exceptions. Functions return an error alongside the result, and the caller checks it.']
  ];

  // ---------- Data libraries: each writes tasks/store.go with the same functions ----------
  function dataItems(a, own) {
    var db = a.database;
    var items = [{ file: 'tasks/tasks.go', lang: 'go', code: COMMON, lines: COMMON_LINES }];
    if (db === 'mongodb') {
      items.push({ cmd: 'go get go.mongodb.org/mongo-driver/v2/mongo', lines: [['mongo-driver', 'MongoDB\'s official driver.']] });
      items.push({ file: 'tasks/store.go', lang: 'go', code: imports(['"context"', '"errors"', '"net/url"', '"strings"', '"go.mongodb.org/mongo-driver/v2/bson"', '"go.mongodb.org/mongo-driver/v2/mongo"', '"go.mongodb.org/mongo-driver/v2/mongo/options"']).replace(/^/, 'package tasks\n\n') + "\nvar (\n\tclient     *mongo.Client\n\tcollection *mongo.Collection\n" + (own ? "\tusers      *mongo.Collection\n" : '') + ")\n\ntype document struct {\n\tID    bson.ObjectID `bson:\"_id,omitempty\"`\n\tTitle string        `bson:\"title\"`\n\tDone  bool          `bson:\"done\"`\n}\n\nfunc Open(address string) error {\n\tparsed, err := url.Parse(address)\n\tif err != nil {\n\t\treturn err\n\t}\n\tclient, err = mongo.Connect(options.Client().ApplyURI(address))\n\tif err != nil {\n\t\treturn err\n\t}\n\tdatabase := client.Database(strings.TrimPrefix(parsed.Path, \"/\"))\n\tcollection = database.Collection(\"tasks\")\n" + (own ? "\tusers = database.Collection(\"users\")\n\t_, err = users.Indexes().CreateOne(context.Background(), mongo.IndexModel{Keys: bson.D{{Key: \"email\", Value: 1}}, Options: options.Index().SetUnique(true)})\n\treturn err\n" : "\treturn nil\n") + "}\n\nfunc Close() {\n\t_ = client.Disconnect(context.Background())\n}\n\nfunc List(ctx context.Context) ([]Task, error) {\n\tcursor, err := collection.Find(ctx, bson.D{}, options.Find().SetSort(bson.D{{Key: \"_id\", Value: 1}}))\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\tvar docs []document\n\tif err := cursor.All(ctx, &docs); err != nil {\n\t\treturn nil, err\n\t}\n\tlist := []Task{}\n\tfor _, doc := range docs {\n\t\tlist = append(list, Task{ID: doc.ID.Hex(), Title: doc.Title, Done: doc.Done})\n\t}\n\treturn list, nil\n}\n\nfunc Add(ctx context.Context, title string) (Task, error) {\n\tresult, err := collection.InsertOne(ctx, document{Title: title})\n\tif err != nil {\n\t\treturn Task{}, err\n\t}\n\tid, ok := result.InsertedID.(bson.ObjectID)\n\tif !ok {\n\t\treturn Task{}, errors.New(\"unexpected ID type\")\n\t}\n\treturn Task{ID: id.Hex(), Title: title}, nil\n}\n\nfunc SetDone(ctx context.Context, id string, done bool) error {\n\tobjectID, err := bson.ObjectIDFromHex(id)\n\tif err != nil {\n\t\treturn nil\n\t}\n\t_, err = collection.UpdateOne(ctx, bson.D{{Key: \"_id\", Value: objectID}}, bson.D{{Key: \"$set\", Value: bson.D{{Key: \"done\", Value: done}}}})\n\treturn err\n}\n\nfunc Delete(ctx context.Context, id string) error {\n\tobjectID, err := bson.ObjectIDFromHex(id)\n\tif err != nil {\n\t\treturn nil\n\t}\n\t_, err = collection.DeleteOne(ctx, bson.D{{Key: \"_id\", Value: objectID}})\n\treturn err\n}\n" + (own ? "\ntype userDoc struct {\n\tEmail        string `bson:\"email\"`\n\tPasswordHash string `bson:\"password_hash\"`\n}\n\nfunc FindPasswordHash(ctx context.Context, email string) (string, error) {\n\tvar user userDoc\n\terr := users.FindOne(ctx, bson.D{{Key: \"email\", Value: email}}).Decode(&user)\n\tif errors.Is(err, mongo.ErrNoDocuments) {\n\t\treturn \"\", nil\n\t}\n\treturn user.PasswordHash, err\n}\n\nfunc AddUser(ctx context.Context, email, hash string) error {\n\t_, err := users.InsertOne(ctx, userDoc{Email: email, PasswordHash: hash})\n\treturn err\n}\n" : ''), lines: API_LINES.concat([
        ['url.Parse', 'Reads the database name out of the address.'],
        ['collection', 'MongoDB\'s equivalent of a table. It\'s created on first use.'],
        ['bson.ObjectID', 'MongoDB\'s ID type. URLs carry it as text, so it\'s converted here.'],
        ['$set', 'Changes only the listed field.']
      ]).concat(own ? [['SetUnique', 'Stops two accounts from using the same email.']] : []) });
      return items;
    }
    if (a.data === 'gorm') {
      var gd = { postgresql: ['gorm.io/driver/postgres', 'postgres'], mysql: ['gorm.io/driver/mysql', 'mysql'], sqlserver: ['gorm.io/driver/sqlserver', 'sqlserver'], sqlite: ['github.com/glebarez/sqlite', 'sqlite'] }[db];
      items.push({ cmd: 'go get gorm.io/gorm ' + gd[0], lines: [['gorm.io/gorm', 'The ORM.'], [gd[0], db === 'sqlite' ? 'A SQLite driver written entirely in Go, recommended in GORM\'s docs. It needs no C compiler, unlike the default driver.' : 'Connects GORM to your database.']] });
      items.push({ file: 'tasks/store.go', lang: 'go', code: 'package tasks\n\n' + imports(['"context"', '"errors"', '"strconv"', '"' + gd[0] + '"', '"gorm.io/gorm"']).replace(own ? '' : '\t"errors"\n', '') + "\nvar db *gorm.DB\n\ntype taskRow struct {\n\tID    int `gorm:\"primaryKey\"`\n\tTitle string\n\tDone  bool\n}\n\nfunc (taskRow) TableName() string { return \"tasks\" }\n\nfunc toTask(row taskRow) Task {\n\treturn Task{ID: strconv.Itoa(row.ID), Title: row.Title, Done: row.Done}\n}\n\nfunc Open(address string) (err error) {\n\tdb, err = gorm.Open(" + gd[1] + ".Open(address), &gorm.Config{})\n\treturn err\n}\n\nfunc Close() {\n\tif conn, err := db.DB(); err == nil {\n\t\t_ = conn.Close()\n\t}\n}\n\nfunc List(ctx context.Context) ([]Task, error) {\n\tvar rows []taskRow\n\tif err := db.WithContext(ctx).Order(\"id\").Find(&rows).Error; err != nil {\n\t\treturn nil, err\n\t}\n\tlist := []Task{}\n\tfor _, row := range rows {\n\t\tlist = append(list, toTask(row))\n\t}\n\treturn list, nil\n}\n\nfunc Add(ctx context.Context, title string) (Task, error) {\n\trow := taskRow{Title: title}\n\terr := db.WithContext(ctx).Create(&row).Error\n\treturn toTask(row), err\n}\n\nfunc SetDone(ctx context.Context, id string, done bool) error {\n\tnumber, err := strconv.Atoi(id)\n\tif err != nil {\n\t\treturn nil\n\t}\n\treturn db.WithContext(ctx).Model(&taskRow{}).Where(\"id = ?\", number).Update(\"done\", done).Error\n}\n\nfunc Delete(ctx context.Context, id string) error {\n\tnumber, err := strconv.Atoi(id)\n\tif err != nil {\n\t\treturn nil\n\t}\n\treturn db.WithContext(ctx).Delete(&taskRow{}, number).Error\n}\n" + (own ? "\ntype userRow struct {\n\tID           int `gorm:\"primaryKey\"`\n\tEmail        string\n\tPasswordHash string\n}\n\nfunc (userRow) TableName() string { return \"users\" }\n\nfunc FindPasswordHash(ctx context.Context, email string) (string, error) {\n\tvar user userRow\n\terr := db.WithContext(ctx).Where(\"email = ?\", email).First(&user).Error\n\tif errors.Is(err, gorm.ErrRecordNotFound) {\n\t\treturn \"\", nil\n\t}\n\treturn user.PasswordHash, err\n}\n\nfunc AddUser(ctx context.Context, email, hash string) error {\n\treturn db.WithContext(ctx).Create(&userRow{Email: email, PasswordHash: hash}).Error\n}\n" : ''), lines: API_LINES.concat([
        ['taskRow', 'Describes one row. GORM matches fields to columns by name.'],
        ['TableName', 'Tells GORM which table this is.'],
        ['strconv.Atoi', 'Turns text into a number. A value that isn\'t a number can\'t be any task, so it does nothing.'],
        ['Where("id = ?"', 'Passes the value separately from the SQL, which prevents SQL injection.']
      ]) });
      return items;
    }
    if (a.data === 'ent') {
      var dialect = { postgresql: 'dialect.Postgres', mysql: 'dialect.MySQL', sqlite: 'dialect.SQLite' }[db];
      var d = DRIVER[db];
      items.push({ cmd: 'go get entgo.io/ent golang.org/x/tools@latest ' + d[2] + '\ngo run -mod=mod entgo.io/ent/cmd/ent new Task' + (own ? ' User' : ''), lines: [['golang.org/x/tools@latest', 'Ent\'s code generator reads your code with this library, and older versions can\'t read code built by newer Go versions.'], ['entgo.io/ent', 'The entity framework: you describe your data in Go, and it generates typed code.'], [d[2], 'The database driver it uses.'], ['ent new', 'Creates starter files under <code>ent/schema</code>, and the setup that generates code.']] });
      items.push({ file: 'ent/schema/task.go', lang: 'go', code: "package schema\n\nimport (\n\t\"entgo.io/ent\"\n\t\"entgo.io/ent/schema/field\"\n)\n\ntype Task struct {\n\tent.Schema\n}\n\nfunc (Task) Fields() []ent.Field {\n\treturn []ent.Field{\n\t\tfield.String(\"title\").MaxLen(200),\n\t\tfield.Bool(\"done\").Default(false),\n\t}\n}\n\nfunc (Task) Edges() []ent.Edge {\n\treturn nil\n}\n", lines: [['Fields', 'The columns of the <code>tasks</code> table. Ent adds an auto-numbered <code>id</code> by itself.'], ['MaxLen(200)', 'Rejects longer text before it reaches the database.'], ['Edges', 'Links to other kinds of data. This app has none.']] });
      if (own) items.push({ file: 'ent/schema/user.go', lang: 'go', code: "package schema\n\nimport (\n\t\"entgo.io/ent\"\n\t\"entgo.io/ent/schema/field\"\n)\n\ntype User struct {\n\tent.Schema\n}\n\nfunc (User) Fields() []ent.Field {\n\treturn []ent.Field{\n\t\tfield.String(\"email\").Unique(),\n\t\tfield.String(\"password_hash\").Sensitive(),\n\t}\n}\n\nfunc (User) Edges() []ent.Edge {\n\treturn nil\n}\n", lines: [['Unique', 'Stops two accounts from using the same email.'], ['Sensitive', 'Keeps the hash out of logs.']] });
      items.push({ cmd: 'go generate ./ent', lines: [['go generate', 'Writes typed database code into the <code>ent</code> folder. Run it again whenever you change a schema.']] });
      items.push({ file: 'tasks/store.go', lang: 'go', code: 'package tasks\n\n' + imports(['"context"', '"database/sql"', '"strconv"', d[0], '"demo/ent"', '"demo/ent/task"', own ? '"demo/ent/user"' : '', '"entgo.io/ent/dialect"', 'entsql "entgo.io/ent/dialect/sql"']) + "\nvar client *ent.Client\n\nfunc toTask(row *ent.Task) Task {\n\treturn Task{ID: strconv.Itoa(row.ID), Title: row.Title, Done: row.Done}\n}\n\nfunc Open(address string) error {\n\tdb, err := sql.Open(\"" + d[1] + "\", address)\n\tif err != nil {\n\t\treturn err\n\t}\n\tclient = ent.NewClient(ent.Driver(entsql.OpenDB(" + dialect + ", db)))\n\treturn nil\n}\n\nfunc Close() {\n\t_ = client.Close()\n}\n\nfunc List(ctx context.Context) ([]Task, error) {\n\trows, err := client.Task.Query().Order(task.ByID()).All(ctx)\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\tlist := []Task{}\n\tfor _, row := range rows {\n\t\tlist = append(list, toTask(row))\n\t}\n\treturn list, nil\n}\n\nfunc Add(ctx context.Context, title string) (Task, error) {\n\trow, err := client.Task.Create().SetTitle(title).Save(ctx)\n\tif err != nil {\n\t\treturn Task{}, err\n\t}\n\treturn toTask(row), nil\n}\n\nfunc SetDone(ctx context.Context, id string, done bool) error {\n\tnumber, err := strconv.Atoi(id)\n\tif err != nil {\n\t\treturn nil\n\t}\n\terr = client.Task.UpdateOneID(number).SetDone(done).Exec(ctx)\n\tif ent.IsNotFound(err) {\n\t\treturn nil\n\t}\n\treturn err\n}\n\nfunc Delete(ctx context.Context, id string) error {\n\tnumber, err := strconv.Atoi(id)\n\tif err != nil {\n\t\treturn nil\n\t}\n\terr = client.Task.DeleteOneID(number).Exec(ctx)\n\tif ent.IsNotFound(err) {\n\t\treturn nil\n\t}\n\treturn err\n}\n" + (own ? "\nfunc FindPasswordHash(ctx context.Context, email string) (string, error) {\n\trow, err := client.User.Query().Where(user.Email(email)).Only(ctx)\n\tif ent.IsNotFound(err) {\n\t\treturn \"\", nil\n\t}\n\tif err != nil {\n\t\treturn \"\", err\n\t}\n\treturn row.PasswordHash, nil\n}\n\nfunc AddUser(ctx context.Context, email, hash string) error {\n\treturn client.User.Create().SetEmail(email).SetPasswordHash(hash).Exec(ctx)\n}\n" : ''), lines: API_LINES.concat([
        ['entsql.OpenDB', 'Connects Ent to the driver.'],
        ['client.Task', 'Typed code generated from your schema, so a mistyped field fails to compile.'],
        ['IsNotFound', 'A task that\'s already gone isn\'t a problem worth reporting here.']
      ]) });
      return items;
    }
    if (a.data === 'sqlc') {
      var engine = { postgresql: 'postgresql', mysql: 'mysql', sqlite: 'sqlite' }[db];
      var ph = db === 'postgresql' ? ['$1', '$2'] : ['?', '?'];
      var idT = db === 'sqlite' ? 'int64' : 'int32';
      var dr = DRIVER[db];
      var migDir = { goose: 'migrations', 'golang-migrate': 'migrations', atlas: 'migrations', 'flyway-any': 'sql' }[a.migrations];
      items.push({ cmd: 'go get -tool github.com/sqlc-dev/sqlc/cmd/sqlc\ngo get ' + dr[2], lines: [['go get -tool', 'Records sqlc as a tool for this project, so everyone uses the same version through <code>go tool</code>.'], [dr[2], 'The database driver your app uses.']] });
      items.push({ file: 'sqlc.yaml', lang: 'yaml', code: 'version: "2"\nsql:\n  - engine: "' + engine + '"\n    queries: "tasks/query.sql"\n    schema: "' + migDir + '"\n    gen:\n      go:\n        package: "db"\n        out: "tasks/db"\n', lines: [['engine', 'Which kind of SQL to expect.'], ['queries', 'The file holding your SQL queries.'], ['schema', 'Your migration files, which tell sqlc what your tables look like.'], ['out', 'Where the generated Go code goes.']] });
      var addQ = db === 'mysql' ? "-- name: AddTask :execlastid\ninsert into tasks (title) values (?);\n" : "-- name: AddTask :one\ninsert into tasks (title) values (" + ph[0] + ") returning id, title, done;\n";
      items.push({ file: 'tasks/query.sql', lang: 'sql', code: "-- name: ListTasks :many\nselect id, title, done from tasks order by id;\n\n" + addQ + "\n-- name: SetDone :exec\nupdate tasks set done = " + ph[0] + " where id = " + ph[1] + ";\n\n-- name: DeleteTask :exec\ndelete from tasks where id = " + ph[0] + ";\n" + (own ? "\n-- name: FindPasswordHash :one\nselect password_hash from users where email = " + ph[0] + ";\n\n-- name: AddUser :exec\ninsert into users (email, password_hash) values (" + ph[0] + ", " + ph[1] + ");\n" : ''), lines: [['-- name:', 'The Go function sqlc generates for the query below it.'], [':many, :one, :exec', 'What it returns: a list, one row or nothing.']].concat(db === 'mysql' ? [[':execlastid', 'Returns the new row\'s ID, because MySQL can\'t return the row itself.']] : []) });
      items.push({ file: 'tasks/store.go', lang: 'go', code: 'package tasks\n\n' + imports(['"context"', '"database/sql"', own ? '"errors"' : '', '"strconv"', dr[0], '"demo/tasks/db"']) + "\nvar (\n\tconn    *sql.DB\n\tqueries *db.Queries\n)\n\nfunc Open(address string) (err error) {\n\tconn, err = sql.Open(\"" + dr[1] + "\", address)\n\tif err != nil {\n\t\treturn err\n\t}\n\tqueries = db.New(conn)\n\treturn nil\n}\n\nfunc Close() {\n\t_ = conn.Close()\n}\n\nfunc List(ctx context.Context) ([]Task, error) {\n\trows, err := queries.ListTasks(ctx)\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\tlist := []Task{}\n\tfor _, row := range rows {\n\t\tlist = append(list, Task{ID: strconv.Itoa(int(row.ID)), Title: row.Title, Done: row.Done})\n\t}\n\treturn list, nil\n}\n\nfunc Add(ctx context.Context, title string) (Task, error) {\n" + (db === 'mysql' ? "\tid, err := queries.AddTask(ctx, title)\n\tif err != nil {\n\t\treturn Task{}, err\n\t}\n\treturn Task{ID: strconv.FormatInt(id, 10), Title: title}, nil\n" : "\trow, err := queries.AddTask(ctx, title)\n\tif err != nil {\n\t\treturn Task{}, err\n\t}\n\treturn Task{ID: strconv.Itoa(int(row.ID)), Title: row.Title, Done: row.Done}, nil\n") + "}\n\nfunc SetDone(ctx context.Context, id string, done bool) error {\n\tnumber, err := strconv.Atoi(id)\n\tif err != nil {\n\t\treturn nil\n\t}\n\treturn queries.SetDone(ctx, db.SetDoneParams{Done: done, ID: " + idT + "(number)})\n}\n\nfunc Delete(ctx context.Context, id string) error {\n\tnumber, err := strconv.Atoi(id)\n\tif err != nil {\n\t\treturn nil\n\t}\n\treturn queries.DeleteTask(ctx, " + idT + "(number))\n}\n" + (own ? "\nfunc FindPasswordHash(ctx context.Context, email string) (string, error) {\n\thash, err := queries.FindPasswordHash(ctx, email)\n\tif errors.Is(err, sql.ErrNoRows) {\n\t\treturn \"\", nil\n\t}\n\treturn hash, err\n}\n\nfunc AddUser(ctx context.Context, email, hash string) error {\n\treturn queries.AddUser(ctx, db.AddUserParams{Email: email, PasswordHash: hash})\n}\n" : ''), lines: API_LINES.concat([['db.New', 'Creates the generated query functions, using your connection.'], ['queries.ListTasks', 'Generated from your SQL. If a query doesn\'t match your tables, generating fails instead of your app failing later.'], ['strconv.Atoi', 'Turns text into a number. A value that isn\'t a number can\'t be any task, so it does nothing.']]), sqlcStore: true });
      return items;
    }
    // database/sql: plain SQL with a driver.
    var dv = DRIVER[db];
    var p1 = db === 'postgresql' ? '$1' : db === 'sqlserver' ? '@p1' : '?';
    var p2 = db === 'postgresql' ? '$2' : db === 'sqlserver' ? '@p2' : '?';
    var addCode;
    if (db === 'mysql') addCode = "\tresult, err := db.ExecContext(ctx, \"insert into tasks (title) values (?)\", title)\n\tif err != nil {\n\t\treturn Task{}, err\n\t}\n\tid, err := result.LastInsertId()\n\treturn Task{ID: strconv.FormatInt(id, 10), Title: title}, err\n";
    else {
      var q = db === 'sqlserver' ? 'insert into tasks (title) output inserted.id values (@p1)' : 'insert into tasks (title) values (' + p1 + ') returning id';
      addCode = "\ttask := Task{Title: title}\n\terr := db.QueryRowContext(ctx, \"" + q + "\", title).Scan(&task.ID)\n\treturn task, err\n";
    }
    items.push({ cmd: 'go get ' + dv[2], lines: [[dv[2], db === 'sqlite' ? 'A SQLite driver written entirely in Go, so it needs no C compiler.' : 'The driver that lets Go\'s <code>database/sql</code> reach your database.']] });
    items.push({ file: 'tasks/store.go', lang: 'go', code: 'package tasks\n\n' + imports(['"context"', '"database/sql"', own ? '"errors"' : '', '"strconv"', dv[0]]) + "\nvar db *sql.DB\n\nfunc Open(address string) (err error) {\n\tdb, err = sql.Open(\"" + dv[1] + "\", address)\n\treturn err\n}\n\nfunc Close() {\n\t_ = db.Close()\n}\n\nfunc List(ctx context.Context) ([]Task, error) {\n\trows, err := db.QueryContext(ctx, \"select id, title, done from tasks order by id\")\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\tdefer rows.Close()\n\tlist := []Task{}\n\tfor rows.Next() {\n\t\tvar task Task\n\t\tif err := rows.Scan(&task.ID, &task.Title, &task.Done); err != nil {\n\t\t\treturn nil, err\n\t\t}\n\t\tlist = append(list, task)\n\t}\n\treturn list, rows.Err()\n}\n\nfunc Add(ctx context.Context, title string) (Task, error) {\n" + addCode + "}\n\nfunc SetDone(ctx context.Context, id string, done bool) error {\n\tnumber, err := strconv.Atoi(id)\n\tif err != nil {\n\t\treturn nil\n\t}\n\t_, err = db.ExecContext(ctx, \"update tasks set done = " + p1 + " where id = " + p2 + "\", done, number)\n\treturn err\n}\n\nfunc Delete(ctx context.Context, id string) error {\n\tnumber, err := strconv.Atoi(id)\n\tif err != nil {\n\t\treturn nil\n\t}\n\t_, err = db.ExecContext(ctx, \"delete from tasks where id = " + p1 + "\", number)\n\treturn err\n}\n" + (own ? "\nfunc FindPasswordHash(ctx context.Context, email string) (string, error) {\n\tvar hash string\n\terr := db.QueryRowContext(ctx, \"select password_hash from users where email = " + p1 + "\", email).Scan(&hash)\n\tif errors.Is(err, sql.ErrNoRows) {\n\t\treturn \"\", nil\n\t}\n\treturn hash, err\n}\n\nfunc AddUser(ctx context.Context, email, hash string) error {\n\t_, err := db.ExecContext(ctx, \"insert into users (email, password_hash) values (" + p1 + ", " + p2 + ")\", email, hash)\n\treturn err\n}\n" : ''), lines: API_LINES.concat([
      ['sql.Open', 'Prepares a pool of connections. The first real connection happens on the first query.'],
      [p1, 'A placeholder. The value travels separately from the SQL, which prevents SQL injection.'],
      ['defer rows.Close()', '<code>defer</code> runs this when the function ends, however it ends.'],
      ['rows.Scan', 'Copies a row\'s columns into your variables.'],
      ['strconv.Atoi', 'Turns text into a number. A value that isn\'t a number can\'t be any task, so it does nothing.']
    ]) });
    return items;
  }

  // Login needs only these columns.
  function usersDdl(db) { return Kit.ddlUsers(db).replace(/,\n  role[^\n]*/, ''); }
  var USER_LINES = [['unique', 'Stops two accounts from using the same email.'], ['password_hash', 'A one-way scrambled form of the password. Never store the password itself.']];

  function gooseDriver(db) { return { postgresql: 'postgres', mysql: 'mysql', sqlserver: 'mssql', sqlite: 'sqlite3' }[db]; }
  function migrateUrl(db) { return db === 'mysql' ? 'mysql://$DATABASE_URL' : db === 'sqlite' ? 'sqlite://$DATABASE_URL' : '$DATABASE_URL'; }
  function migrateTag(db) { return { postgresql: 'postgres', mysql: 'mysql', sqlserver: 'sqlserver', sqlite: 'sqlite' }[db]; }

  function migrationItems(a, own) {
    var db = a.database, items = [];
    if (db === 'mongodb') return [{ p: 'MongoDB has no fixed table structure, so there are no migrations to run. Collections are created the first time you save data.' }];
    var tasksSql = Kit.ddlTasks(db), usersSql = usersDdl(db);
    var dropBoth = (own ? 'drop table users;\n' : '') + 'drop table tasks;\n';
    if (a.migrations === 'goose') {
      items.push({ cmd: 'go get -tool github.com/pressly/goose/v3/cmd/goose', lines: [['goose', 'Runs migration files in order and records which have run.']] });
      items.push({ file: 'migrations/00001_create_tables.sql', lang: 'sql', code: '-- +goose Up\n' + tasksSql + (own ? '\n' + usersSql : '') + '\n-- +goose Down\n' + dropBoth, lines: [['00001', 'Files run in number order.'], ['+goose Up', 'Applies the change.'], ['+goose Down', 'Reverses it.']].concat(own ? USER_LINES : []) });
    }
    if (a.migrations === 'golang-migrate') {
      items.push({ file: 'migrations/000001_create_tables.up.sql', lang: 'sql', code: tasksSql + (own ? '\n' + usersSql : ''), lines: [['000001', 'Files run in number order.'], ['.up.sql', 'Applies the change.']].concat(own ? USER_LINES : []) });
      items.push({ file: 'migrations/000001_create_tables.down.sql', lang: 'sql', code: dropBoth, lines: [['.down.sql', 'Reverses the matching <code>.up.sql</code> file.']] });
    }
    if (a.migrations === 'atlas') {
      items.push({ p: 'Install Atlas by following its <a href="https://atlasgo.io/getting-started">getting started guide</a>. It comes as one program that you put on your <code>PATH</code>.' });
      if (db === 'sqlserver') {
        items.push({ warn: 'Atlas only supports SQL Server in its paid <a href="https://atlasgo.io/pricing">Pro Plan</a>, so the free version stops with an error here. Pro has a free trial. If you don\'t want to pay, choose goose or golang-migrate instead, which support SQL Server for free.' });
        items.push({ cmd: 'atlas login', manual: true, lines: [['atlas login', 'Opens your browser to sign in to your Atlas account, or to create one. Atlas needs this before it will connect to SQL Server.']] });
      }
      items.push({ file: 'migrations/20260101000000_create_tables.sql', lang: 'sql', code: tasksSql + (own ? '\n' + usersSql : ''), lines: [['20260101000000', 'A date and time, which sets the order files run in.']].concat(own ? USER_LINES : []) });
      items.push({ cmd: 'export ATLAS_URL="' + URL_ATLAS[db] + '"', manual: true, lines: [['ATLAS_URL', 'The same database, in the address format Atlas expects.']] });
    }
    if (a.migrations === 'flyway-any') {
      Kit.flywayItems(a, { users: own }).forEach(function (it) {
        if (it.file === 'sql/V2__create_users.sql') { it.code = usersSql; it.lines = USER_LINES; }
        items.push(it);
      });
    }
    return items;
  }
  function migrationRun(a) {
    var db = a.database;
    if (a.migrations === 'goose') return [{ cmd: 'go tool goose -dir migrations ' + gooseDriver(db) + ' "$DATABASE_URL" up', lines: [['go tool goose', 'Runs the version of goose this project recorded.'], ['-dir migrations', 'Where your files are.'], ['up', 'Runs every file that hasn\'t run yet.']] }];
    if (a.migrations === 'golang-migrate') return [{ cmd: 'go run -tags ' + migrateTag(db) + ' github.com/golang-migrate/migrate/v4/cmd/migrate@latest -path migrations -database "' + migrateUrl(db) + '" up', lines: [['go run ...@latest', 'Downloads, builds and runs the tool, without installing anything.'], ['-tags ' + migrateTag(db), 'Builds in support for your database.'], ['up', 'Runs every file that hasn\'t run yet.']] }];
    if (a.migrations === 'atlas') return [{ cmd: 'atlas migrate hash --dir file://migrations\natlas migrate apply --dir file://migrations --url "$ATLAS_URL"', lines: [['migrate hash', 'Records a checksum of your files in <code>atlas.sum</code>, so accidental edits get noticed. Run it after adding or changing a file.'], ['migrate apply', 'Runs every file that hasn\'t run yet.']] }];
    return [];
  }

  function liveCode(a) {
    var managed = a.transport === 'managed';
    if (managed) return { deps: 'go get github.com/ably/ably-go/ably', code: 'package main\n\n' + imports(['"context"', '"log"', '"net/http"', '"os"', '"github.com/ably/ably-go/ably"']) + "\nvar liveClient = newLiveClient()\n\nfunc newLiveClient() *ably.REST {\n\tkey := os.Getenv(\"ABLY_API_KEY\")\n\tif key == \"\" {\n\t\treturn nil\n\t}\n\tclient, err := ably.NewREST(ably.WithKey(key))\n\tif err != nil {\n\t\tlog.Fatal(err)\n\t}\n\treturn client\n}\n\nfunc liveToken(w http.ResponseWriter, r *http.Request) {\n\tif liveClient == nil {\n\t\thttp.Error(w, \"Live updates aren't set up\", http.StatusServiceUnavailable)\n\t\treturn\n\t}\n\ttoken, err := liveClient.Auth.CreateTokenRequest(&ably.TokenParams{Capability: `{\"tasks\":[\"subscribe\"]}`})\n\tif err != nil {\n\t\tfail(w, r, err)\n\t\treturn\n\t}\n\twriteJSON(w, http.StatusOK, token)\n}\n\nfunc tasksChanged() {\n\tif liveClient == nil {\n\t\treturn\n\t}\n\tgo func() {\n\t\tif err := liveClient.Channels.Get(\"tasks\").Publish(context.Background(), \"changed\", \"\"); err != nil {\n\t\t\tlog.Print(err)\n\t\t}\n\t}()\n}\n", lines: [['ably.NewREST', 'Sends messages to Ably over normal HTTP requests.'], ['CreateTokenRequest', 'Gives the browser a short-lived permission that can only subscribe, so your key stays secret.'], ['go func()', 'A goroutine: this runs in the background, so a slow network call doesn\'t slow the response.'], ['Publish', 'Ably delivers this to every subscribed browser.']] };
    var hub = "var (\n\tlistenersLock sync.Mutex\n\tlisteners     = map[chan struct{}]bool{}\n)\n\nfunc listen() chan struct{} {\n\tchanged := make(chan struct{}, 1)\n\tlistenersLock.Lock()\n\tdefer listenersLock.Unlock()\n\tlisteners[changed] = true\n\treturn changed\n}\n\nfunc stopListening(changed chan struct{}) {\n\tlistenersLock.Lock()\n\tdefer listenersLock.Unlock()\n\tdelete(listeners, changed)\n}\n\nfunc tasksChanged() {\n\tlistenersLock.Lock()\n\tdefer listenersLock.Unlock()\n\tfor changed := range listeners {\n\t\tselect {\n\t\tcase changed <- struct{}{}:\n\t\tdefault:\n\t\t}\n\t}\n}\n";
    var hubLines = [['listeners', 'One channel per open connection. A channel is how Go passes messages between goroutines, the lightweight threads that handle each request.'], ['sync.Mutex', 'A lock, because many requests use this map at once.'], ['select with default', 'Skips a connection that already has a message waiting, so one slow browser can\'t hold up the others.']];
    if (a.transport === 'sse') return { code: 'package main\n\n' + imports(['"fmt"', '"net/http"', '"sync"']) + "\n" + hub + "\nfunc liveEvents(w http.ResponseWriter, r *http.Request) {\n\tw.Header().Set(\"Content-Type\", \"text/event-stream\")\n\tw.Header().Set(\"Cache-Control\", \"no-cache\")\n\tchanged := listen()\n\tdefer stopListening(changed)\n\tflusher := http.NewResponseController(w)\n\tfmt.Fprint(w, \": connected\\n\\n\")\n\t_ = flusher.Flush()\n\tfor {\n\t\tselect {\n\t\tcase <-changed:\n\t\t\tfmt.Fprint(w, \"data: changed\\n\\n\")\n\t\t\t_ = flusher.Flush()\n\t\tcase <-r.Context().Done():\n\t\t\treturn\n\t\t}\n\t}\n}\n", lines: hubLines.concat([['text/event-stream', 'Tells the browser this response stays open and carries events.'], ['Flush', 'Sends what\'s been written now, rather than waiting for more.'], ['r.Context().Done()', 'Fires when the browser disconnects.']]) };
    return { deps: 'go get github.com/coder/websocket', code: 'package main\n\n' + imports(['"net/http"', '"sync"', '"github.com/coder/websocket"']) + "\n" + hub + "\nfunc liveSocket(w http.ResponseWriter, r *http.Request) {\n\tconn, err := websocket.Accept(w, r, nil)\n\tif err != nil {\n\t\treturn\n\t}\n\tdefer conn.CloseNow()\n\tchanged := listen()\n\tdefer stopListening(changed)\n\tctx := conn.CloseRead(r.Context())\n\tfor {\n\t\tselect {\n\t\tcase <-changed:\n\t\t\tif err := conn.Write(ctx, websocket.MessageText, []byte(\"changed\")); err != nil {\n\t\t\t\treturn\n\t\t\t}\n\t\tcase <-ctx.Done():\n\t\t\treturn\n\t\t}\n\t}\n}\n", lines: hubLines.concat([['websocket.Accept', 'Turns this request into a WebSocket connection. By default, it rejects connections from other sites.'], ['CloseRead', 'This connection only sends. It returns a context that ends when the browser disconnects.']]) };
  }

  function checkoutCode(a) {
    var send = "func send(req *http.Request, out any) error {\n\tres, err := http.DefaultClient.Do(req)\n\tif err != nil {\n\t\treturn err\n\t}\n\tdefer res.Body.Close()\n\tif res.StatusCode >= 300 {\n\t\treturn fmt.Errorf(\"payment provider answered %d\", res.StatusCode)\n\t}\n\treturn json.NewDecoder(res.Body).Decode(out)\n}\n";
    var jsonPost = "func jsonRequest(address string, body any) (*http.Request, error) {\n\tdata, err := json.Marshal(body)\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\treq, err := http.NewRequest(http.MethodPost, address, bytes.NewReader(data))\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\treq.Header.Set(\"Content-Type\", \"application/json\")\n\treturn req, nil\n}\n";
    if (a.payment === 'stripe') return { code: 'package main\n\n' + imports(['"encoding/json"', '"fmt"', '"net/http"', '"net/url"', '"os"', '"strings"']) + "\n" + send + "\nfunc createCheckout(baseURL string) (string, error) {\n\tform := url.Values{\n\t\t\"mode\":                                   {\"payment\"},\n\t\t\"success_url\":                            {baseURL + \"/?paid=1\"},\n\t\t\"cancel_url\":                             {baseURL + \"/\"},\n\t\t\"line_items[0][quantity]\":                {\"1\"},\n\t\t\"line_items[0][price_data][currency]\":    {\"eur\"},\n\t\t\"line_items[0][price_data][unit_amount]\": {\"1000\"},\n\t\t\"line_items[0][price_data][product_data][name]\": {\"Example product\"},\n\t}\n\treq, err := http.NewRequest(http.MethodPost, \"https://api.stripe.com/v1/checkout/sessions\", strings.NewReader(form.Encode()))\n\tif err != nil {\n\t\treturn \"\", err\n\t}\n\treq.Header.Set(\"Authorization\", \"Bearer \"+os.Getenv(\"STRIPE_SECRET_KEY\"))\n\treq.Header.Set(\"Content-Type\", \"application/x-www-form-urlencoded\")\n\tvar session struct {\n\t\tURL string `json:\"url\"`\n\t}\n\tif err := send(req, &session); err != nil {\n\t\treturn \"\", err\n\t}\n\treturn session.URL, nil\n}\n", fake: '{"url":"https://pay.example/1"}', lines: [['/v1/checkout/sessions', 'Creates a Stripe-hosted payment page.'], ['Bearer', 'Logs in with your secret key. It only ever belongs on the server.'], ['url.Values', 'Stripe\'s API takes form-encoded data, not JSON.'], ['unit_amount', 'The price in the smallest unit, so 1000 is 10.00 euros.'], ['session.URL', 'The payment page to send the customer to.']] };
    if (a.payment === 'adyen') return { code: 'package main\n\n' + imports(['"bytes"', '"encoding/json"', '"fmt"', '"net/http"', '"os"', '"time"']) + "\n" + send + "\n" + jsonPost + "\nfunc createCheckout(baseURL string) (string, error) {\n\treq, err := jsonRequest(\"https://checkout-test.adyen.com/v72/paymentLinks\", map[string]any{\n\t\t\"merchantAccount\": os.Getenv(\"ADYEN_MERCHANT\"),\n\t\t\"reference\":       fmt.Sprintf(\"order-%d\", time.Now().UnixMilli()),\n\t\t\"amount\":          map[string]any{\"currency\": \"EUR\", \"value\": 1000},\n\t\t\"returnUrl\":       baseURL + \"/?paid=1\",\n\t})\n\tif err != nil {\n\t\treturn \"\", err\n\t}\n\treq.Header.Set(\"X-API-Key\", os.Getenv(\"ADYEN_API_KEY\"))\n\tvar link struct {\n\t\tURL string `json:\"url\"`\n\t}\n\tif err := send(req, &link); err != nil {\n\t\treturn \"\", err\n\t}\n\treturn link.URL, nil\n}\n", fake: '{"url":"https://pay.example/1"}', lines: [['checkout-test.adyen.com', 'Adyen\'s test system. Production uses a URL specific to your account.'], ['/paymentLinks', 'Creates an Adyen-hosted payment page.'], ['X-API-Key', 'Logs in with your API key.'], ['"value": 1000', 'The price in the smallest unit, so 10.00 euros.']] };
    if (a.payment === 'paypal') return { code: 'package main\n\n' + imports(['"bytes"', '"encoding/json"', '"errors"', '"fmt"', '"net/http"', '"os"', '"strings"']) + "\nconst paypalAPI = \"https://api-m.sandbox.paypal.com\"\n\n" + send + "\n" + jsonPost + "\nfunc createCheckout(baseURL string) (string, error) {\n\ttokenReq, err := http.NewRequest(http.MethodPost, paypalAPI+\"/v1/oauth2/token\", strings.NewReader(\"grant_type=client_credentials\"))\n\tif err != nil {\n\t\treturn \"\", err\n\t}\n\ttokenReq.SetBasicAuth(os.Getenv(\"PAYPAL_CLIENT_ID\"), os.Getenv(\"PAYPAL_SECRET\"))\n\ttokenReq.Header.Set(\"Content-Type\", \"application/x-www-form-urlencoded\")\n\tvar token struct {\n\t\tAccessToken string `json:\"access_token\"`\n\t}\n\tif err := send(tokenReq, &token); err != nil {\n\t\treturn \"\", err\n\t}\n\treq, err := jsonRequest(paypalAPI+\"/v2/checkout/orders\", map[string]any{\n\t\t\"intent\":         \"CAPTURE\",\n\t\t\"purchase_units\": []any{map[string]any{\"amount\": map[string]any{\"currency_code\": \"EUR\", \"value\": \"10.00\"}}},\n\t\t\"payment_source\": map[string]any{\"paypal\": map[string]any{\"experience_context\": map[string]any{\"return_url\": baseURL + \"/?paid=1\", \"cancel_url\": baseURL + \"/\"}}},\n\t})\n\tif err != nil {\n\t\treturn \"\", err\n\t}\n\treq.Header.Set(\"Authorization\", \"Bearer \"+token.AccessToken)\n\tvar order struct {\n\t\tLinks []struct {\n\t\t\tRel  string `json:\"rel\"`\n\t\t\tHref string `json:\"href\"`\n\t\t} `json:\"links\"`\n\t}\n\tif err := send(req, &order); err != nil {\n\t\treturn \"\", err\n\t}\n\tfor _, link := range order.Links {\n\t\tif link.Rel == \"payer-action\" {\n\t\t\treturn link.Href, nil\n\t\t}\n\t}\n\treturn \"\", errors.New(\"PayPal didn't send a payment link\")\n}\n", fake: '{"access_token":"t","links":[{"rel":"payer-action","href":"https://pay.example/1"}]}', lines: [['api-m.sandbox', 'PayPal\'s test system. Use <code>api-m.paypal.com</code> in production.'], ['/v1/oauth2/token', 'Exchanges your app\'s credentials for a short-lived token.'], ['"intent": "CAPTURE"', 'Takes payment immediately once the buyer approves.'], ['payer-action', 'The link where the buyer approves. After they return, capture the order on your server to actually take the money.']] };
    return { code: 'package main\n\n' + imports(['"bytes"', '"encoding/json"', '"fmt"', '"net/http"', '"os"']) + "\nconst klarnaAPI = \"https://api.playground.klarna.com\"\n\n" + send + "\n" + jsonPost + "\nfunc createCheckout(baseURL string) (string, error) {\n\tsessionReq, err := jsonRequest(klarnaAPI+\"/payments/v1/sessions\", map[string]any{\n\t\t\"purchase_country\":  \"SE\",\n\t\t\"purchase_currency\": \"SEK\",\n\t\t\"locale\":            \"sv-SE\",\n\t\t\"order_amount\":      10000,\n\t\t\"order_lines\":       []any{map[string]any{\"name\": \"Example product\", \"quantity\": 1, \"unit_price\": 10000, \"total_amount\": 10000}},\n\t})\n\tif err != nil {\n\t\treturn \"\", err\n\t}\n\tsessionReq.SetBasicAuth(os.Getenv(\"KLARNA_USER\"), os.Getenv(\"KLARNA_PASSWORD\"))\n\tvar session struct {\n\t\tSessionID string `json:\"session_id\"`\n\t}\n\tif err := send(sessionReq, &session); err != nil {\n\t\treturn \"\", err\n\t}\n\treq, err := jsonRequest(klarnaAPI+\"/hpp/v1/sessions\", map[string]any{\n\t\t\"payment_session_url\": klarnaAPI + \"/payments/v1/sessions/\" + session.SessionID,\n\t\t\"merchant_urls\":       map[string]any{\"success\": baseURL + \"/?paid=1\", \"cancel\": baseURL + \"/\", \"back\": baseURL + \"/\", \"failure\": baseURL + \"/\", \"error\": baseURL + \"/\"},\n\t})\n\tif err != nil {\n\t\treturn \"\", err\n\t}\n\treq.SetBasicAuth(os.Getenv(\"KLARNA_USER\"), os.Getenv(\"KLARNA_PASSWORD\"))\n\tvar page struct {\n\t\tRedirectURL string `json:\"redirect_url\"`\n\t}\n\tif err := send(req, &page); err != nil {\n\t\treturn \"\", err\n\t}\n\treturn page.RedirectURL, nil\n}\n", fake: '{"session_id":"s","redirect_url":"https://pay.example/1"}', lines: [['api.playground.klarna.com', 'Klarna\'s test system. Production uses <code>api.klarna.com</code> or a regional address.'], ['/payments/v1/sessions', 'Describes the order. Amounts are in the smallest unit, so 10000 is 100.00 SEK.'], ['/hpp/v1/sessions', 'Creates the Klarna-hosted payment page for that order.'], ['merchant_urls', 'Where Klarna returns the customer in each outcome.'], ['redirect_url', 'The payment page to send the customer to.']] };
  }

  function goGuide(a) {
    var f = FW[a.framework], s = [];
    var spa = Kit.isSpa(a), templates = a.frontend === 'server-templates', login = !!a.login, oidc = Kit.usesOidc(a), own = a.login === 'own';
    var isRest = a.api === 'rest', isGql = a.api === 'graphql', pages = templates || a.admin === 'in-app' || own;
    var mongo = a.database === 'mongodb';
    var notify = a.transport ? '\n\ttasksChanged()' : '';

    s.push({ id: 'tools', title: 'Install your tools', items: [
      { p: 'You need <a href="https://go.dev/dl/">Go</a> 1.25 or newer' + (spa || a.admin === 'low-code' ? ', and <a href="https://nodejs.org/en/download">Node.js</a> 22.12 or newer to build the frontend' : '') + '. Commands assume a Unix-style terminal. On Windows, use Git Bash or WSL.' },
      { cmd: 'go version', lines: [['go', 'Compiles your code into one program, and manages libraries.']] }
    ] });

    s.push({ id: 'project', title: 'Create the project', items: [
      { cmd: 'mkdir demo\ncd demo\ngo mod init demo' + (f.imp.length ? '\ngo get ' + { gin: 'github.com/gin-gonic/gin', echo: 'github.com/labstack/echo/v5' }[a.framework] : ''), lines: [
        ['go mod init demo', 'Creates <code>go.mod</code>, which names your module and lists its libraries. Use a real path such as <code>github.com/you/demo</code> if others will import it.']
      ].concat(a.framework === 'gin' ? [['gin-gonic/gin', 'The Gin web framework.']] : []).concat(a.framework === 'echo' ? [['echo/v5', 'The Echo web framework. Its version 5 is what its current docs describe.']] : []).concat(a.framework === 'nethttp' ? [['No framework', 'Go\'s built-in <code>net/http</code> handles routing, so there\'s nothing to download.']] : []) },
      { file: '.gitignore', lang: 'text', code: 'demo\ndemo.exe\n.env\n*.db\n', lines: [['.gitignore', 'Tells Git what to leave out: the compiled program, secrets and database files.']] }
    ] });

    var dbItems = Kit.dbSetup(a).concat([envItem(a)]).concat(migrationItems(a, own)).concat(dataItems(a, own));
    if (a.data === 'sqlc' && !mongo) {
      var at = dbItems.map(function (i) { return i.file; }).indexOf('tasks/query.sql');
      dbItems.splice(at + 1, 0, { cmd: 'go tool sqlc generate', lines: [['sqlc generate', 'Reads your SQL and writes matching Go code into <code>tasks/db</code>. Run it again whenever you change a query or a table.']] });
    }
    dbItems = dbItems.concat(migrationRun(a));
    s.push({ id: 'db', title: 'Set up the database', items: dbItems });

    // Login
    if (login) {
      var li = [];
      if (oidc) li = li.concat(Kit.oidcSetup(a, '/auth/callback', 3000));
      var getLine = 'go get github.com/gorilla/sessions' + (own ? ' golang.org/x/crypto/bcrypt' : ' github.com/coreos/go-oidc/v3/oidc golang.org/x/oauth2');
      li.push({ cmd: getLine, lines: [['gorilla/sessions', 'Stores who is logged in, in an encrypted cookie.']].concat(own ? [['bcrypt', 'Scrambles passwords one way, so a stolen database doesn\'t reveal them.']] : [['go-oidc and oauth2', 'Handle the OpenID Connect sign-in and check the identity your provider sends back.']]) });
      li.push({ cmd: 'export SESSION_SECRET="$(openssl rand -base64 32)"\nexport ADMIN_EMAILS=you@example.com', lines: [['openssl rand -base64 32', 'Generates a random secret that protects session cookies. Save the value somewhere safe and reuse it, because changing it logs everyone out.'], ['ADMIN_EMAILS', 'A comma-separated list of admin accounts.']] });
      var authImports = ['"encoding/json"', '"log"', '"net/http"', '"os"', '"slices"', '"strings"', '"github.com/gorilla/sessions"'];
      var authCode = "\nvar sessionStore = newSessionStore()\n\nfunc newSessionStore() *sessions.CookieStore {\n\tsecret := os.Getenv(\"SESSION_SECRET\")\n\tif len(secret) < 32 {\n\t\tlog.Fatal(\"Set SESSION_SECRET to at least 32 random characters\")\n\t}\n\tstore := sessions.NewCookieStore([]byte(secret))\n\tstore.Options = &sessions.Options{\n\t\tPath:     \"/\",\n\t\tMaxAge:   7 * 24 * 60 * 60,\n\t\tHttpOnly: true,\n\t\tSecure:   os.Getenv(\"APP_ENV\") == \"production\",\n\t\tSameSite: http.SameSiteLaxMode,\n\t}\n\treturn store\n}\n\nfunc currentEmail(r *http.Request) string {\n\tsession, err := sessionStore.Get(r, \"session\")\n\tif err != nil {\n\t\treturn \"\"\n\t}\n\temail, _ := session.Values[\"email\"].(string)\n\treturn email\n}\n\nfunc signIn(w http.ResponseWriter, r *http.Request, email string) error {\n\tsession, _ := sessionStore.Get(r, \"session\")\n\tsession.Values[\"email\"] = email\n\treturn session.Save(r, w)\n}\n\nfunc signOut(w http.ResponseWriter, r *http.Request) error {\n\tsession, _ := sessionStore.Get(r, \"session\")\n\tsession.Options.MaxAge = -1\n\treturn session.Save(r, w)\n}\n\nfunc isAdmin(email string) bool {\n\tadmins := strings.Split(strings.ToLower(os.Getenv(\"ADMIN_EMAILS\")), \",\")\n\treturn email != \"\" && slices.Contains(admins, strings.ToLower(email))\n}\n\n// blocked answers a visitor who isn't logged in: pages go to the login page, and API calls get a 401.\nfunc blocked(w http.ResponseWriter, r *http.Request) {\n\tif r.Method == http.MethodGet && !strings.HasPrefix(r.URL.Path, \"/api\") && strings.Contains(r.Header.Get(\"Accept\"), \"text/html\") {\n\t\thttp.Redirect(w, r, \"/login\", http.StatusFound)\n\t\treturn\n\t}\n\tw.Header().Set(\"Content-Type\", \"application/json\")\n\tw.WriteHeader(http.StatusUnauthorized)\n\t_ = json.NewEncoder(w).Encode(map[string]string{\"error\": \"Log in first\"})\n}\n";
      var authLines = [
        ['NewCookieStore', 'Keeps the session in a signed cookie, so nothing needs storing on the server.'],
        ['HttpOnly', 'Stops page scripts from reading the cookie.'],
        ['Secure', 'Only sends the cookie over HTTPS. The Dockerfile below sets <code>APP_ENV=production</code>, which turns this on.'],
        ['SameSiteLaxMode', 'Keeps the cookie off forms posted from other sites.'],
        ['MaxAge = -1', 'Tells the browser to delete the cookie.'],
        ['isAdmin', 'Treats the emails listed in <code>ADMIN_EMAILS</code> as admins, so you don\'t need a separate roles system to start.']
      ];
      if (oidc) {
        authImports.push('"context"', '"crypto/rand"', '"encoding/base64"', '"github.com/coreos/go-oidc/v3/oidc"', '"golang.org/x/oauth2"');
        authCode += "\nfunc oidcConfig(ctx context.Context, r *http.Request) (*oidc.Provider, *oauth2.Config, error) {\n\tprovider, err := oidc.NewProvider(ctx, strings.TrimSuffix(os.Getenv(\"OIDC_ISSUER\"), \"/\"))\n\tif err != nil {\n\t\treturn nil, nil, err\n\t}\n\tbase := os.Getenv(\"PUBLIC_URL\")\n\tif base == \"\" {\n\t\tbase = \"http://\" + r.Host\n\t}\n\treturn provider, &oauth2.Config{\n\t\tClientID:     os.Getenv(\"OIDC_CLIENT_ID\"),\n\t\tClientSecret: os.Getenv(\"OIDC_CLIENT_SECRET\"),\n\t\tRedirectURL:  base + \"/auth/callback\",\n\t\tEndpoint:     provider.Endpoint(),\n\t\tScopes:       []string{oidc.ScopeOpenID, \"profile\", \"email\"},\n\t}, nil\n}\n\nfunc oidcStart(w http.ResponseWriter, r *http.Request) {\n\t_, config, err := oidcConfig(r.Context(), r)\n\tif err != nil {\n\t\tfail(w, r, err)\n\t\treturn\n\t}\n\tstate := rand.Text()\n\tsession, _ := sessionStore.Get(r, \"session\")\n\tsession.Values[\"state\"] = state\n\tif err := session.Save(r, w); err != nil {\n\t\tfail(w, r, err)\n\t\treturn\n\t}\n\thttp.Redirect(w, r, config.AuthCodeURL(state), http.StatusFound)\n}\n\nfunc oidcCallback(w http.ResponseWriter, r *http.Request) {\n\tsession, _ := sessionStore.Get(r, \"session\")\n\tif state, _ := session.Values[\"state\"].(string); state == \"\" || state != r.URL.Query().Get(\"state\") {\n\t\thttp.Error(w, \"Login expired. Please try again.\", http.StatusBadRequest)\n\t\treturn\n\t}\n\tprovider, config, err := oidcConfig(r.Context(), r)\n\tif err != nil {\n\t\tfail(w, r, err)\n\t\treturn\n\t}\n\ttoken, err := config.Exchange(r.Context(), r.URL.Query().Get(\"code\"))\n\tif err != nil {\n\t\tfail(w, r, err)\n\t\treturn\n\t}\n\trawID, _ := token.Extra(\"id_token\").(string)\n\tidToken, err := provider.Verifier(&oidc.Config{ClientID: config.ClientID}).Verify(r.Context(), rawID)\n\tif err != nil {\n\t\tfail(w, r, err)\n\t\treturn\n\t}\n\tvar claims struct {\n\t\tEmail string `json:\"email\"`\n\t}\n\tif err := idToken.Claims(&claims); err != nil {\n\t\tfail(w, r, err)\n\t\treturn\n\t}\n\tif err := signIn(w, r, base64.RawURLEncoding.EncodeToString([]byte(claims.Email))[:0]+claims.Email); err != nil {\n\t\tfail(w, r, err)\n\t\treturn\n\t}\n\thttp.Redirect(w, r, \"/\", http.StatusFound)\n}\n";
        authCode = authCode.replace('base64.RawURLEncoding.EncodeToString([]byte(claims.Email))[:0]+claims.Email', 'claims.Email');
        authImports = authImports.filter(function (x) { return x !== '"encoding/base64"'; });
        authLines.push(['oidc.NewProvider', 'Finds your provider\'s login and token addresses from its issuer address.'], ['state', 'A random value that proves the login which comes back is the one this browser started.'], ['Exchange', 'Swaps the one-time code from the provider for tokens, server to server.'], ['Verify', 'Checks the ID token\'s signature and audience before trusting it.']);
      }
      li.push({ file: 'auth.go', lang: 'go', code: 'package main\n\n' + imports(authImports) + authCode, lines: authLines });
      s.push({ id: 'login', title: 'Add login', items: li });
    }

    if (a.transport) {
      var live = liveCode(a);
      var liveItems = [];
      if (a.transport === 'managed') liveItems.push({ p: 'Create a free <a href="https://ably.com/docs/getting-started">Ably</a> account and copy an API key.' }, { cmd: 'export ABLY_API_KEY=your-key', manual: true, lines: [['ABLY_API_KEY', 'Your secret key. It stays on the server.']] });
      if (live.deps) liveItems.push({ cmd: live.deps, lines: [[live.deps.split(' ')[2], a.transport === 'managed' ? 'Ably\'s official library.' : 'A small, well-maintained WebSocket library. Go\'s standard library doesn\'t include one.']] });
      liveItems.push({ file: 'live.go', lang: 'go', code: live.code, lines: live.lines });
      s.push({ id: 'live', title: 'Add live updates', items: liveItems });
    }

    if (a.payment) {
      var pay = checkoutCode(a);
      s.push({ id: 'pay', title: 'Add payments with ' + Kit.PAYMENT[a.payment].name, items: Kit.paymentIntro(a).concat([
        { file: 'checkout.go', lang: 'go', code: pay.code, lines: pay.lines.concat([['send', 'Makes the request and reads the JSON answer. Anything other than success becomes an error.']]) },
        { file: 'checkout_test.go', lang: 'go', code: "package main\n\nimport (\n\t\"io\"\n\t\"net/http\"\n\t\"strings\"\n\t\"testing\"\n)\n\ntype fakeProvider struct{}\n\nfunc (fakeProvider) RoundTrip(*http.Request) (*http.Response, error) {\n\tbody := `" + pay.fake + "`\n\treturn &http.Response{StatusCode: 200, Header: http.Header{}, Body: io.NopCloser(strings.NewReader(body))}, nil\n}\n\nfunc TestCheckoutAsksForAPaymentPage(t *testing.T) {\n\treal := http.DefaultClient.Transport\n\thttp.DefaultClient.Transport = fakeProvider{}\n\tdefer func() { http.DefaultClient.Transport = real }()\n\taddress, err := createCheckout(\"http://localhost:3000\")\n\tif err != nil {\n\t\tt.Fatal(err)\n\t}\n\tif address != \"https://pay.example/1\" {\n\t\tt.Errorf(\"got %q\", address)\n\t}\n}\n", lines: [['RoundTrip', 'Replaces the network call with a simulated response, so this test needs no account and spends no money.'], ['func Test', 'Go runs any function named this way, in a file ending in <code>_test.go</code>.']] }
      ]).concat(Kit.paymentOutro(a)) });
    }

    // GraphQL is generated, so it comes before the routes that use it.
    var appItems = [];
    if (isGql) {
      appItems.push({ cmd: 'go mod tidy\ngo get -tool github.com/99designs/gqlgen', lines: [['go mod tidy', 'Downloads what your code imports so far.'], ['gqlgen', 'Generates a type-checked GraphQL server from a schema.']] });
      appItems.push({ file: 'graph/schema.graphqls', lang: 'text', code: 'type Task {\n  id: ID!\n  title: String!\n  done: Boolean!\n}\n\ntype Query {\n  tasks: [Task!]!\n}\n\ntype Mutation {\n  addTask(title: String!): Task!\n  setDone(id: ID!, done: Boolean!): Boolean!\n}\n', lines: [['type Task', 'Describes what clients can ask for.'], ['ID!', 'The <code>!</code> means the value is never null.'], ['Mutation', 'Operations that change data.']] });
      appItems.push({ file: 'gqlgen.yml', lang: 'yaml', code: 'schema:\n  - graph/schema.graphqls\nexec:\n  filename: graph/generated.go\n  package: graph\nmodel:\n  filename: graph/models_gen.go\n  package: graph\nresolver:\n  layout: follow-schema\n  dir: graph\n  package: graph\nautobind:\n  - demo/tasks\n', lines: [['exec', 'Where the generated server code goes.'], ['resolver', 'Where the functions you write go.'], ['autobind', 'Uses your existing <code>Task</code> type, so gqlgen doesn\'t generate a second one.']] });
      appItems.push({ file: 'graph/resolver.go', lang: 'go', code: 'package graph\n\n// Resolver holds what the GraphQL functions need.\ntype Resolver struct {\n\tChanged func()\n}\n', lines: [['Changed', 'Called after data changes. It lets this package stay separate from your live updates.']] });
      appItems.push({ cmd: 'go tool gqlgen generate', lines: [['gqlgen generate', 'Writes the server code, and a starter <code>graph/schema.resolvers.go</code> for you to fill in. Run it again when you change the schema.']] });
      appItems.push({ file: 'graph/schema.resolvers.go', lang: 'go', code: "package graph\n\nimport (\n\t\"context\"\n\n\t\"demo/tasks\"\n)\n\nfunc (r *mutationResolver) AddTask(ctx context.Context, title string) (*tasks.Task, error) {\n\ttask, err := tasks.Add(ctx, title)\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\tr.Changed()\n\treturn &task, nil\n}\n\nfunc (r *mutationResolver) SetDone(ctx context.Context, id string, done bool) (bool, error) {\n\tif err := tasks.SetDone(ctx, id, done); err != nil {\n\t\treturn false, err\n\t}\n\tr.Changed()\n\treturn true, nil\n}\n\nfunc (r *queryResolver) Tasks(ctx context.Context) ([]*tasks.Task, error) {\n\tlist, err := tasks.List(ctx)\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\tresult := make([]*tasks.Task, len(list))\n\tfor i := range list {\n\t\tresult[i] = &list[i]\n\t}\n\treturn result, nil\n}\n\nfunc (r *Resolver) Mutation() MutationResolver { return &mutationResolver{r} }\n\nfunc (r *Resolver) Query() QueryResolver { return &queryResolver{r} }\n\ntype mutationResolver struct{ *Resolver }\ntype queryResolver struct{ *Resolver }\n", lines: [['Replaces the starter file', 'gqlgen wrote stubs that stop with an error. These are the real functions, and gqlgen keeps them when it runs again.'], ['AddTask, SetDone, Tasks', 'One Go function for each operation in your schema.']] });
    }

    // Handlers
    var im = ['"net/http"'].concat(f.imp), hs = [], routes = [];
    function route(method, path, name, guard) {
      var p = a.framework === 'nethttp' ? path.replace(/:(\w+)/g, '{$1}') : path;
      if (a.framework === 'nethttp') {
        if (p === '/') p = '/{$}';
        routes.push('mux.HandleFunc("' + method + ' ' + p + '", ' + (guard ? guard + '(' + name + ')' : name) + ')');
      } else if (a.framework === 'gin') routes.push('router.' + method + '("' + p + '", ' + (guard ? guard + ', ' : '') + name + ')');
      else routes.push('router.' + method + '("' + p + '", ' + name + (guard ? ', ' + guard : '') + ')');
    }
    function wrapF(fn) { return a.framework === 'nethttp' ? fn : a.framework === 'gin' ? 'gin.WrapF(' + fn + ')' : 'echo.WrapHandler(http.HandlerFunc(' + fn + '))'; }
    var guard = login ? 'requireUser' : '';
    var ctx = f.req + '.Context()';
    var nilFail = 'if err != nil {\n\t\t' + f.fail.replace(/\n\t/g, '\n\t\t') + '\n\t}\n\t';
    if (isRest || templates || a.admin === 'in-app' || own) im.push('"demo/tasks"');
    if (isRest) {
      im.push('"strings"', '"strconv"');
      hs.push(handler(f, 'listTasks', "list, err := tasks.List(" + ctx + ")\n\t" + nilFail + f.header('"Content-Range"', 'fmt.Sprintf("tasks 0-%d/%d", len(list), len(list))') + "\n\t" + f.header('"Access-Control-Expose-Headers"', '"Content-Range"') + "\n\t" + f.json('http.StatusOK', 'list')));
      im.push('"fmt"');
      im = im.filter(function (x) { return x !== '"strconv"'; });
      hs.push(handler(f, 'oneTask', "list, err := tasks.List(" + ctx + ")\n\t" + nilFail + "for _, task := range list {\n\t\tif task.ID == " + f.param('id') + " {\n\t\t\t" + f.json('http.StatusOK', 'task').replace(/\n\t/g, '\n\t\t\t') + "\n\t\t}\n\t}\n\t" + f.json('http.StatusNotFound', 'map[string]string{"error": "Not found"}')));
      hs.push(handler(f, 'createTask', "var body struct {\n\t\tTitle string `json:\"title\"`\n\t}\n\tif err := " + f.bind + "; err != nil {\n\t\t" + f.json('http.StatusBadRequest', 'map[string]string{"error": "Send JSON"}').replace(/\n\t/g, '\n\t\t') + "\n\t}\n\ttitle := strings.TrimSpace(body.Title)\n\tif title == \"\" || len([]rune(title)) > 200 {\n\t\t" + f.json('http.StatusBadRequest', 'map[string]string{"error": "A title of 1 to 200 characters is required"}').replace(/\n\t/g, '\n\t\t') + "\n\t}\n\ttask, err := tasks.Add(" + ctx + ", title)\n\t" + nilFail.replace(/\n\t$/, '') + notify + "\n\t" + f.json('http.StatusCreated', 'task')));
      hs.push(handler(f, 'changeTask', "var body struct {\n\t\tDone bool `json:\"done\"`\n\t}\n\tif err := " + f.bind + "; err != nil {\n\t\t" + f.json('http.StatusBadRequest', 'map[string]string{"error": "Send JSON"}').replace(/\n\t/g, '\n\t\t') + "\n\t}\n\tid := " + f.param('id') + "\n\tif err := tasks.SetDone(" + ctx + ", id, body.Done); err != nil {\n\t\t" + f.fail.replace(/\n\t/g, '\n\t\t') + "\n\t}" + notify + "\n\tlist, err := tasks.List(" + ctx + ")\n\t" + nilFail + "for _, task := range list {\n\t\tif task.ID == id {\n\t\t\t" + f.json('http.StatusOK', 'task').replace(/\n\t/g, '\n\t\t\t') + "\n\t\t}\n\t}\n\t" + f.json('http.StatusNotFound', 'map[string]string{"error": "Not found"}')));
      route('GET', '/api/tasks', 'listTasks', guard); route('GET', '/api/tasks/:id', 'oneTask', guard); route('POST', '/api/tasks', 'createTask', guard); route('PUT', '/api/tasks/:id', 'changeTask', guard);
    }
    if (isGql) {
      im.push('"demo/graph"', '"github.com/99designs/gqlgen/graphql/handler"', '"github.com/99designs/gqlgen/graphql/handler/transport"');
      hs.push("func graphqlHandler() http.HandlerFunc {\n\tserver := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{Changed: " + (a.transport ? 'tasksChanged' : 'func() {}') + "}}))\n\tserver.AddTransport(transport.POST{})\n\treturn server.ServeHTTP\n}\n");
      route('POST', '/graphql', wrapF('graphqlHandler()'), guard);
    }
    if (templates) {
      hs.push(handler(f, 'homePage', "list, err := tasks.List(" + ctx + ")\n\t" + nilFail + f.page('index.html', 'list')));
      hs.push(handler(f, 'listPart', "list, err := tasks.List(" + ctx + ")\n\t" + nilFail + f.page('list.html', 'list')));
      im.push('"strings"');
      hs.push(handler(f, 'addFromForm', "title := strings.TrimSpace(" + f.form('title') + ")\n\tif title != \"\" && len([]rune(title)) <= 200 {\n\t\tif _, err := tasks.Add(" + ctx + ", title); err != nil {\n\t\t\t" + f.fail.replace(/\n\t/g, '\n\t\t\t') + "\n\t\t}" + (a.transport ? '\n\t\ttasksChanged()' : '') + "\n\t}\n\tlist, err := tasks.List(" + ctx + ")\n\t" + nilFail + f.page('list.html', 'list')));
      hs.push(handler(f, 'toggleTask', "if err := tasks.SetDone(" + ctx + ", " + f.param('id') + ", " + f.form('done') + " == \"on\"); err != nil {\n\t\t" + f.fail.replace(/\n\t/g, '\n\t\t') + "\n\t}" + notify + "\n\tlist, err := tasks.List(" + ctx + ")\n\t" + nilFail + f.page('list.html', 'list')));
      route('GET', '/', 'homePage', guard); route('GET', '/tasks', 'listPart', guard); route('POST', '/tasks', 'addFromForm', guard); route('POST', '/tasks/:id/toggle', 'toggleTask', guard);
    }
    if (a.admin === 'in-app') {
      hs.push(handler(f, 'adminPage', "list, err := tasks.List(" + ctx + ")\n\t" + nilFail + f.page('admin.html', 'list')));
      hs.push(handler(f, 'adminDelete', "if err := tasks.Delete(" + ctx + ", " + f.param('id') + "); err != nil {\n\t\t" + f.fail.replace(/\n\t/g, '\n\t\t') + "\n\t}" + notify + "\n\t" + f.redirect('http.StatusSeeOther', '"/admin"')));
      route('GET', '/admin', 'adminPage', 'requireAdmin'); route('POST', '/admin/tasks/:id/delete', 'adminDelete', 'requireAdmin');
    }
    if (a.payment) {
      im.push('"os"');
      hs.push(handler(f, 'checkout', "baseURL := os.Getenv(\"PUBLIC_URL\")\n\tif baseURL == \"\" {\n\t\tbaseURL = \"http://\" + " + f.req + ".Host\n\t}\n\taddress, err := createCheckout(baseURL)\n\t" + nilFail + f.redirect('http.StatusSeeOther', 'address')));
      route('POST', '/api/checkout', 'checkout', guard);
    }
    if (login) {
      hs.push(handler(f, 'logOut', "if err := signOut(" + f.res + ", " + f.req + "); err != nil {\n\t\t" + f.fail.replace(/\n\t/g, '\n\t\t') + "\n\t}\n\t" + f.redirect('http.StatusSeeOther', '"/login"')));
      route('POST', '/logout', 'logOut');
    }
    if (own) {
      im.push('"errors"', '"strings"', '"golang.org/x/crypto/bcrypt"');
      var writeStatus = function (code) { return f.res + '.WriteHeader(' + code + ')'; };
      hs.push(handler(f, 'loginPage', f.page('login.html', '""')));
      hs.push("func logIn(email, password string, r *http.Request) error {\n\thash, err := tasks.FindPasswordHash(r.Context(), email)\n\tif err != nil {\n\t\treturn err\n\t}\n\tif hash == \"\" {\n\t\treturn errBadLogin\n\t}\n\tif bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) != nil {\n\t\treturn errBadLogin\n\t}\n\treturn nil\n}\n\nvar errBadLogin = errors.New(\"wrong email or password\")\n");
      hs.push(handler(f, 'logInForm', "email := strings.ToLower(strings.TrimSpace(" + f.form('email') + "))\n\terr := logIn(email, " + f.form('password') + ", " + f.req + ")\n\tif errors.Is(err, errBadLogin) {\n\t\t" + writeStatus('http.StatusUnauthorized') + "\n\t\t" + f.page('login.html', '"Wrong email or password."').replace(/\n\t/g, '\n\t\t') + "\n\t}\n\t" + nilFail + "if err := signIn(" + f.res + ", " + f.req + ", email); err != nil {\n\t\t" + f.fail.replace(/\n\t/g, '\n\t\t') + "\n\t}\n\t" + f.redirect('http.StatusSeeOther', '"/"')));
      hs.push(handler(f, 'signUpForm', "email := strings.ToLower(strings.TrimSpace(" + f.form('email') + "))\n\tpassword := " + f.form('password') + "\n\tif !strings.Contains(email, \"@\") || len(password) < 8 || len(password) > 72 {\n\t\t" + writeStatus('http.StatusBadRequest') + "\n\t\t" + f.page('login.html', '"Use a real email and a password of 8 to 72 characters."').replace(/\n\t/g, '\n\t\t') + "\n\t}\n\thash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)\n\t" + nilFail + "if err := tasks.AddUser(" + ctx + ", email, string(hash)); err != nil {\n\t\t" + writeStatus('http.StatusConflict') + "\n\t\t" + f.page('login.html', '"That email can\'t be used. Try logging in."').replace(/\n\t/g, '\n\t\t') + "\n\t}\n\tif err := signIn(" + f.res + ", " + f.req + ", email); err != nil {\n\t\t" + f.fail.replace(/\n\t/g, '\n\t\t') + "\n\t}\n\t" + f.redirect('http.StatusSeeOther', '"/"')));
      route('GET', '/login', 'loginPage'); route('POST', '/login', 'logInForm'); route('POST', '/signup', 'signUpForm');
    }
    if (oidc) {
      routes.push(a.framework === 'nethttp' ? 'mux.HandleFunc("GET /login", oidcStart)' : a.framework === 'gin' ? 'router.GET("/login", gin.WrapF(oidcStart))' : 'router.GET("/login", echo.WrapHandler(http.HandlerFunc(oidcStart)))');
      routes.push(a.framework === 'nethttp' ? 'mux.HandleFunc("GET /auth/callback", oidcCallback)' : a.framework === 'gin' ? 'router.GET("/auth/callback", gin.WrapF(oidcCallback))' : 'router.GET("/auth/callback", echo.WrapHandler(http.HandlerFunc(oidcCallback)))');
    }
    if (a.transport === 'sse') routes.push(a.framework === 'nethttp' ? 'mux.HandleFunc("GET /api/live", liveEvents)' : 'router.GET("/api/live", ' + wrapF('liveEvents') + ')');
    if (a.transport === 'websocket') routes.push(a.framework === 'nethttp' ? 'mux.HandleFunc("GET /live", liveSocket)' : 'router.GET("/live", ' + wrapF('liveSocket') + ')');
    if (a.transport === 'managed') routes.push(a.framework === 'nethttp' ? 'mux.HandleFunc("GET /api/live-token", liveToken)' : 'router.GET("/api/live-token", ' + wrapF('liveToken') + ')');

    // Guards, written the way each framework expects.
    if (login) {
      if (a.framework === 'nethttp') {
        hs.push("func requireUser(next http.HandlerFunc) http.HandlerFunc {\n\treturn func(w http.ResponseWriter, r *http.Request) {\n\t\tif currentEmail(r) == \"\" {\n\t\t\tblocked(w, r)\n\t\t\treturn\n\t\t}\n\t\tnext(w, r)\n\t}\n}\n");
        if (a.admin === 'in-app') hs.push("func requireAdmin(next http.HandlerFunc) http.HandlerFunc {\n\treturn func(w http.ResponseWriter, r *http.Request) {\n\t\temail := currentEmail(r)\n\t\tif email == \"\" {\n\t\t\tblocked(w, r)\n\t\t\treturn\n\t\t}\n\t\tif !isAdmin(email) {\n\t\t\thttp.Error(w, \"Not allowed\", http.StatusForbidden)\n\t\t\treturn\n\t\t}\n\t\tnext(w, r)\n\t}\n}\n");
      } else if (a.framework === 'gin') {
        hs.push("func requireUser(c *gin.Context) {\n\tif currentEmail(c.Request) == \"\" {\n\t\tblocked(c.Writer, c.Request)\n\t\tc.Abort()\n\t}\n}\n");
        if (a.admin === 'in-app') hs.push("func requireAdmin(c *gin.Context) {\n\temail := currentEmail(c.Request)\n\tif email == \"\" {\n\t\tblocked(c.Writer, c.Request)\n\t\tc.Abort()\n\t\treturn\n\t}\n\tif !isAdmin(email) {\n\t\tc.AbortWithStatus(http.StatusForbidden)\n\t}\n}\n");
      } else {
        hs.push("func requireUser(next echo.HandlerFunc) echo.HandlerFunc {\n\treturn func(c *echo.Context) error {\n\t\tif currentEmail(c.Request()) == \"\" {\n\t\t\tblocked(c.Response(), c.Request())\n\t\t\treturn nil\n\t\t}\n\t\treturn next(c)\n\t}\n}\n");
        if (a.admin === 'in-app') hs.push("func requireAdmin(next echo.HandlerFunc) echo.HandlerFunc {\n\treturn func(c *echo.Context) error {\n\t\temail := currentEmail(c.Request())\n\t\tif email == \"\" {\n\t\t\tblocked(c.Response(), c.Request())\n\t\t\treturn nil\n\t\t}\n\t\tif !isAdmin(email) {\n\t\t\treturn c.String(http.StatusForbidden, \"Not allowed\")\n\t\t}\n\t\treturn next(c)\n\t}\n}\n");
      }
    }

    // Shared helpers. Live updates and login are written with plain net/http, so they work the same in every framework.
    var needJson = a.framework === 'nethttp' && (isRest) || a.transport === 'managed';
    var needFail = a.framework !== 'echo' || oidc || a.transport === 'managed';
    var helpers = '';
    if (needJson) { im.push('"encoding/json"'); helpers += "func writeJSON(w http.ResponseWriter, status int, value any) {\n\tw.Header().Set(\"Content-Type\", \"application/json\")\n\tw.WriteHeader(status)\n\t_ = json.NewEncoder(w).Encode(value)\n}\n\n"; }
    if (needFail) { im.push('"log"'); helpers += "func fail(w http.ResponseWriter, r *http.Request, err error) {\n\tlog.Printf(\"%s %s: %v\", r.Method, r.URL.Path, err)\n\thttp.Error(w, \"Something went wrong\", http.StatusInternalServerError)\n}\n\n"; }
    if (pages) {
      im.push('"embed"', '"html/template"', '"log"');
      helpers += "//go:embed templates\nvar templateFiles embed.FS\n\nvar templates = template.Must(template.ParseFS(templateFiles, \"templates/*.html\"))\n\n";
      helpers += a.framework === 'echo'
        ? "func render(w http.ResponseWriter, name string, data any) error {\n\tw.Header().Set(\"Content-Type\", \"text/html; charset=utf-8\")\n\treturn templates.ExecuteTemplate(w, name, data)\n}\n\n"
        : "func render(w http.ResponseWriter, name string, data any) {\n\tw.Header().Set(\"Content-Type\", \"text/html; charset=utf-8\")\n\tif err := templates.ExecuteTemplate(w, name, data); err != nil {\n\t\tlog.Print(err)\n\t}\n}\n\n";
      if (a.framework === 'echo') im.splice(im.indexOf('"log"'), 1);
    }

    var routeBody = routes.map(function (r) { return '\t' + r; }).join('\n');
    var appFn;
    if (spa) routeBody += '\n\t' + (a.framework === 'nethttp' ? 'mux.Handle("/", http.FileServer(http.Dir("' + Kit.spaDistPath(a) + '")))' : a.framework === 'gin' ? 'router.NoRoute(gin.WrapH(http.FileServer(http.Dir("' + Kit.spaDistPath(a) + '"))))' : 'router.GET("/*", echo.WrapHandler(http.FileServer(http.Dir("' + Kit.spaDistPath(a) + '"))))');
    if (a.framework === 'nethttp') appFn = "func appHandler() http.Handler {\n\tmux := http.NewServeMux()\n" + routeBody + "\n\treturn http.NewCrossOriginProtection().Handler(mux)\n}\n";
    else if (a.framework === 'gin') appFn = "func appHandler() http.Handler {\n\trouter := gin.Default()\n" + routeBody + "\n\treturn http.NewCrossOriginProtection().Handler(router)\n}\n";
    else { im.push('"github.com/labstack/echo/v5/middleware"'); appFn = "func appHandler() http.Handler {\n\trouter := echo.New()\n\trouter.Use(middleware.RequestLogger())\n\trouter.Use(middleware.Recover())\n" + routeBody + "\n\treturn http.NewCrossOriginProtection().Handler(router)\n}\n"; }

    var appCode = 'package main\n\n' + imports(im) + '\n' + helpers + appFn + '\n' + hs.join('\n');
    var appLines = [
      ['func appHandler', 'Builds the whole app in one place, so tests can use it without opening a fixed port.'],
      [a.framework === 'nethttp' ? 'http.NewServeMux' : a.framework === 'gin' ? 'gin.Default' : 'echo.New', a.framework === 'nethttp' ? 'Go\'s built-in router. Patterns can include the method and named parts, such as <code>GET /api/tasks/{id}</code>.' : a.framework === 'gin' ? 'Creates a router that already logs requests and recovers from crashes.' : 'Creates a router. The next two lines add request logging and crash recovery.'],
      ['NewCrossOriginProtection', 'Rejects form posts and other changes that come from other sites, using headers the browser sets. It\'s built into Go 1.25.']
    ].concat(a.framework !== 'nethttp' && (a.transport && a.transport !== 'managed' || login) ? [['Wrap', a.framework === 'gin' ? '<code>gin.WrapF</code> runs a plain Go handler inside Gin.' : '<code>echo.WrapHandler</code> runs a plain Go handler inside Echo.']] : [])
     .concat(needFail ? [['func fail', 'Logs what went wrong and shows the visitor a plain message, so internal details stay private.']] : [])
     .concat(pages ? [['go:embed', 'Builds your templates into the compiled program, so you deploy one file.'], ['template.Must', 'Stops at startup if a template has a mistake, instead of failing later.'], ['ExecuteTemplate', 'Fills in a template and sends the HTML.']] : [])
     .concat(isRest ? [
       [f.bind.split('(')[0], 'Reads the JSON request body into <code>body</code>.'],
       ['len([]rune(title))', 'Counts characters rather than bytes, so accented letters count once.'],
       ['Content-Range', 'Tells clients how many rows exist. React-admin needs this.'],
       ['StatusCreated', 'The standard status for &quot;created&quot;.']
     ] : [])
     .concat(isGql ? [['handler.New', 'Creates the GraphQL server from the generated code.'], ['transport.POST', 'Accepts queries sent as POST requests, which is what your frontend uses.']] : [])
     .concat(templates ? [['list.html', 'Returns only the list, because htmx swaps just that part of the page.'], ['== "on"', 'A checked checkbox sends <code>on</code>, and an unchecked one sends nothing.']] : [])
     .concat(login ? [['requireUser', 'Runs before a protected route, and stops the request if nobody is logged in.'], ['logOut', 'Ends the session and clears the cookie. It\'s a POST so other sites can\'t log someone out with a link.']] : [])
     .concat(own ? [['bcrypt.CompareHashAndPassword', 'Checks a password against the stored hash.'], ['bcrypt.GenerateFromPassword', 'Scrambles a new password. Bcrypt only reads the first 72 bytes, so longer passwords are refused.']] : [])
     .concat(a.admin === 'in-app' ? [['requireAdmin', 'Checks on the server. Hiding a link isn\'t protection, because anyone can type a URL.'], ['StatusSeeOther', 'Sends the browser to another page after the change, so refreshing doesn\'t repeat it.']] : [])
     .concat(a.payment ? [['PUBLIC_URL', 'Your site\'s real address. Set this in production, because the <code>Host</code> header can be forged.']] : [])
     .concat(spa ? [['FileServer', 'Serves your built frontend from the same server in production.']] : []);
    appItems.push({ file: 'app.go', lang: 'go', code: appCode, lines: appLines });
    appItems.push({ file: 'main.go', lang: 'go', code: "package main\n\nimport (\n\t\"log\"\n\t\"net/http\"\n\t\"os\"\n\n\t\"demo/tasks\"\n)\n\nfunc main() {\n\tif err := tasks.Open(os.Getenv(\"DATABASE_URL\")); err != nil {\n\t\tlog.Fatal(err)\n\t}\n\tdefer tasks.Close()\n\tport := os.Getenv(\"PORT\")\n\tif port == \"\" {\n\t\tport = \"3000\"\n\t}\n\tlog.Printf(\"Listening on http://localhost:%s\", port)\n\tlog.Fatal(http.ListenAndServe(\":\"+port, appHandler()))\n}\n", lines: [['func main', 'Where the program starts.'], ['log.Fatal', 'Prints the error and stops.'], ['PORT', 'Hosting platforms choose the port and pass it this way. 3000 is the default for your own machine.'], ['ListenAndServe', 'Starts accepting requests. Each one runs in its own goroutine.']] });
    s.push({ id: 'app', title: 'Write the app', items: appItems });

    // Templates
    if (pages) {
      var v = [];
      if (templates) {
        var liveScript = a.transport === 'sse' ? "<script>new EventSource('/api/live').onmessage = () => htmx.trigger('#list', 'reload');</script>\n" : a.transport === 'websocket' ? "<script>\n  const scheme = location.protocol === 'https:' ? 'wss://' : 'ws://';\n  new WebSocket(scheme + location.host + '/live').onmessage = () => htmx.trigger('#list', 'reload');\n</script>\n" : a.transport === 'managed' ? "<script src=\"https://cdn.ably.com/lib/ably.min-2.js\"></script>\n<script>\n  new Ably.Realtime({ authUrl: '/api/live-token' }).channels.get('tasks').subscribe(() => htmx.trigger('#list', 'reload'));\n</script>\n" : '';
        v.push({ file: 'templates/index.html', lang: 'html', code: "<!doctype html>\n<html lang=\"en\">\n<meta charset=\"utf-8\">\n<title>Tasks</title>\n<script src=\"https://unpkg.com/htmx.org@2.0.11\"></script>\n<h1>Tasks</h1>\n" + (login ? "<form method=\"post\" action=\"/logout\"><button>Log out</button></form>\n" : '') + (a.payment ? "<form method=\"post\" action=\"/api/checkout\"><button>Buy example product</button></form>\n" : '') + "<form hx-post=\"/tasks\" hx-target=\"#list\" hx-on::after-request=\"this.reset()\">\n  <input name=\"title\" maxlength=\"200\" required>\n  <button>Add</button>\n</form>\n<div id=\"list\" hx-get=\"/tasks\" hx-trigger=\"reload\">{{template \"list.html\" .}}</div>\n" + liveScript + "</html>\n", lines: [
          ['htmx', 'A small library that lets HTML attributes make requests and update part of the page.'],
          ['hx-post', 'Submits the form to this URL without reloading the page.'],
          ['hx-target', 'Replaces this element with the response.'],
          ['hx-on::after-request', 'Clears the form after it submits.'],
          ['{{template "list.html" .}}', 'Inserts another template, and passes it this page\'s data.']
        ].concat(a.transport ? [['hx-trigger="reload"', 'Lets the live-update script ask for a fresh list.']] : []) });
        v.push({ file: 'templates/list.html', lang: 'html', code: "<ul>\n  {{range .}}\n    <li>\n      <label>\n        <input type=\"checkbox\" name=\"done\" {{if .Done}}checked{{end}} hx-post=\"/tasks/{{.ID}}/toggle\" hx-target=\"#list\">\n        {{.Title}}\n      </label>\n    </li>\n  {{end}}\n</ul>\n", lines: [
          ['{{range .}}', 'Repeats this part for each task. Inside it, <code>.</code> means the current task.'],
          ['{{.Title}}', 'Prints a value and escapes it, so a title can\'t inject HTML or scripts. <code>html/template</code> does this by itself.']
        ] });
      }
      if (own) v.push({ file: 'templates/login.html', lang: 'html', code: "<!doctype html>\n<html lang=\"en\">\n<meta charset=\"utf-8\">\n<title>Log in</title>\n<h1>Log in or sign up</h1>\n{{if .}}<p role=\"alert\">{{.}}</p>{{end}}\n<form method=\"post\">\n  <label>Email <input name=\"email\" type=\"email\" required></label>\n  <label>Password <input name=\"password\" type=\"password\" minlength=\"8\" maxlength=\"72\" required></label>\n  <button formaction=\"/login\">Log in</button>\n  <button formaction=\"/signup\">Sign up</button>\n</form>\n</html>\n", lines: [['formaction', 'Each button posts the same form to a different URL.'], ['{{if .}}', 'Only shows the message when there is one.']] });
      if (a.admin === 'in-app') v.push({ file: 'templates/admin.html', lang: 'html', code: "<!doctype html>\n<html lang=\"en\">\n<meta charset=\"utf-8\">\n<title>Admin</title>\n<h1>Admin: all tasks</h1>\n<table>\n  {{range .}}\n    <tr>\n      <td>{{.Title}}</td>\n      <td>{{if .Done}}Done{{else}}Open{{end}}</td>\n      <td><form method=\"post\" action=\"/admin/tasks/{{.ID}}/delete\"><button>Delete</button></form></td>\n    </tr>\n  {{end}}\n</table>\n</html>\n", lines: [['form method="post"', 'Deleting uses POST, so a link or a search engine can\'t trigger it.'], ['/admin', 'A small page rendered by the server, whichever frontend you chose. The admin check runs on the server.']] });
      s.push({ id: 'views', title: templates ? 'Write the pages' : 'Write the pages it needs', items: v });
    }
    if (spa) s.push({ id: 'frontend', title: 'Build the frontend', items: Kit.spaItems(a, 3000) });
    if (a.admin === 'low-code') s.push({ id: 'admin', title: 'Add the admin tool', items: Kit.lowCodeItems(a) });

    // Tests
    var testImports = ['"net/http"', '"net/http/httptest"', '"os"', '"testing"', '"demo/tasks"'];
    if (!login && (isRest || isGql || templates)) testImports.push('"io"', '"strings"');
    var t = "\nvar server *httptest.Server\n\nfunc TestMain(m *testing.M) {\n\tif err := tasks.Open(os.Getenv(\"DATABASE_URL\")); err != nil {\n\t\tpanic(err)\n\t}\n\tserver = httptest.NewServer(appHandler())\n\tcode := m.Run()\n\tserver.Close()\n\ttasks.Close()\n\tos.Exit(code)\n}\n\nfunc TestDataLayerSavesAndChangesATask(t *testing.T) {\n\tctx := t.Context()\n\ttask, err := tasks.Add(ctx, \"From the test\")\n\tif err != nil {\n\t\tt.Fatal(err)\n\t}\n\tif err := tasks.SetDone(ctx, task.ID, true); err != nil {\n\t\tt.Fatal(err)\n\t}\n\tlist, err := tasks.List(ctx)\n\tif err != nil {\n\t\tt.Fatal(err)\n\t}\n\tfor _, saved := range list {\n\t\tif saved.ID == task.ID && saved.Done {\n\t\t\treturn\n\t\t}\n\t}\n\tt.Error(\"the change wasn't saved\")\n}\n";
    var post = function (path, ctype, body) { return 'http.Post(server.URL+"' + path + '", "' + ctype + '", strings.NewReader(`' + body + '`))'; };
    if (login) {
      testImports.push('"strings"');
      var probe = isRest ? '/api/tasks' : isGql ? '/graphql' : '/tasks';
      t += "\nfunc TestLoggedOutVisitorsAreBlocked(t *testing.T) {\n\tres, err := " + post(probe, 'application/json', '{}') + "\n\tif err != nil {\n\t\tt.Fatal(err)\n\t}\n\tdefer res.Body.Close()\n\tif res.StatusCode != http.StatusUnauthorized {\n\t\tt.Errorf(\"got status %d\", res.StatusCode)\n\t}\n}\n";
    } else if (isRest) {
      t += "\nfunc TestRestAPIAddsAndLists(t *testing.T) {\n\tres, err := " + post('/api/tasks', 'application/json', '{"title":"Through the API"}') + "\n\tif err != nil {\n\t\tt.Fatal(err)\n\t}\n\tdefer res.Body.Close()\n\tif res.StatusCode != http.StatusCreated {\n\t\tt.Fatalf(\"got status %d\", res.StatusCode)\n\t}\n\tlist, err := http.Get(server.URL + \"/api/tasks\")\n\tif err != nil {\n\t\tt.Fatal(err)\n\t}\n\tdefer list.Body.Close()\n\tbody, _ := io.ReadAll(list.Body)\n\tif !strings.Contains(string(body), \"Through the API\") {\n\t\tt.Errorf(\"got %s\", body)\n\t}\n\tif list.Header.Get(\"Content-Range\") == \"\" {\n\t\tt.Error(\"no Content-Range header\")\n\t}\n}\n\nfunc TestEmptyTitleIsRejected(t *testing.T) {\n\tres, err := " + post('/api/tasks', 'application/json', '{"title":"   "}') + "\n\tif err != nil {\n\t\tt.Fatal(err)\n\t}\n\tdefer res.Body.Close()\n\tif res.StatusCode != http.StatusBadRequest {\n\t\tt.Errorf(\"got status %d\", res.StatusCode)\n\t}\n}\n";
    } else if (isGql) {
      t += "\nfunc TestGraphQLAddsAndLists(t *testing.T) {\n\tres, err := " + post('/graphql', 'application/json', '{"query":"mutation { addTask(title: \\"Through GraphQL\\") { id } }"}') + "\n\tif err != nil {\n\t\tt.Fatal(err)\n\t}\n\tres.Body.Close()\n\tlist, err := " + post('/graphql', 'application/json', '{"query":"{ tasks { title } }"}') + "\n\tif err != nil {\n\t\tt.Fatal(err)\n\t}\n\tdefer list.Body.Close()\n\tbody, _ := io.ReadAll(list.Body)\n\tif !strings.Contains(string(body), \"Through GraphQL\") {\n\t\tt.Errorf(\"got %s\", body)\n\t}\n}\n";
    }
    if (templates && !login) {
      t += "\nfunc TestPageEscapesTitles(t *testing.T) {\n\tres, err := " + post('/tasks', 'application/x-www-form-urlencoded', 'title=%3Cb%3EFrom+a+form%3C%2Fb%3E') + "\n\tif err != nil {\n\t\tt.Fatal(err)\n\t}\n\tres.Body.Close()\n\tpage, err := http.Get(server.URL + \"/\")\n\tif err != nil {\n\t\tt.Fatal(err)\n\t}\n\tdefer page.Body.Close()\n\tbody, _ := io.ReadAll(page.Body)\n\tif !strings.Contains(string(body), \"&lt;b&gt;From a form&lt;/b&gt;\") {\n\t\tt.Errorf(\"got %s\", body)\n\t}\n}\n";
    }
    if (a.admin === 'in-app') {
      t += "\nfunc TestAdminPageNeedsALogin(t *testing.T) {\n\tclient := &http.Client{CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}\n\treq, _ := http.NewRequest(http.MethodGet, server.URL+\"/admin\", nil)\n\treq.Header.Set(\"Accept\", \"text/html\")\n\tres, err := client.Do(req)\n\tif err != nil {\n\t\tt.Fatal(err)\n\t}\n\tdefer res.Body.Close()\n\tif res.StatusCode != http.StatusFound {\n\t\tt.Errorf(\"got status %d\", res.StatusCode)\n\t}\n}\n";
    }
    s.push({ id: 'test', title: 'Test it', items: [
      { file: 'app_test.go', lang: 'go', code: 'package main\n\n' + imports(testImports) + t, lines: [
        ['TestMain', 'Runs once around all the tests, to connect to the database and start the app.'],
        ['httptest.NewServer', 'Starts your app on a free port, so tests never clash with a running server.'],
        ['t.Error and t.Fatal', 'Mark a test as failed. <code>Fatal</code> also stops that test.']
      ] },
      { cmd: 'go mod tidy\ngo vet ./...\ngo test ./...', lines: [['go mod tidy', 'Downloads anything your code imports, and removes what it doesn\'t.'], ['go vet', 'Finds common mistakes that still compile.'], ['go test', 'Runs the tests. They use whichever database <code>DATABASE_URL</code> points at, so use a development database.']] },
      { p: 'Then start it with the command below and open <code>http://localhost:3000</code>.' + (spa ? ' For the frontend, also run <code>npm run dev</code> inside <code>web</code>, and open the address it prints.' : '') },
      { cmd: 'go run .', manual: true, lines: [['go run .', 'Compiles and starts your app. Press Ctrl+C to stop it. Unlike the other tools here, it doesn\'t restart when you save, so run it again after a change.']] }
    ] });

    var envList = ['DATABASE_URL'];
    if (login) envList.push('SESSION_SECRET', 'ADMIN_EMAILS');
    if (oidc) envList.push('PUBLIC_URL', 'OIDC_ISSUER', 'OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET');
    if (a.transport === 'managed') envList.push('ABLY_API_KEY');
    if (a.payment) { if (envList.indexOf('PUBLIC_URL') < 0) envList.push('PUBLIC_URL'); Kit.PAYMENT[a.payment].env.forEach(function (e) { envList.push(e[0]); }); }
    var spaBuild = spa ? "FROM node:24-slim AS frontend\nWORKDIR /web\nCOPY web/package*.json ./\nRUN npm ci\nCOPY web/ ./\nRUN npm run build\n\n" : '';
    var docker = spaBuild + "FROM golang:1.27 AS build\nWORKDIR /src\nCOPY go.mod go.sum ./\nRUN go mod download\nCOPY . .\nRUN CGO_ENABLED=0 go build -o /app .\n\nFROM gcr.io/distroless/static-debian12:nonroot\nWORKDIR /srv\nCOPY --from=build /app /srv/app\n" + (spa ? "COPY --from=frontend /web/dist /srv/web/dist\n" : '') + "ENV APP_ENV=production\nEXPOSE 3000\nCMD [\"/srv/app\"]\n";
    s.push({ id: 'deploy', title: 'Deploy it', items: Kit.hostingItems(a, { port: 3000, env: envList, dockerfile: docker, dockerignore: 'demo\ndemo.exe\nweb/node_modules\nweb/dist\n.git\n.env\n*.db\n', dockerLines: [
      ['AS build', 'A first stage compiles your program with the full Go tools. Only the finished program goes into the final image.'],
      ['CGO_ENABLED=0', 'Builds a program with no outside dependencies, so it runs in a very small image.'],
      ['distroless', 'A minimal image with no shell or package manager, and <code>nonroot</code> runs as a limited user.']
    ].concat(spa ? [['AS frontend', 'Another stage builds the frontend, and only its finished files are copied in.']] : []).concat([
      ['APP_ENV=production', 'Turns on HTTPS-only cookies in this guide\'s login code.'],
      ['CMD', 'What runs when the container starts.']
    ]) }) });
    return s;
  }
  Kit.frameworks.nethttp = goGuide;
  Kit.frameworks.gin = goGuide;
  Kit.frameworks.echo = goGuide;
})(StackKit);
