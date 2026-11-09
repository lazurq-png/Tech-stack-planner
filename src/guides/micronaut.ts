// @ts-nocheck -- moved from the single-file page; types are added module by module.
import { StackKit } from '../stack-kit';

// Guide for Micronaut, with Maven or Gradle. Payments and Ably share their Java code with the Quarkus guide.
(function (Kit) {
  var J = 'src/main/java/org/acme/';
  var JDBC = {
    postgresql: ['postgres', 'jdbc:postgresql://localhost:5432/demo', 'POSTGRES'],
    mysql: ['mysql', 'jdbc:mysql://localhost:3306/demo', 'MYSQL'],
    sqlserver: ['sqlserver', 'jdbc:sqlserver://localhost:1433;databaseName=demo;trustServerCertificate=true', 'SQLSERVER'],
    h2: ['h2', 'jdbc:h2:file:./demo-db', 'H2']
  };
  function ddlDb(db) { return db === 'h2' ? 'postgresql' : db; }
  function usersDdl(db) { return Kit.ddlUsers(ddlDb(db)).replace(/,\n  role[^\n]*/, ''); }
  var NUMBER = '    private static Integer number(String id) {\n        try {\n            return Integer.valueOf(id);\n        } catch (NumberFormatException e) {\n            return null;\n        }\n    }\n';
  var NUMBER_LINE = ['number', 'Text that isn\'t a number can\'t be any task, so it does nothing.'];

  function storeItems(a, own) {
    var db = a.database, items = [];
    if (db === 'mongodb') {
      items.push({ file: J + 'TaskStore.java', lang: 'java', code: 'package org.acme;\n\nimport com.mongodb.ConnectionString;\nimport com.mongodb.client.MongoClient;\nimport com.mongodb.client.MongoCollection;\nimport com.mongodb.client.model.Filters;\nimport com.mongodb.client.model.IndexOptions;\nimport com.mongodb.client.model.Sorts;\nimport com.mongodb.client.model.Updates;\nimport io.micronaut.context.annotation.Value;\nimport jakarta.inject.Singleton;\nimport java.util.ArrayList;\nimport java.util.List;\nimport org.bson.Document;\nimport org.bson.types.ObjectId;\n\n@Singleton\npublic class TaskStore {\n    private final MongoCollection<Document> tasks;\n' + (own ? '    private final MongoCollection<Document> users;\n' : '') + '\n    TaskStore(MongoClient client, @Value("${mongodb.uri}") String address) {\n        var database = client.getDatabase(new ConnectionString(address).getDatabase());\n        tasks = database.getCollection("tasks");\n' + (own ? '        users = database.getCollection("users");\n        users.createIndex(new Document("email", 1), new IndexOptions().unique(true));\n' : '') + '    }\n\n    public List<Task> list() {\n        var result = new ArrayList<Task>();\n        for (var doc : tasks.find().sort(Sorts.ascending("_id"))) {\n            result.add(new Task(doc.getObjectId("_id").toHexString(), doc.getString("title"), doc.getBoolean("done")));\n        }\n        return result;\n    }\n\n    public Task add(String title) {\n        var doc = new Document("title", title).append("done", false);\n        tasks.insertOne(doc);\n        return new Task(doc.getObjectId("_id").toHexString(), title, false);\n    }\n\n    public void setDone(String id, boolean done) {\n        if (ObjectId.isValid(id)) {\n            tasks.updateOne(Filters.eq("_id", new ObjectId(id)), Updates.set("done", done));\n        }\n    }\n\n    public void delete(String id) {\n        if (ObjectId.isValid(id)) {\n            tasks.deleteOne(Filters.eq("_id", new ObjectId(id)));\n        }\n    }\n' + (own ? '\n    public String findPasswordHash(String email) {\n        var doc = users.find(Filters.eq("email", email)).first();\n        return doc == null ? null : doc.getString("password_hash");\n    }\n\n    public void addUser(String email, String hash) {\n        users.insertOne(new Document("email", email).append("password_hash", hash));\n    }\n' : '') + '}\n', lines: [
        ['@Singleton', 'Micronaut creates one copy of this class and hands it to whatever asks for it.'],
        ['MongoClient', 'Micronaut creates this from the address in your settings, and passes it to the constructor.'],
        ['getDatabase', 'Uses the database named in the address.'],
        ['ObjectId.isValid', 'Text that isn\'t a valid ID can\'t be any task, so it does nothing.']
      ].concat(own ? [['unique(true)', 'Stops two accounts from using the same email.']] : []) });
      return items;
    }
    if (a.data === 'jpa') {
      items.push({ file: J + 'TaskEntity.java', lang: 'java', code: 'package org.acme;\n\nimport io.micronaut.core.annotation.Introspected;\nimport jakarta.persistence.Entity;\nimport jakarta.persistence.GeneratedValue;\nimport jakarta.persistence.GenerationType;\nimport jakarta.persistence.Id;\nimport jakarta.persistence.Table;\n\n@Entity\n@Introspected(accessKind = Introspected.AccessKind.FIELD)\n@Table(name = "tasks")\npublic class TaskEntity {\n    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)\n    public Integer id;\n\n    public String title;\n\n    public boolean done;\n}\n', lines: [['@Entity', 'Tells Hibernate this class matches a table, so one object is one row.'], ['@Introspected', 'Micronaut prepares this class when it compiles, instead of inspecting it at runtime. <code>FIELD</code> tells it to use the public fields, as this class has no getters.'], ['@GeneratedValue', 'The database numbers each row.']] });
      if (own) items.push({ file: J + 'UserEntity.java', lang: 'java', code: 'package org.acme;\n\nimport io.micronaut.core.annotation.Introspected;\nimport jakarta.persistence.Column;\nimport jakarta.persistence.Entity;\nimport jakarta.persistence.GeneratedValue;\nimport jakarta.persistence.GenerationType;\nimport jakarta.persistence.Id;\nimport jakarta.persistence.Table;\n\n@Entity\n@Introspected(accessKind = Introspected.AccessKind.FIELD)\n@Table(name = "users")\npublic class UserEntity {\n    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)\n    public Integer id;\n\n    public String email;\n\n    @Column(name = "password_hash")\n    public String passwordHash;\n}\n', lines: [['@Column', 'Names the column when it differs from the field.']] });
      items.push({ file: J + 'TaskRepository.java', lang: 'java', code: 'package org.acme;\n\nimport io.micronaut.data.annotation.Repository;\nimport io.micronaut.data.repository.CrudRepository;\nimport java.util.List;\n\n@Repository\npublic interface TaskRepository extends CrudRepository<TaskEntity, Integer> {\n    List<TaskEntity> findAllOrderById();\n}\n', lines: [['@Repository', 'Micronaut Data writes the code behind this interface when it compiles.'], ['CrudRepository', 'Adds common methods such as <code>save</code>, <code>findById</code> and <code>deleteById</code>.'], ['findAllOrderById', 'Micronaut Data reads the method\'s name and writes the query, so a mistyped name fails to compile.']] });
      if (own) items.push({ file: J + 'UserRepository.java', lang: 'java', code: 'package org.acme;\n\nimport io.micronaut.data.annotation.Repository;\nimport io.micronaut.data.repository.CrudRepository;\nimport java.util.Optional;\n\n@Repository\npublic interface UserRepository extends CrudRepository<UserEntity, Integer> {\n    Optional<UserEntity> findByEmail(String email);\n}\n', lines: [['findByEmail', 'Micronaut Data writes this query from the name too.']] });
      items.push({ file: J + 'TaskStore.java', lang: 'java', code: 'package org.acme;\n\nimport jakarta.inject.Singleton;\nimport jakarta.transaction.Transactional;\nimport java.util.List;\n\n@Singleton\npublic class TaskStore {\n    private final TaskRepository tasks;\n' + (own ? '    private final UserRepository users;\n' : '') + '\n    TaskStore(TaskRepository tasks' + (own ? ', UserRepository users' : '') + ') {\n        this.tasks = tasks;\n' + (own ? '        this.users = users;\n' : '') + '    }\n\n    private static Task toTask(TaskEntity row) {\n        return new Task(String.valueOf(row.id), row.title, row.done);\n    }\n\n' + NUMBER + '\n    public List<Task> list() {\n        return tasks.findAllOrderById().stream().map(TaskStore::toTask).toList();\n    }\n\n    public Task add(String title) {\n        var row = new TaskEntity();\n        row.title = title;\n        return toTask(tasks.save(row));\n    }\n\n    @Transactional\n    public void setDone(String id, boolean done) {\n        var key = number(id);\n        if (key != null) {\n            tasks.findById(key).ifPresent(row -> {\n                row.done = done;\n                tasks.update(row);\n            });\n        }\n    }\n\n    public void delete(String id) {\n        var key = number(id);\n        if (key != null) {\n            tasks.deleteById(key);\n        }\n    }\n' + (own ? '\n    public String findPasswordHash(String email) {\n        return users.findByEmail(email).map(user -> user.passwordHash).orElse(null);\n    }\n\n    public void addUser(String email, String hash) {\n        var user = new UserEntity();\n        user.email = email;\n        user.passwordHash = hash;\n        users.save(user);\n    }\n' : '') + '}\n', lines: [['@Singleton', 'Micronaut creates one copy of this class and hands it to whatever asks for it.'], ['TaskStore(', 'Micronaut calls this constructor and passes what it asks for.'], ['@Transactional', 'Runs the method as one all-or-nothing change.'], NUMBER_LINE] });
      return items;
    }
    if (a.data === 'jooq') {
      var returning = db === 'mysql'
        ? '        dsl.insertInto(TASKS, TITLE).values(title).execute();\n        return new Task(String.valueOf(dsl.lastID()), title, false);\n'
        : '        var id = dsl.insertInto(TASKS, TITLE).values(title).returningResult(ID).fetchOne(ID);\n        return new Task(String.valueOf(id), title, false);\n';
      items.push({ file: J + 'TaskStore.java', lang: 'java', code: 'package org.acme;\n\nimport static org.jooq.impl.DSL.field;\nimport static org.jooq.impl.DSL.table;\n\nimport jakarta.inject.Singleton;\nimport java.util.List;\nimport org.jooq.DSLContext;\nimport org.jooq.Field;\nimport org.jooq.Table;\n\n@Singleton\npublic class TaskStore {\n    private static final Table<?> TASKS = table("tasks");\n    private static final Field<Integer> ID = field("id", Integer.class);\n    private static final Field<String> TITLE = field("title", String.class);\n    private static final Field<Boolean> DONE = field("done", Boolean.class);\n' + (own ? '    private static final Table<?> USERS = table("users");\n    private static final Field<String> EMAIL = field("email", String.class);\n    private static final Field<String> HASH = field("password_hash", String.class);\n' : '') + '\n    private final DSLContext dsl;\n\n    TaskStore(DSLContext dsl) {\n        this.dsl = dsl;\n    }\n\n' + NUMBER + '\n    public List<Task> list() {\n        return dsl.select(ID, TITLE, DONE).from(TASKS).orderBy(ID).fetch(row -> new Task(String.valueOf(row.get(ID)), row.get(TITLE), row.get(DONE)));\n    }\n\n    public Task add(String title) {\n' + (db === 'mysql' ? '        return dsl.transactionResult(config -> {\n            var tx = org.jooq.impl.DSL.using(config);\n            tx.insertInto(TASKS, TITLE).values(title).execute();\n            return new Task(String.valueOf(tx.lastID()), title, false);\n        });\n' : returning) + '    }\n\n    public void setDone(String id, boolean done) {\n        var key = number(id);\n        if (key != null) {\n            dsl.update(TASKS).set(DONE, done).where(ID.eq(key)).execute();\n        }\n    }\n\n    public void delete(String id) {\n        var key = number(id);\n        if (key != null) {\n            dsl.deleteFrom(TASKS).where(ID.eq(key)).execute();\n        }\n    }\n' + (own ? '\n    public String findPasswordHash(String email) {\n        return dsl.select(HASH).from(USERS).where(EMAIL.eq(email)).fetchOne(HASH);\n    }\n\n    public void addUser(String email, String hash) {\n        dsl.insertInto(USERS, EMAIL, HASH).values(email, hash).execute();\n    }\n' : '') + '}\n', lines: [
        ['DSLContext', 'jOOQ\'s main object. Micronaut connects it to your database.'],
        ['table("tasks")', 'Names the table and columns. jOOQ can also generate these from your database, which adds compile-time checking.'],
        ['dsl.select', 'Reads like the SQL it runs. Values are passed safely as parameters.'],
        NUMBER_LINE
      ] });
      return items;
    }
    // MyBatis
    items.push({ file: J + 'TaskMapper.java', lang: 'java', code: 'package org.acme;\n\nimport java.util.List;\nimport org.apache.ibatis.annotations.Delete;\nimport org.apache.ibatis.annotations.Insert;\nimport org.apache.ibatis.annotations.Options;\nimport org.apache.ibatis.annotations.Param;\nimport org.apache.ibatis.annotations.Select;\nimport org.apache.ibatis.annotations.Update;\n\npublic interface TaskMapper {\n    class Row {\n        public Integer id;\n        public String title;\n        public boolean done;\n    }\n\n    @Select("select id, title, done from tasks order by id")\n    List<Row> list();\n\n    @Insert("insert into tasks (title) values (#{title})")\n    @Options(useGeneratedKeys = true, keyProperty = "id")\n    void add(Row row);\n\n    @Update("update tasks set done = #{done} where id = #{id}")\n    void setDone(@Param("id") int id, @Param("done") boolean done);\n\n    @Delete("delete from tasks where id = #{id}")\n    void delete(@Param("id") int id);\n' + (own ? '\n    @Select("select password_hash from users where email = #{email}")\n    String findPasswordHash(@Param("email") String email);\n\n    @Insert("insert into users (email, password_hash) values (#{email}, #{hash})")\n    void addUser(@Param("email") String email, @Param("hash") String hash);\n' : '') + '}\n', lines: [['@Select and friends', 'The SQL that runs when you call the method.'], ['#{title}', 'A placeholder. The value travels separately from the SQL, which prevents SQL injection.'], ['useGeneratedKeys', 'Copies the ID the database created into the object.']] });
    items.push({ file: J + 'MyBatisSetup.java', lang: 'java', code: 'package org.acme;\n\nimport io.micronaut.configuration.mybatis.MyBatisConfigurationCustomizer;\nimport jakarta.inject.Named;\nimport jakarta.inject.Singleton;\nimport org.apache.ibatis.session.Configuration;\n\n@Singleton\n@Named("default")\npublic class MyBatisSetup implements MyBatisConfigurationCustomizer {\n    @Override\n    public void customize(Configuration configuration) {\n        configuration.addMapper(TaskMapper.class);\n    }\n}\n', lines: [['MyBatisConfigurationCustomizer', 'Micronaut sets up MyBatis for you, and calls this so you can add to its settings.'], ['@Named("default")', 'Ties this to your <code>default</code> database. Micronaut only calls it with that name.'], ['addMapper', 'Tells MyBatis about your queries.']] });
    items.push({ file: J + 'TaskStore.java', lang: 'java', code: 'package org.acme;\n\nimport jakarta.inject.Singleton;\nimport java.util.List;\nimport java.util.function.Function;\nimport org.apache.ibatis.session.SqlSessionFactory;\n\n@Singleton\npublic class TaskStore {\n    private final SqlSessionFactory sessions;\n\n    TaskStore(SqlSessionFactory sessions) {\n        this.sessions = sessions;\n    }\n\n    private <T> T run(Function<TaskMapper, T> work) {\n        try (var session = sessions.openSession(true)) {\n            return work.apply(session.getMapper(TaskMapper.class));\n        }\n    }\n\n' + NUMBER + '\n    public List<Task> list() {\n        return run(TaskMapper::list).stream().map(row -> new Task(String.valueOf(row.id), row.title, row.done)).toList();\n    }\n\n    public Task add(String title) {\n        var row = new TaskMapper.Row();\n        row.title = title;\n        run(mapper -> {\n            mapper.add(row);\n            return null;\n        });\n        return new Task(String.valueOf(row.id), title, false);\n    }\n\n    public void setDone(String id, boolean done) {\n        var key = number(id);\n        if (key != null) {\n            run(mapper -> {\n                mapper.setDone(key, done);\n                return null;\n            });\n        }\n    }\n\n    public void delete(String id) {\n        var key = number(id);\n        if (key != null) {\n            run(mapper -> {\n                mapper.delete(key);\n                return null;\n            });\n        }\n    }\n' + (own ? '\n    public String findPasswordHash(String email) {\n        return run(mapper -> mapper.findPasswordHash(email));\n    }\n\n    public void addUser(String email, String hash) {\n        run(mapper -> {\n            mapper.addUser(email, hash);\n            return null;\n        });\n    }\n' : '') + '}\n', lines: [['openSession(true)', 'Opens a connection that saves each change as soon as it runs.'], ['try (', 'Closes the connection when this block ends, however it ends.'], NUMBER_LINE] });
    return items;
  }

  // The generated pom.xml has its project libraries in the first dependencies block.
  function addLibrary(gradle, group, artifact, version) {
    if (gradle) return Kit.javaLibrary(true, group, artifact, version);
    return "sed -i '0,/<dependencies>/ s#<dependencies>#<dependencies>\\n    <dependency>\\n      <groupId>" + group + "</groupId>\\n      <artifactId>" + artifact + "</artifactId>" + (version ? '\\n      <version>' + version + '</version>' : '') + "\\n    </dependency>#' pom.xml";
  }

  function micronaut(a) {
    var gradle = a.build === 'gradle', s = [];
    var spa = Kit.isSpa(a), templates = a.frontend === 'server-templates', login = !!a.login, oidc = Kit.usesOidc(a), own = a.login === 'own';
    var isRest = a.api === 'rest', isGql = a.api === 'graphql', mongo = a.database === 'mongodb';
    var pages = templates || a.admin === 'in-app' || own;
    var buildCmd = gradle ? './gradlew build' : './mvnw package';
    var devCmd = gradle ? './gradlew run' : './mvnw mn:run';
    var jar = gradle ? 'build/libs/demo-0.1-all.jar' : 'target/demo-0.1.jar';

    s.push({ id: 'tools', title: 'Install your tools', items: [
      { p: 'You need a JDK, version 25, for example from <a href="https://adoptium.net/">Adoptium</a>. ' + (spa || a.admin === 'low-code' ? 'You also need <a href="https://nodejs.org/en/download">Node.js</a> 22.12 or newer to build the frontend. ' : '') + 'The project comes with its own copy of ' + (gradle ? 'Gradle' : 'Maven') + ', so you don\'t install that. Commands assume a Unix-style terminal. On Windows, use Git Bash or WSL.' },
      { cmd: 'java -version', lines: [['java', 'Should print version 25.']] }
    ] });

    var features = ['serialization-jackson'];
    if (mongo) features.push('mongo-sync');
    else {
      features.push(JDBC[a.database][0], 'jdbc-hikari', a.migrations === 'liquibase' ? 'liquibase' : 'flyway');
      if (a.data === 'jpa') features.push('data-jpa');
      if (a.data === 'jooq') features.push('jooq');
      if (a.data === 'mybatis') features.push('mybatis');
    }
    if (pages) features.push('views-thymeleaf');
    if (isGql) features.push('graphql');
    if (a.transport === 'sse') features.push('reactor');
    if (a.transport === 'websocket') features.push('websocket');
    if (own) features.push('security-session', 'spring-security-crypto');
    if (oidc) features.push('security-session', 'security-oauth2');
    var url = 'https://launch.micronaut.io/create/default/org.acme.demo?lang=JAVA&build=' + (gradle ? 'GRADLE' : 'MAVEN') + '&test=JUNIT&javaVersion=JDK_25&features=' + features.join(',');
    s.push({ id: 'project', title: 'Create the project', items: [
      { cmd: 'curl -fsSL -o demo.zip "' + url + '"\nunzip -q demo.zip\nrm demo.zip\ncd demo\nchmod +x ' + (gradle ? 'gradlew' : 'mvnw'), lines: [
        ['launch.micronaut.io', 'Micronaut\'s project generator. You can pick the same options on that website instead.'],
        ['build=' + (gradle ? 'GRADLE' : 'MAVEN'), 'Your build tool.'],
        ['JDK_25', 'Your Java version.'],
        ['features', 'Each one adds a library and its settings.']
      ] }
    ] });

    // Settings
    var props = ['micronaut.server.port=${PORT:3000}'];
    if (mongo) props.push('mongodb.uri=${DATABASE_URL:`mongodb://localhost:27017/demo`}');
    else {
      props.push('datasources.default.url=${DATABASE_URL:`' + JDBC[a.database][1] + '`}');
      if (a.database === 'h2') props.push('datasources.default.username=sa', 'datasources.default.password=');
      else props.push('datasources.default.username=${DB_USER:' + { postgresql: 'postgres', mysql: 'root', sqlserver: 'sa' }[a.database] + '}', 'datasources.default.password=${DB_PASSWORD:}');
      if (a.migrations === 'liquibase') props.push('liquibase.datasources.default.change-log=classpath:db/changeLog.sql');
      if (a.data === 'jooq') props.push('jooq.datasources.default.sql-dialect=' + JDBC[a.database][2]);
    }
    if (spa) props.push('micronaut.router.static-resources.default.enabled=true', 'micronaut.router.static-resources.default.paths=classpath:public', 'micronaut.router.static-resources.default.mapping=/**');
    if (login) {
      props.push('micronaut.security.authentication=session', 'micronaut.session.http.cookie-same-site=Lax', 'micronaut.security.redirect.unauthorized.enabled=false', 'micronaut.security.redirect.forbidden.enabled=false', 'micronaut.security.redirect.login-success=/', 'micronaut.security.redirect.logout=/login');
      if (spa) props.push('micronaut.security.intercept-url-map[0].pattern=/**', 'micronaut.security.intercept-url-map[0].http-method=GET', 'micronaut.security.intercept-url-map[0].access[0]=isAnonymous()');
    }
    if (login && isGql) { var rule = spa ? 1 : 0; props.push('micronaut.security.intercept-url-map[' + rule + '].pattern=/graphql', 'micronaut.security.intercept-url-map[' + rule + '].http-method=POST', 'micronaut.security.intercept-url-map[' + rule + '].access[0]=isAuthenticated()'); }
    if (own) props.push('micronaut.security.redirect.login-failure=/login-failed');
    if (oidc) props.push('micronaut.security.oauth2.clients.oidc.client-id=${OIDC_CLIENT_ID:demo-app}', 'micronaut.security.oauth2.clients.oidc.client-secret=${OIDC_CLIENT_SECRET:}', 'micronaut.security.oauth2.clients.oidc.openid.issuer=${OIDC_ISSUER:`http://localhost:8180/realms/demo`}', 'micronaut.security.oauth2.clients.oidc.scopes[0]=openid', 'micronaut.security.oauth2.clients.oidc.scopes[1]=profile', 'micronaut.security.oauth2.clients.oidc.scopes[2]=email', 'micronaut.security.token.name-key=email');

    var dbItems = Kit.dbSetup(a);
    if (a.database === 'h2') dbItems = [{ p: 'H2 runs inside your app and stores its data in a file in the project folder, so there\'s nothing to install or start. It suits development and small single-server sites.' }];
    var dbEnv = mongo ? 'export DATABASE_URL="mongodb://localhost:27017/demo"' : a.database === 'h2' ? '' : 'export DB_PASSWORD=your-password';
    if (dbEnv) dbItems.push({ cmd: dbEnv, manual: true, lines: [[mongo ? 'DATABASE_URL' : 'DB_PASSWORD', 'A setting read from the environment, which keeps secrets out of your code.'], ['export', 'Applies to this terminal and the programs it starts, so set it again in a new terminal.']] });
    if (mongo) dbItems.push({ p: 'MongoDB has no fixed table structure, so there are no migrations to run. Collections are created the first time you save data.' });
    else if (a.migrations === 'liquibase') dbItems.push({ file: 'src/main/resources/db/changeLog.sql', lang: 'sql', code: '--liquibase formatted sql\n\n--changeset demo:1\n' + Kit.ddlTasks(ddlDb(a.database)) + (own ? '\n--changeset demo:2\n' + usersDdl(a.database) : ''), lines: [['--liquibase formatted sql', 'Marks this as a Liquibase file written in plain SQL.'], ['--changeset demo:1', 'One numbered change. Liquibase records which have run, so never edit one after it has run. Add a new one instead.']].concat(Kit.DDL_LINES) });
    else {
      dbItems.push({ file: 'src/main/resources/db/migration/V1__create_tasks.sql', lang: 'sql', code: Kit.ddlTasks(ddlDb(a.database)), lines: Kit.DDL_LINES.concat([['V1__create_tasks.sql', 'The name matters: <code>V1</code> is the version, two underscores separate it from the description. Never edit a file after it has run. Add a new one instead.']]) });
      if (own) dbItems.push({ file: 'src/main/resources/db/migration/V2__create_users.sql', lang: 'sql', code: usersDdl(a.database), lines: [['unique', 'Stops two accounts from using the same email.'], ['password_hash', 'A one-way scrambled form of the password. Never store the password itself.']] });
    }
    dbItems.push({ file: 'src/main/resources/application.properties', append: true, lang: 'text', code: props.join('\n') + '\n', lines: [
      ['Added to the end', 'The generator already wrote some settings to this file, such as which migration tool to run. Keep those, and add these.'],
      ['${PORT:3000}', 'Reads an environment variable, with a default after the colon. Hosting platforms choose the port this way. A default that contains colons goes in backticks.']
    ].concat(mongo ? [['mongodb.uri', 'Where MongoDB is, including the database name.']] : [['datasources.default.url', 'Where the database is. Set <code>DATABASE_URL</code> to use another one.']])
     .concat(a.data === 'jooq' && !mongo ? [['sql-dialect', 'Which kind of SQL jOOQ writes.']] : [])
     .concat(spa ? [['static-resources', 'Serves your built frontend from the app.']] : [])
     .concat(login ? [
       ['authentication=session', 'Keeps people logged in with a server-side session and a cookie.'],
       ['cookie-same-site=Lax', 'Keeps the cookie off forms posted from other sites.'],
       ['unauthorized.enabled=false', 'Answers with a 401 rather than a redirect, so frontends and pages can each decide what to do.'],
       ['redirect.login-success', 'Where people go after logging in.']
     ] : [])
     .concat(spa && login ? [['intercept-url-map', 'Micronaut blocks everything by default. This lets anyone load your frontend\'s files, while the API stays protected in code.']] : [])
     .concat(login && isGql ? [['/graphql', 'Requires a login for GraphQL. That route comes with Micronaut, so its rule goes here rather than on your own class.']] : [])
     .concat(oidc ? [['oauth2.clients.oidc', 'Your provider. Micronaut adds <code>/oauth/login/oidc</code> and <code>/oauth/callback/oidc</code>.'], ['token.name-key=email', 'Identifies people by their email, which is what <code>ADMIN_EMAILS</code> lists.']] : []) });
    dbItems.push({ file: 'src/test/resources/application-test.properties', lang: 'text', code: 'micronaut.server.port=-1\n' + (oidc ? 'micronaut.security.oauth2.enabled=false\n' : ''), lines: [['port=-1', 'Tests use any free port, so they never clash with a running server.']].concat(oidc ? [['oauth2.enabled=false', 'Tests don\'t need your provider.']] : []) });
    dbItems.push({ file: J + 'Task.java', lang: 'java', code: 'package org.acme;\n\nimport io.micronaut.serde.annotation.Serdeable;\n\n@Serdeable\npublic record Task(String id, String title, boolean done) {\n}\n', lines: [['record', 'A short way to write a class that only holds values. IDs are text, so the rest of the app doesn\'t depend on how the database numbers rows.'], ['@Serdeable', 'Micronaut prepares the JSON code for this type when it compiles.']] });
    dbItems = dbItems.concat(storeItems(a, own));
    s.push({ id: 'db', title: 'Set up the database', items: dbItems });

    // Login
    if (login) {
      var li = [];
      if (oidc) li = li.concat(Kit.oidcSetup(a, '/oauth/callback/oidc', 3000));
      li.push({ cmd: 'export ADMIN_EMAILS=you@example.com', lines: [['ADMIN_EMAILS', 'A comma-separated list of admin accounts.']] });
      if (own) li.push({ file: J + 'PasswordLogin.java', lang: 'java', code: 'package org.acme;\n\nimport io.micronaut.http.HttpRequest;\nimport io.micronaut.security.authentication.AuthenticationFailureReason;\nimport io.micronaut.security.authentication.AuthenticationRequest;\nimport io.micronaut.security.authentication.AuthenticationResponse;\nimport io.micronaut.security.authentication.provider.HttpRequestAuthenticationProvider;\nimport jakarta.inject.Singleton;\nimport java.util.Locale;\nimport org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;\n\n@Singleton\nclass PasswordLogin<B> implements HttpRequestAuthenticationProvider<B> {\n    static final BCryptPasswordEncoder PASSWORDS = new BCryptPasswordEncoder();\n\n    private final TaskStore store;\n\n    PasswordLogin(TaskStore store) {\n        this.store = store;\n    }\n\n    @Override\n    public AuthenticationResponse authenticate(HttpRequest<B> request, AuthenticationRequest<String, String> login) {\n        var email = login.getIdentity().trim().toLowerCase(Locale.ROOT);\n        var hash = store.findPasswordHash(email);\n        if (hash != null && PASSWORDS.matches(login.getSecret(), hash)) {\n            return AuthenticationResponse.success(email);\n        }\n        return AuthenticationResponse.failure(AuthenticationFailureReason.CREDENTIALS_DO_NOT_MATCH);\n    }\n}\n', lines: [['HttpRequestAuthenticationProvider', 'Micronaut calls this when someone posts to its <code>/login</code> endpoint.'], ['BCryptPasswordEncoder', 'A well-known password hasher. It\'s from Spring Security\'s small crypto library, which Micronaut offers as a feature, and it doesn\'t bring Spring with it.'], ['matches', 'Checks a password against the stored one-way hash.']] });
      if (a.admin === 'in-app') li.push({ file: J + 'Admins.java', lang: 'java', code: 'package org.acme;\n\nimport java.util.Arrays;\nimport java.util.Objects;\n\nfinal class Admins {\n    private Admins() {\n    }\n\n    static boolean isAdmin(String email) {\n        var list = Objects.requireNonNullElse(System.getenv("ADMIN_EMAILS"), "");\n        return Arrays.stream(list.split(",")).anyMatch(admin -> admin.trim().equalsIgnoreCase(email));\n    }\n}\n', lines: [['isAdmin', 'Treats the emails listed in <code>ADMIN_EMAILS</code> as admins, so you don\'t need a separate roles system to start.']] });
      s.push({ id: 'login', title: 'Add login', items: li });
    }

    // Live updates
    var secImp = login ? 'import io.micronaut.security.annotation.Secured;\nimport io.micronaut.security.rules.SecurityRule;\n' : '';
    var anon = login ? '@Secured(SecurityRule.IS_ANONYMOUS)\n' : '';
    var authed = login ? '@Secured(SecurityRule.IS_AUTHENTICATED)\n' : '';
    if (a.transport) {
      var liveItems = [], code, ll;
      if (a.transport === 'sse') {
        code = 'package org.acme;\n\nimport io.micronaut.http.MediaType;\nimport io.micronaut.http.annotation.Controller;\nimport io.micronaut.http.annotation.Get;\nimport io.micronaut.http.sse.Event;\n' + secImp + 'import org.reactivestreams.Publisher;\nimport reactor.core.publisher.Sinks;\n\n' + authed + '@Controller("/api/live")\npublic class Live {\n    private final Sinks.Many<String> changes = Sinks.many().multicast().directBestEffort();\n\n    public void tasksChanged() {\n        changes.tryEmitNext("changed");\n    }\n\n    @Get(produces = MediaType.TEXT_EVENT_STREAM)\n    public Publisher<Event<String>> events() {\n        return changes.asFlux().map(Event::of);\n    }\n}\n';
        ll = [['Sinks.Many', 'A stream that many listeners can share. Each message reaches them all.'], ['tasksChanged', 'Your routes call this after changing data.'], ['TEXT_EVENT_STREAM', 'Keeps the response open, and sends each value as one event.']];
      }
      if (a.transport === 'websocket') {
        code = 'package org.acme;\n\n' + secImp + 'import io.micronaut.websocket.WebSocketBroadcaster;\nimport io.micronaut.websocket.annotation.OnMessage;\nimport io.micronaut.websocket.annotation.ServerWebSocket;\nimport jakarta.inject.Inject;\n\n' + anon + '@ServerWebSocket("/live")\npublic class Live {\n    @Inject\n    WebSocketBroadcaster broadcaster;\n\n    @OnMessage\n    public void received(String message) {\n    }\n\n    public void tasksChanged() {\n        broadcaster.broadcastSync("changed");\n    }\n}\n';
        ll = [['@ServerWebSocket', 'Accepts WebSocket connections at this path, on the same port as your web server.'], ['@OnMessage', 'Micronaut requires this method. This connection only sends, so it does nothing.'], ['WebSocketBroadcaster', 'Sends a message to every open connection.']].concat(login ? [['IS_ANONYMOUS', 'The message only says something changed, so it needs no login.']] : []);
      }
      if (a.transport === 'managed') {
        liveItems.push({ p: 'Create a free <a href="https://ably.com/docs/getting-started">Ably</a> account and copy an API key.' }, { cmd: 'export ABLY_API_KEY=your-key', manual: true, lines: [['ABLY_API_KEY', 'Your secret key. It stays on the server.']] });
        liveItems.push({ cmd: addLibrary(gradle, 'io.ably', 'ably-java', '1.8.2'), lines: [['ably-java', 'Ably\'s official library, added to your build file.']] });
        code = 'package org.acme;\n\nimport io.ably.lib.rest.AblyRest;\nimport io.ably.lib.rest.Auth;\nimport io.ably.lib.types.AblyException;\nimport io.micronaut.http.annotation.Controller;\nimport io.micronaut.http.annotation.Get;\n' + secImp + 'import jakarta.inject.Singleton;\n\n' + authed + '@Controller("/api/live-token")\n@Singleton\npublic class Live {\n    private final AblyRest rest;\n\n    Live() throws AblyException {\n        var key = System.getenv("ABLY_API_KEY");\n        rest = key == null ? null : new AblyRest(key);\n    }\n\n    @Get\n    public String token() throws AblyException {\n        var params = new Auth.TokenParams();\n        params.capability = "{\\"tasks\\":[\\"subscribe\\"]}";\n        return rest.auth.createTokenRequest(params, null).asJson();\n    }\n\n    public void tasksChanged() {\n        if (rest == null) {\n            return;\n        }\n        try {\n            rest.channels.get("tasks").publish("changed", "");\n        } catch (AblyException e) {\n            System.err.println(e.getMessage());\n        }\n    }\n}\n';
        ll = [['AblyRest', 'Sends messages to Ably over normal HTTP requests.'], ['createTokenRequest', 'Gives the browser a short-lived permission that can only subscribe, so your key stays secret.'], ['publish', 'Ably delivers this to every subscribed browser.']];
      }
      liveItems.push({ file: J + 'Live.java', lang: 'java', code: code, lines: ll });
      s.push({ id: 'live', title: 'Add live updates', items: liveItems });
    }

    if (a.payment) {
      var pay = Kit.javaCheckout(a);
      s.push({ id: 'pay', title: 'Add payments with ' + Kit.PAYMENT[a.payment].name, items: Kit.paymentIntro(a).concat([{ cmd: addLibrary(gradle, 'com.fasterxml.jackson.core', 'jackson-databind'), lines: [['jackson-databind', 'A JSON library, used here for talking to the payment provider. Micronaut knows which version to use.']].concat(gradle ? [] : [['sed -i', 'Edits <code>pom.xml</code> in place, adding the library to your project\'s list. On macOS, whose <code>sed</code> differs, add those lines by hand.']]) }, { file: J + 'Checkout.java', lang: 'java', code: pay.code.replace('import jakarta.enterprise.context.ApplicationScoped;', 'import jakarta.inject.Singleton;').replace('@ApplicationScoped', '@Singleton'), lines: pay.lines }]).concat(Kit.paymentOutro(a)) });
    }

    // Routes
    var appItems = [];
    var liveField = a.transport ? '    @Inject\n    Live live;\n\n' : '';
    var notify = a.transport ? '\n        live.tasksChanged();' : '';
    var blocking = '@ExecuteOn(TaskExecutors.BLOCKING)\n';
    var blockImp = 'import io.micronaut.scheduling.TaskExecutors;\nimport io.micronaut.scheduling.annotation.ExecuteOn;\n';
    if (isRest) {
      appItems.push({ file: J + 'TaskController.java', lang: 'java', code: 'package org.acme;\n\nimport io.micronaut.http.HttpResponse;\nimport io.micronaut.http.annotation.Body;\nimport io.micronaut.http.annotation.Controller;\nimport io.micronaut.http.annotation.Get;\nimport io.micronaut.http.annotation.PathVariable;\nimport io.micronaut.http.annotation.Post;\nimport io.micronaut.http.annotation.Put;\nimport io.micronaut.scheduling.TaskExecutors;\nimport io.micronaut.scheduling.annotation.ExecuteOn;\n' + secImp + 'import io.micronaut.serde.annotation.Serdeable;\nimport jakarta.inject.Inject;\nimport java.util.List;\nimport java.util.Map;\n\n' + authed + blocking + '@Controller("/api/tasks")\npublic class TaskController {\n    @Serdeable\n    public record NewTask(String title) {\n    }\n\n    @Serdeable\n    public record Change(boolean done) {\n    }\n\n    @Inject\n    TaskStore store;\n\n' + liveField + '    @Get\n    public HttpResponse<List<Task>> list() {\n        var tasks = store.list();\n        return HttpResponse.ok(tasks)\n                .header("Content-Range", "tasks 0-" + tasks.size() + "/" + tasks.size())\n                .header("Access-Control-Expose-Headers", "Content-Range");\n    }\n\n    @Get("/{id}")\n    public HttpResponse<Task> one(@PathVariable String id) {\n        return store.list().stream().filter(t -> t.id().equals(id)).findFirst().map(HttpResponse::ok).orElse(HttpResponse.notFound());\n    }\n\n    @Post\n    public HttpResponse<?> create(@Body NewTask body) {\n        var title = body.title() == null ? "" : body.title().trim();\n        if (title.isEmpty() || title.codePointCount(0, title.length()) > 200) {\n            return HttpResponse.badRequest(Map.of("error", "A title of 1 to 200 characters is required"));\n        }\n        var task = store.add(title);' + notify + '\n        return HttpResponse.created(task);\n    }\n\n    @Put("/{id}")\n    public HttpResponse<Task> change(@PathVariable String id, @Body Change body) {\n        store.setDone(id, body.done());' + notify + '\n        return one(id);\n    }\n}\n', lines: [
        ['@Controller', 'A class whose methods answer requests under this path.'],
      ].concat(login ? [['@Secured', 'Micronaut\'s login check. Without a login, these routes answer 401.']] : []).concat([
        ['@ExecuteOn', 'Runs this code on a worker thread, because database calls shouldn\'t hold up the threads that accept requests.'],
        ['@Serdeable', 'Lets Micronaut read this type from JSON.'],
        ['Content-Range', 'Tells clients how many rows exist. React-admin needs this.'],
        ['@PathVariable', 'The <code>{id}</code> part of the URL.'],
        ['HttpResponse.created', 'The standard status for &quot;created&quot;.']
      ]) });
    }
    if (isGql) {
      appItems.push({ file: 'src/main/resources/schema.graphqls', lang: 'text', code: 'type Task {\n  id: ID!\n  title: String!\n  done: Boolean!\n}\n\ntype Query {\n  tasks: [Task!]!\n}\n\ntype Mutation {\n  addTask(title: String!): Task!\n  setDone(id: ID!, done: Boolean!): Boolean!\n}\n', lines: [['type Task', 'Describes what clients can ask for.'], ['ID!', 'The <code>!</code> means the value is never null.'], ['Mutation', 'Operations that change data.']] });
      appItems.push({ file: J + 'GraphQLSetup.java', lang: 'java', code: 'package org.acme;\n\nimport graphql.GraphQL;\nimport graphql.schema.idl.RuntimeWiring;\nimport graphql.schema.idl.SchemaGenerator;\nimport graphql.schema.idl.SchemaParser;\nimport io.micronaut.context.annotation.Factory;\nimport io.micronaut.core.io.ResourceResolver;\nimport jakarta.inject.Singleton;\nimport java.io.InputStreamReader;\nimport java.util.Map;\n\n@Factory\npublic class GraphQLSetup {\n    @Singleton\n    GraphQL graphQL(TaskStore store, ResourceResolver resources' + (a.transport ? ', Live live' : '') + ') {\n        var schema = resources.getResourceAsStream("classpath:schema.graphqls").orElseThrow();\n        var types = new SchemaParser().parse(new InputStreamReader(schema));\n        var wiring = RuntimeWiring.newRuntimeWiring()\n                .type("Query", type -> type.dataFetcher("tasks", env -> store.list()))\n                .type("Task", type -> type\n                        .dataFetcher("id", env -> env.<Task>getSource().id())\n                        .dataFetcher("title", env -> env.<Task>getSource().title())\n                        .dataFetcher("done", env -> env.<Task>getSource().done()))\n                .type("Mutation", type -> type\n                        .dataFetcher("addTask", env -> {\n                            var task = store.add(env.<String>getArgument("title"));' + (a.transport ? '\n                            live.tasksChanged();' : '') + '\n                            return task;\n                        })\n                        .dataFetcher("setDone", env -> {\n                            store.setDone(env.<String>getArgument("id"), env.<Boolean>getArgument("done"));' + (a.transport ? '\n                            live.tasksChanged();' : '') + '\n                            return true;\n                        }))\n                .build();\n        return GraphQL.newGraphQL(new SchemaGenerator().makeExecutableSchema(types, wiring)).build();\n    }\n}\n', lines: [['SchemaParser', 'Reads your schema file.'], ['RuntimeWiring', 'Connects each field in the schema to the Java code that answers it.'], ['dataFetcher', 'The code for one field.'], ['GraphQL.newGraphQL', 'Micronaut serves this at <code>/graphql</code>.']] });
    }
    if (pages || login || a.payment) {
      var imp = ['io.micronaut.http.HttpResponse', 'io.micronaut.http.annotation.Controller', 'io.micronaut.scheduling.TaskExecutors', 'io.micronaut.scheduling.annotation.ExecuteOn', 'jakarta.inject.Inject', 'java.net.URI'];
      var parts = [], fields = [];
      if (pages) imp.push('io.micronaut.http.MediaType', 'io.micronaut.http.annotation.Get', 'io.micronaut.views.ModelAndView', 'java.util.Map', 'io.micronaut.http.annotation.Produces');
      if (login) imp.push('io.micronaut.security.annotation.Secured', 'io.micronaut.security.rules.SecurityRule', 'io.micronaut.core.annotation.Nullable', 'java.security.Principal');
      if (templates || a.admin === 'in-app' || own) fields.push('    @Inject\n    TaskStore store;\n');
      if (a.transport && (templates || a.admin === 'in-app')) fields.push('    @Inject\n    Live live;\n');
      if (a.payment) { imp.push('io.micronaut.http.annotation.Post', 'io.micronaut.http.HttpRequest', 'java.io.IOException'); fields.push('    @Inject\n    Checkout checkout;\n'); }
      if (templates) {
        imp.push('io.micronaut.http.annotation.Post', 'io.micronaut.http.annotation.Consumes', 'io.micronaut.http.annotation.PathVariable', 'io.micronaut.http.annotation.Body');
        var who = login ? '@Nullable Principal user' : '';
        parts.push('    @Get\n    @Produces(MediaType.TEXT_HTML)\n    public HttpResponse<?> home(' + who + ') {\n' + (login ? '        if (user == null) {\n            return HttpResponse.seeOther(URI.create("/login"));\n        }\n' : '') + '        return HttpResponse.ok(new ModelAndView<>("index", Map.of("tasks", store.list())));\n    }\n');
        var guardBody = login ? '        if (user == null) {\n            return HttpResponse.unauthorized();\n        }\n' : '';
        var sep = function (x) { return login ? (x ? x + ', ' : '') + '@Nullable Principal user' : x; };
        parts.push('    @Get("/tasks")\n    @Produces(MediaType.TEXT_HTML)\n    public HttpResponse<?> listPart(' + sep('') + ') {\n' + guardBody + '        return HttpResponse.ok(new ModelAndView<>("list", Map.of("tasks", store.list())));\n    }\n');
        parts.push('    @Post("/tasks")\n    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)\n    @Produces(MediaType.TEXT_HTML)\n    public HttpResponse<?> add(' + sep('@Body Map<String, String> form') + ') {\n' + guardBody + '        var title = form.getOrDefault("title", "").trim();\n        if (!title.isEmpty() && title.codePointCount(0, title.length()) <= 200) {\n            store.add(title);' + (a.transport ? '\n            live.tasksChanged();' : '') + '\n        }\n        return HttpResponse.ok(new ModelAndView<>("list", Map.of("tasks", store.list())));\n    }\n');
        parts.push('    @Post("/tasks/{id}/toggle")\n    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)\n    @Produces(MediaType.TEXT_HTML)\n    public HttpResponse<?> toggle(' + sep('@PathVariable String id, @Body Map<String, String> form') + ') {\n' + guardBody + '        store.setDone(id, "on".equals(form.get("done")));' + notify + '\n        return HttpResponse.ok(new ModelAndView<>("list", Map.of("tasks", store.list())));\n    }\n');
      }
      if (own) {
        imp.push('io.micronaut.http.annotation.Post', 'io.micronaut.http.annotation.Consumes', 'io.micronaut.http.annotation.Body', 'java.util.Locale');
        parts.push('    @Get("/login")\n    @Produces(MediaType.TEXT_HTML)\n    public ModelAndView<Map<String, String>> loginPage() {\n        return new ModelAndView<>("login", Map.of("error", ""));\n    }\n');
        parts.push('    @Get("/login-failed")\n    @Produces(MediaType.TEXT_HTML)\n    public ModelAndView<Map<String, String>> loginFailed() {\n        return new ModelAndView<>("login", Map.of("error", "Wrong email or password."));\n    }\n');
        parts.push('    @Post("/signup")\n    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)\n    @Produces(MediaType.TEXT_HTML)\n    public HttpResponse<?> signUp(@Body Map<String, String> form) {\n        var email = form.getOrDefault("username", "").trim().toLowerCase(Locale.ROOT);\n        var password = form.getOrDefault("password", "");\n        if (!email.contains("@") || password.length() < 8 || password.length() > 72) {\n            return HttpResponse.badRequest(new ModelAndView<>("login", Map.of("error", "Use a real email and a password of 8 to 72 characters.")));\n        }\n        if (store.findPasswordHash(email) != null) {\n            return HttpResponse.status(io.micronaut.http.HttpStatus.CONFLICT).body(new ModelAndView<>("login", Map.of("error", "That email can\'t be used. Try logging in.")));\n        }\n        store.addUser(email, PasswordLogin.PASSWORDS.encode(password));\n        return HttpResponse.temporaryRedirect(URI.create("/login"));\n    }\n');
      }
      if (a.admin === 'in-app') {
        imp.push('io.micronaut.http.annotation.Post', 'io.micronaut.http.annotation.PathVariable', 'io.micronaut.http.HttpStatus');
        parts.push('    private HttpResponse<?> adminOnly(Principal user) {\n        if (user == null) {\n            return HttpResponse.seeOther(URI.create("/login"));\n        }\n        return Admins.isAdmin(user.getName()) ? null : HttpResponse.status(HttpStatus.FORBIDDEN);\n    }\n');
        parts.push('    @Get("/admin")\n    @Produces(MediaType.TEXT_HTML)\n    public HttpResponse<?> adminPage(@Nullable Principal user) {\n        var stop = adminOnly(user);\n        return stop != null ? stop : HttpResponse.ok(new ModelAndView<>("admin", Map.of("tasks", store.list())));\n    }\n');
        parts.push('    @Post("/admin/tasks/{id}/delete")\n    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)\n    public HttpResponse<?> adminDelete(@PathVariable String id, @Nullable Principal user) {\n        var stop = adminOnly(user);\n        if (stop != null) {\n            return stop;\n        }\n        store.delete(id);' + notify + '\n        return HttpResponse.seeOther(URI.create("/admin"));\n    }\n');
      }
      if (a.payment) {
        imp.push('io.micronaut.http.annotation.Consumes', 'io.micronaut.http.MediaType');
        parts.push('    @Post("/api/checkout")\n    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)\n    public HttpResponse<?> startCheckout(HttpRequest<?> request' + (login ? ', @Nullable Principal user' : '') + ') throws IOException, InterruptedException {\n' + (login ? '        if (user == null) {\n            return HttpResponse.unauthorized();\n        }\n' : '') + '        var configured = System.getenv("PUBLIC_URL");\n        var base = configured != null ? configured : "http://" + request.getHeaders().get("Host");\n        return HttpResponse.seeOther(URI.create(checkout.create(base)));\n    }\n');
      }
      if (!parts.length && login) parts.push('');
      var uniq = imp.filter(function (x, i, l) { return l.indexOf(x) === i; }).sort();
      if (parts.join('').trim()) appItems.push({ file: J + 'Pages.java', lang: 'java', code: 'package org.acme;\n\n' + uniq.map(function (x) { return 'import ' + x + ';'; }).join('\n').replace(/import java\.net\.URI;\n?/, (parts.join('').indexOf('URI.') >= 0 ? 'import java.net.URI;\n' : '')) + '\n\n' + anon + blocking + '@Controller\npublic class Pages {\n' + fields.join('\n') + '\n' + parts.join('\n') + '}\n', lines: [
        ['@Controller', 'With no path, its routes start at the site\'s root.'],
        ['@ExecuteOn', 'Runs this code on a worker thread, because database calls shouldn\'t hold up the threads that accept requests.']
      ].concat(login ? [['IS_ANONYMOUS', 'Lets everyone reach these routes, and each route then checks for itself. Micronaut blocks everything without a rule.'], ['@Nullable Principal', 'Who is logged in, or nothing if nobody is.']] : [])
       .concat(pages ? [['ModelAndView', 'Fills in a template with these values.']] : [])
       .concat(templates ? [['"list"', 'Returns only the list, because htmx swaps just that part of the page.'], ['"on".equals', 'A checked checkbox sends <code>on</code>, and an unchecked one sends nothing.']] : [])
       .concat(own ? [['PASSWORDS.encode', 'Scrambles a new password one way. Bcrypt only reads the first 72 bytes, so longer passwords are refused.'], ['temporaryRedirect', 'Makes the browser send the same form to Micronaut\'s <code>/login</code>, which logs the new user in.']] : [])
       .concat(a.admin === 'in-app' ? [['adminOnly', 'Checks on the server. Hiding a link isn\'t protection, because anyone can type a URL.'], ['FORBIDDEN', 'Means logged in, but not allowed.']] : [])
       .concat(a.payment ? [['PUBLIC_URL', 'Your site\'s real address. Set this in production, because the <code>Host</code> header can be forged.']] : []) });
    }
    s.push({ id: 'app', title: 'Write the app', items: appItems.filter(function (i) { return !i.noRun; }) });

    if (pages) {
      var v = [], R = 'src/main/resources/views/';
      var html = function (head) { return '<!doctype html>\n<html lang="en" xmlns:th="http://www.thymeleaf.org">\n<meta charset="utf-8">\n<title>' + head + '</title>\n'; };
      if (templates) {
        var liveScript = a.transport === 'sse' ? "<script>new EventSource('/api/live').onmessage = () => htmx.trigger('#list', 'reload');</script>\n" : a.transport === 'websocket' ? "<script>\n  const scheme = location.protocol === 'https:' ? 'wss://' : 'ws://';\n  new WebSocket(scheme + location.host + '/live').onmessage = () => htmx.trigger('#list', 'reload');\n</script>\n" : a.transport === 'managed' ? "<script src=\"https://cdn.ably.com/lib/ably.min-2.js\"></script>\n<script>\n  new Ably.Realtime({ authUrl: '/api/live-token' }).channels.get('tasks').subscribe(() => htmx.trigger('#list', 'reload'));\n</script>\n" : '';
        v.push({ file: R + 'index.html', lang: 'html', code: html('Tasks') + "<script src=\"https://unpkg.com/htmx.org@2.0.11\"></script>\n<h1>Tasks</h1>\n" + (login ? "<form method=\"post\" action=\"/logout\"><button>Log out</button></form>\n" : '') + (a.payment ? "<form method=\"post\" action=\"/api/checkout\"><button>Buy example product</button></form>\n" : '') + "<form hx-post=\"/tasks\" hx-target=\"#list\" hx-on::after-request=\"this.reset()\">\n  <input name=\"title\" maxlength=\"200\" required>\n  <button>Add</button>\n</form>\n<div id=\"list\" hx-get=\"/tasks\" hx-trigger=\"reload\"><div th:replace=\"~{list}\"></div></div>\n" + liveScript + "</html>\n", lines: [['htmx', 'A small library that lets HTML attributes make requests and update part of the page.'], ['hx-post', 'Submits the form to this URL without reloading the page.'], ['hx-target', 'Replaces this element with the response.'], ['hx-on::after-request', 'Clears the form after it submits.'], ['th:replace', 'Inserts another template, in Thymeleaf, the template language this guide uses.']].concat(a.transport ? [['hx-trigger="reload"', 'Lets the live-update script ask for a fresh list.']] : []) });
        v.push({ file: R + 'list.html', lang: 'html', code: "<ul xmlns:th=\"http://www.thymeleaf.org\">\n  <li th:each=\"task : ${tasks}\">\n    <label>\n      <input type=\"checkbox\" name=\"done\" th:checked=\"${task.done()}\" th:attr=\"hx-post=|/tasks/${task.id()}/toggle|\" hx-target=\"#list\">\n      <span th:text=\"${task.title()}\"></span>\n    </label>\n  </li>\n</ul>\n", lines: [['th:each', 'Repeats this element for each task.'], ['th:text', 'Prints a value and escapes it, so a title can\'t inject HTML or scripts.'], ['task.title()', 'Calls the method a record gives you for each of its values.']] });
      }
      if (own) v.push({ file: R + 'login.html', lang: 'html', code: html('Log in') + "<h1>Log in or sign up</h1>\n<p role=\"alert\" th:if=\"${error != ''}\" th:text=\"${error}\"></p>\n<form method=\"post\">\n  <label>Email <input name=\"username\" type=\"email\" required></label>\n  <label>Password <input name=\"password\" type=\"password\" minlength=\"8\" maxlength=\"72\" required></label>\n  <button formaction=\"/login\">Log in</button>\n  <button formaction=\"/signup\">Sign up</button>\n</form>\n</html>\n", lines: [['name="username"', 'The field name Micronaut\'s login endpoint expects, even though it holds an email here.'], ['formaction', 'Each button posts the same form to a different URL.']] });
      if (a.admin === 'in-app') v.push({ file: R + 'admin.html', lang: 'html', code: html('Admin') + "<h1>Admin: all tasks</h1>\n<table>\n  <tr th:each=\"task : ${tasks}\">\n    <td th:text=\"${task.title()}\"></td>\n    <td th:text=\"${task.done()} ? 'Done' : 'Open'\"></td>\n    <td><form method=\"post\" th:action=\"|/admin/tasks/${task.id()}/delete|\"><button>Delete</button></form></td>\n  </tr>\n</table>\n</html>\n", lines: [['form method="post"', 'Deleting uses POST, so a link or a search engine can\'t trigger it.'], ['/admin', 'A small page rendered by the server, whichever frontend you chose. The admin check runs on the server.']] });
      s.push({ id: 'views', title: templates ? 'Write the pages' : 'Write the pages it needs', items: v });
    }
    if (spa) {
      s.push({ id: 'frontend', title: 'Build the frontend', items: Kit.spaItems(a, 3000).concat([
        { cmd: 'mkdir -p src/main/resources/public\ncp -r ' + Kit.spaDistPath(a) + '/. src/main/resources/public/', lines: [['resources/public', 'Your settings serve this folder as plain files, so your frontend becomes part of the app. Repeat this copy after building the frontend again.']] }
      ]) });
    }
    if (a.admin === 'low-code') s.push({ id: 'admin', title: 'Add the admin tool', items: Kit.lowCodeItems(a) });

    // Tests
    var post = function (p, ct, body) { return 'http.send(HttpRequest.newBuilder(URI.create(base + "' + p + '")).header("Content-Type", "' + ct + '").POST(HttpRequest.BodyPublishers.ofString(' + JSON.stringify(body) + ')).build(), HttpResponse.BodyHandlers.ofString())'; };
    var get = function (p) { return 'http.send(HttpRequest.newBuilder(URI.create(base + "' + p + '")).build(), HttpResponse.BodyHandlers.ofString())'; };
    var t = 'package org.acme;\n\nimport static org.junit.jupiter.api.Assertions.assertEquals;\nimport static org.junit.jupiter.api.Assertions.assertTrue;\n\nimport io.micronaut.runtime.server.EmbeddedServer;\nimport io.micronaut.test.extensions.junit5.annotation.MicronautTest;\nimport jakarta.inject.Inject;\nimport java.net.URI;\nimport java.net.http.HttpClient;\nimport java.net.http.HttpRequest;\nimport java.net.http.HttpResponse;\nimport org.junit.jupiter.api.Test;\n\n@MicronautTest(transactional = false)\nclass AppTest {\n    @Inject\n    EmbeddedServer server;\n\n    @Inject\n    TaskStore store;\n\n    private final HttpClient http = HttpClient.newHttpClient();\n\n    @Test\n    void theDataLayerSavesAndChangesATask() {\n        var task = store.add("From the test");\n        store.setDone(task.id(), true);\n        assertTrue(store.list().stream().anyMatch(t -> t.id().equals(task.id()) && t.done()));\n    }\n';
    var base = '        var base = server.getURL().toString();\n';
    if (login) {
      var probe = isRest ? '/api/tasks' : isGql ? '/graphql' : '/tasks';
      t += '\n    @Test\n    void loggedOutVisitorsAreBlocked() throws Exception {\n' + base + '        var res = ' + post(probe, 'application/json', isGql ? '{"query":"{ tasks { id } }"}' : '{}') + ';\n        assertEquals(401, res.statusCode());\n    }\n';
    } else if (isRest) {
      t += '\n    @Test\n    void theRestApiAddsAndLists() throws Exception {\n' + base + '        var created = ' + post('/api/tasks', 'application/json', '{"title":"Through the API"}') + ';\n        assertEquals(201, created.statusCode());\n        var list = ' + get('/api/tasks') + ';\n        assertTrue(list.body().contains("Through the API"));\n        assertTrue(list.headers().firstValue("Content-Range").isPresent());\n    }\n\n    @Test\n    void anEmptyTitleIsRejected() throws Exception {\n' + base + '        var res = ' + post('/api/tasks', 'application/json', '{"title":"   "}') + ';\n        assertEquals(400, res.statusCode());\n    }\n';
    } else if (isGql) {
      t += '\n    @Test\n    void graphQlAddsAndLists() throws Exception {\n' + base + '        ' + post('/graphql', 'application/json', '{"query":"mutation { addTask(title: \\"Through GraphQL\\") { id } }"}') + ';\n        var list = ' + post('/graphql', 'application/json', '{"query":"{ tasks { title } }"}') + ';\n        assertTrue(list.body().contains("Through GraphQL"));\n    }\n';
    }
    if (templates && !login) t += '\n    @Test\n    void thePageEscapesTitles() throws Exception {\n' + base + '        ' + post('/tasks', 'application/x-www-form-urlencoded', 'title=%3Cb%3EFrom+a+form%3C%2Fb%3E') + ';\n        var page = ' + get('/') + ';\n        assertTrue(page.body().contains("&lt;b&gt;From a form&lt;/b&gt;"));\n    }\n';
    if (a.admin === 'in-app') t += '\n    @Test\n    void theAdminPageNeedsALogin() throws Exception {\n' + base + '        var page = ' + get('/admin') + ';\n        assertTrue(!page.body().contains("Admin: all tasks"));\n    }\n';
    t += '}\n';
    s.push({ id: 'test', title: 'Test it', items: [
      { file: 'src/test/java/org/acme/AppTest.java', lang: 'java', code: t, lines: [
        ['@MicronautTest', 'Starts your whole app before the tests, on a free port. <code>transactional = false</code> keeps each change in the database, as in real use.'],
        ['EmbeddedServer', 'Gives the test the address the app is using.'],
        ['HttpClient', 'Makes real HTTP requests to your app.']
      ] },
      { cmd: buildCmd, lines: [[buildCmd, 'Compiles the app, runs the tests, and builds one finished file. Tests use whichever database your settings point at, so use a development database.']] },
      { p: 'Then start it with the command below and open <code>http://localhost:3000</code>.' + (spa ? ' For working on the frontend, also run <code>npm run dev</code> inside <code>web</code>, and open the address it prints.' : '') },
      { cmd: devCmd, manual: true, lines: [[devCmd, 'Compiles and starts your app. Press Ctrl+C to stop it, and run it again after a change.']] }
    ] });

    var envList = ['DATABASE_URL'];
    if (!mongo && a.database !== 'h2') envList.push('DB_USER', 'DB_PASSWORD');
    if (login) envList.push('ADMIN_EMAILS');
    if (oidc) envList.push('OIDC_ISSUER', 'OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET');
    if (a.transport === 'managed') envList.push('ABLY_API_KEY');
    if (a.payment) { envList.push('PUBLIC_URL'); Kit.PAYMENT[a.payment].env.forEach(function (e) { envList.push(e[0]); }); }
    var docker = 'FROM eclipse-temurin:25-jdk AS build\nWORKDIR /src\nCOPY . .\nRUN ' + (gradle ? './gradlew build -x test' : './mvnw package -DskipTests') + '\n\nFROM eclipse-temurin:25-jre\nWORKDIR /srv\nCOPY --from=build /src/' + jar + ' /srv/app.jar\nUSER 1001\nEXPOSE 3000\nCMD ["java", "-jar", "/srv/app.jar"]\n';
    s.push({ id: 'deploy', title: 'Deploy it', items: Kit.hostingItems(a, { port: 3000, env: envList, dockerfile: docker, dockerignore: 'target\nbuild\n.gradle\nweb/node_modules\nweb/dist\n.git\n.env\n*.db\n', dockerLines: [
      ['AS build', 'A first stage compiles your app with the full JDK. Only the finished file goes into the final image.'],
      ['USER 1001', 'Runs as a limited user rather than as root.'],
      ['CMD', 'What runs when the container starts.']
    ] }).concat(login ? [{ warn: 'Sessions are kept in the app\'s memory, so restarting logs everyone out, and two copies of the app don\'t share them. For more than one copy, store sessions in Redis using <a href="https://micronaut-projects.github.io/micronaut-redis/latest/guide/">Micronaut Redis</a>.' }] : []) });
    return s;
  }
  Kit.frameworks.micronaut = micronaut;
})(StackKit);
