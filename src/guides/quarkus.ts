// @ts-nocheck -- moved from the single-file page; types are added module by module.
import { StackKit } from '../stack-kit';

// Guide for Quarkus, with Maven or Gradle.
(function (Kit) {
  function L() { return Array.prototype.join.call(arguments, '\n') + '\n'; }
  var J = 'src/main/java/org/acme/';
  var JDBC = {
    postgresql: ['io.quarkus:quarkus-jdbc-postgresql', 'postgresql', 'jdbc:postgresql://localhost:5432/demo'],
    mysql: ['io.quarkus:quarkus-jdbc-mysql', 'mysql', 'jdbc:mysql://localhost:3306/demo'],
    sqlserver: ['io.quarkus:quarkus-jdbc-mssql', 'mssql', 'jdbc:sqlserver://localhost:1433;databaseName=demo;trustServerCertificate=true'],
    h2: ['io.quarkus:quarkus-jdbc-h2', 'h2', 'jdbc:h2:file:./demo-db']
  };
  function ddlDb(db) { return db === 'h2' ? 'postgresql' : db; }
  function usersDdl(db) { return Kit.ddlUsers(ddlDb(db)).replace(/,\n  role[^\n]*/, ''); }

  var TASK_RECORD_LINES = [['record', 'A short way to write a class that only holds values. IDs are text, so the rest of the app doesn\'t depend on how the database numbers rows.']];

  function storeItems(a, own) {
    var db = a.database, items = [];
    if (db === 'mongodb') {
      items.push({ file: J + 'TaskStore.java', lang: 'java', code: L(
        'package org.acme;', '',
        'import com.mongodb.ConnectionString;',
        'import com.mongodb.client.MongoClient;',
        'import com.mongodb.client.MongoCollection;',
        'import com.mongodb.client.model.Filters;',
        'import com.mongodb.client.model.Sorts;',
        'import com.mongodb.client.model.Updates;',
        'import jakarta.annotation.PostConstruct;',
        'import jakarta.enterprise.context.ApplicationScoped;',
        'import jakarta.inject.Inject;',
        'import java.util.ArrayList;',
        'import java.util.List;',
        'import org.bson.Document;',
        'import org.bson.types.ObjectId;',
        'import org.eclipse.microprofile.config.inject.ConfigProperty;', '',
        '@ApplicationScoped',
        'public class TaskStore {',
        '    @Inject',
        '    MongoClient client;', '',
        '    @ConfigProperty(name = "quarkus.mongodb.connection-string")',
        '    String address;', '',
        '    private MongoCollection<Document> tasks;',
        own ? '    private MongoCollection<Document> users;\n' : '',
        '    @PostConstruct',
        '    void connect() {',
        '        var database = client.getDatabase(new ConnectionString(address).getDatabase());',
        '        tasks = database.getCollection("tasks");',
        own ? '        users = database.getCollection("users");\n        users.createIndex(new Document("email", 1), new com.mongodb.client.model.IndexOptions().unique(true));' : '',
        '    }', '',
        '    public List<Task> list() {',
        '        var result = new ArrayList<Task>();',
        '        for (var doc : tasks.find().sort(Sorts.ascending("_id"))) {',
        '            result.add(new Task(doc.getObjectId("_id").toHexString(), doc.getString("title"), doc.getBoolean("done")));',
        '        }',
        '        return result;',
        '    }', '',
        '    public Task add(String title) {',
        '        var doc = new Document("title", title).append("done", false);',
        '        tasks.insertOne(doc);',
        '        return new Task(doc.getObjectId("_id").toHexString(), title, false);',
        '    }', '',
        '    public void setDone(String id, boolean done) {',
        '        if (ObjectId.isValid(id)) {',
        '            tasks.updateOne(Filters.eq("_id", new ObjectId(id)), Updates.set("done", done));',
        '        }',
        '    }', '',
        '    public void delete(String id) {',
        '        if (ObjectId.isValid(id)) {',
        '            tasks.deleteOne(Filters.eq("_id", new ObjectId(id)));',
        '        }',
        '    }',
        own ? '\n    public String findPasswordHash(String email) {\n        var doc = users.find(Filters.eq("email", email)).first();\n        return doc == null ? null : doc.getString("password_hash");\n    }\n\n    public void addUser(String email, String hash) {\n        users.insertOne(new Document("email", email).append("password_hash", hash));\n    }' : '',
        '}').replace(/\n\n\n/g, '\n\n').replace(/\n\n    }/g, '\n    }'), lines: [
        ['MongoClient', 'Quarkus creates this from the address in your settings.'],
        ['getDatabase', 'Uses the database named in the address.'],
        ['collection', 'MongoDB\'s equivalent of a table. It\'s created on first use.'],
        ['ObjectId.isValid', 'Text that isn\'t a valid ID can\'t be any task, so it does nothing.']
      ].concat(own ? [['unique(true)', 'Stops two accounts from using the same email.']] : []) });
      return items;
    }
    if (a.data === 'jpa') {
      items.push({ file: J + 'TaskEntity.java', lang: 'java', code: L('package org.acme;', '', 'import jakarta.persistence.Entity;', 'import jakarta.persistence.GeneratedValue;', 'import jakarta.persistence.GenerationType;', 'import jakarta.persistence.Id;', 'import jakarta.persistence.Table;', '', '@Entity', '@Table(name = "tasks")', 'public class TaskEntity {', '    @Id', '    @GeneratedValue(strategy = GenerationType.IDENTITY)', '    public Integer id;', '', '    public String title;', '', '    public boolean done;', '}'), lines: [['@Entity', 'Tells Hibernate this class matches a table, so one object is one row.'], ['@GeneratedValue', 'The database numbers each row.'], ['public fields', 'Normal in Quarkus. It generates the getters and setters Hibernate wants when it builds your app.']] });
      if (own) items.push({ file: J + 'UserEntity.java', lang: 'java', code: L('package org.acme;', '', 'import jakarta.persistence.Column;', 'import jakarta.persistence.Entity;', 'import jakarta.persistence.GeneratedValue;', 'import jakarta.persistence.GenerationType;', 'import jakarta.persistence.Id;', 'import jakarta.persistence.Table;', '', '@Entity', '@Table(name = "users")', 'public class UserEntity {', '    @Id', '    @GeneratedValue(strategy = GenerationType.IDENTITY)', '    public Integer id;', '', '    public String email;', '', '    @Column(name = "password_hash")', '    public String passwordHash;', '}'), lines: [['@Column', 'Names the column when it differs from the field.']] });
      items.push({ file: J + 'TaskStore.java', lang: 'java', code: 'package org.acme;\n\nimport jakarta.enterprise.context.ApplicationScoped;\nimport jakarta.inject.Inject;\nimport jakarta.persistence.EntityManager;\nimport jakarta.transaction.Transactional;\nimport java.util.List;\n\n@ApplicationScoped\npublic class TaskStore {\n    @Inject\n    EntityManager entities;\n\n    private static Task toTask(TaskEntity row) {\n        return new Task(String.valueOf(row.id), row.title, row.done);\n    }\n\n    private static Integer number(String id) {\n        try {\n            return Integer.valueOf(id);\n        } catch (NumberFormatException e) {\n            return null;\n        }\n    }\n\n    public List<Task> list() {\n        return entities.createQuery("from TaskEntity order by id", TaskEntity.class).getResultList().stream().map(TaskStore::toTask).toList();\n    }\n\n    @Transactional\n    public Task add(String title) {\n        var row = new TaskEntity();\n        row.title = title;\n        entities.persist(row);\n        entities.flush();\n        return toTask(row);\n    }\n\n    @Transactional\n    public void setDone(String id, boolean done) {\n        var key = number(id);\n        var row = key == null ? null : entities.find(TaskEntity.class, key);\n        if (row != null) {\n            row.done = done;\n        }\n    }\n\n    @Transactional\n    public void delete(String id) {\n        var key = number(id);\n        var row = key == null ? null : entities.find(TaskEntity.class, key);\n        if (row != null) {\n            entities.remove(row);\n        }\n    }\n' + (own ? '\n    @Transactional\n    public String findPasswordHash(String email) {\n        return entities.createQuery("select u.passwordHash from UserEntity u where u.email = :email", String.class).setParameter("email", email).getResultStream().findFirst().orElse(null);\n    }\n\n    @Transactional\n    public void addUser(String email, String hash) {\n        var user = new UserEntity();\n        user.email = email;\n        user.passwordHash = hash;\n        entities.persist(user);\n    }\n' : '') + '}\n', lines: [
        ['@ApplicationScoped', 'Quarkus creates one copy of this class and hands it to whatever asks for it.'],
        ['EntityManager', 'Hibernate\'s main object for reading and writing rows.'],
        ['@Transactional', 'Runs the method as one all-or-nothing change, and saves changed objects when it ends. The login check needs it too, because it runs outside a normal request.'],
        ['from TaskEntity', 'A Hibernate query. It names your class, not the table.'],
        ['number', 'Text that isn\'t a number can\'t be any task, so it does nothing.']
      ] });
      return items;
    }
    if (a.data === 'jooq') {
      var returning = db === 'mysql'
        ? '        dsl.insertInto(TASKS, TITLE).values(title).execute();\n        return new Task(String.valueOf(dsl.lastID()), title, false);\n'
        : '        var id = dsl.insertInto(TASKS, TITLE).values(title).returningResult(ID).fetchOne(ID);\n        return new Task(String.valueOf(id), title, false);\n';
      items.push({ file: J + 'TaskStore.java', lang: 'java', code: 'package org.acme;\n\nimport static org.jooq.impl.DSL.field;\nimport static org.jooq.impl.DSL.table;\n\nimport jakarta.enterprise.context.ApplicationScoped;\nimport jakarta.inject.Inject;\nimport jakarta.transaction.Transactional;\nimport java.util.List;\nimport org.jooq.DSLContext;\nimport org.jooq.Field;\nimport org.jooq.Table;\n\n@ApplicationScoped\npublic class TaskStore {\n    private static final Table<?> TASKS = table("tasks");\n    private static final Field<Integer> ID = field("id", Integer.class);\n    private static final Field<String> TITLE = field("title", String.class);\n    private static final Field<Boolean> DONE = field("done", Boolean.class);\n' + (own ? '    private static final Table<?> USERS = table("users");\n    private static final Field<String> EMAIL = field("email", String.class);\n    private static final Field<String> HASH = field("password_hash", String.class);\n' : '') + '\n    @Inject\n    DSLContext dsl;\n\n    private static Integer number(String id) {\n        try {\n            return Integer.valueOf(id);\n        } catch (NumberFormatException e) {\n            return null;\n        }\n    }\n\n    public List<Task> list() {\n        return dsl.select(ID, TITLE, DONE).from(TASKS).orderBy(ID).fetch(row -> new Task(String.valueOf(row.get(ID)), row.get(TITLE), row.get(DONE)));\n    }\n\n    @Transactional\n    public Task add(String title) {\n' + returning + '    }\n\n    public void setDone(String id, boolean done) {\n        var key = number(id);\n        if (key != null) {\n            dsl.update(TASKS).set(DONE, done).where(ID.eq(key)).execute();\n        }\n    }\n\n    public void delete(String id) {\n        var key = number(id);\n        if (key != null) {\n            dsl.deleteFrom(TASKS).where(ID.eq(key)).execute();\n        }\n    }\n' + (own ? '\n    public String findPasswordHash(String email) {\n        return dsl.select(HASH).from(USERS).where(EMAIL.eq(email)).fetchOne(HASH);\n    }\n\n    public void addUser(String email, String hash) {\n        dsl.insertInto(USERS, EMAIL, HASH).values(email, hash).execute();\n    }\n' : '') + '}\n', lines: [
        ['DSLContext', 'jOOQ\'s main object. The extension connects it to your database.'],
        ['table("tasks")', 'Names the table and columns. jOOQ can also generate these from your database, which adds compile-time checking.'],
        ['dsl.select', 'Reads like the SQL it runs. Values are passed safely as parameters.'],
        ['number', 'Text that isn\'t a number can\'t be any task, so it does nothing.']
      ] });
      return items;
    }
    // MyBatis
    items.push({ file: J + 'TaskMapper.java', lang: 'java', code: 'package org.acme;\n\nimport java.util.List;\nimport org.apache.ibatis.annotations.Delete;\nimport org.apache.ibatis.annotations.Insert;\nimport org.apache.ibatis.annotations.Mapper;\nimport org.apache.ibatis.annotations.Options;\nimport org.apache.ibatis.annotations.Param;\nimport org.apache.ibatis.annotations.Select;\nimport org.apache.ibatis.annotations.Update;\n\n@Mapper\npublic interface TaskMapper {\n    class Row {\n        public Integer id;\n        public String title;\n        public boolean done;\n    }\n\n    @Select("select id, title, done from tasks order by id")\n    List<Row> list();\n\n    @Insert("insert into tasks (title) values (#{title})")\n    @Options(useGeneratedKeys = true, keyProperty = "id")\n    void add(Row row);\n\n    @Update("update tasks set done = #{done} where id = #{id}")\n    void setDone(@Param("id") int id, @Param("done") boolean done);\n\n    @Delete("delete from tasks where id = #{id}")\n    void delete(@Param("id") int id);\n' + (own ? '\n    @Select("select password_hash from users where email = #{email}")\n    String findPasswordHash(@Param("email") String email);\n\n    @Insert("insert into users (email, password_hash) values (#{email}, #{hash})")\n    void addUser(@Param("email") String email, @Param("hash") String hash);\n' : '') + '}\n', lines: [['@Mapper', 'MyBatis writes the code behind this interface for you.'], ['@Select and friends', 'The SQL that runs when you call the method.'], ['#{title}', 'A placeholder. The value travels separately from the SQL, which prevents SQL injection.'], ['useGeneratedKeys', 'Copies the ID the database created into the object.']] });
    items.push({ file: J + 'TaskStore.java', lang: 'java', code: 'package org.acme;\n\nimport jakarta.enterprise.context.ApplicationScoped;\nimport jakarta.inject.Inject;\nimport jakarta.transaction.Transactional;\nimport java.util.List;\n\n@ApplicationScoped\npublic class TaskStore {\n    @Inject\n    TaskMapper mapper;\n\n    private static Integer number(String id) {\n        try {\n            return Integer.valueOf(id);\n        } catch (NumberFormatException e) {\n            return null;\n        }\n    }\n\n    public List<Task> list() {\n        return mapper.list().stream().map(row -> new Task(String.valueOf(row.id), row.title, row.done)).toList();\n    }\n\n    @Transactional\n    public Task add(String title) {\n        var row = new TaskMapper.Row();\n        row.title = title;\n        mapper.add(row);\n        return new Task(String.valueOf(row.id), title, false);\n    }\n\n    @Transactional\n    public void setDone(String id, boolean done) {\n        var key = number(id);\n        if (key != null) {\n            mapper.setDone(key, done);\n        }\n    }\n\n    @Transactional\n    public void delete(String id) {\n        var key = number(id);\n        if (key != null) {\n            mapper.delete(key);\n        }\n    }\n' + (own ? '\n    public String findPasswordHash(String email) {\n        return mapper.findPasswordHash(email);\n    }\n\n    @Transactional\n    public void addUser(String email, String hash) {\n        mapper.addUser(email, hash);\n    }\n' : '') + '}\n', lines: [['TaskMapper', 'Quarkus hands this class the generated mapper.'], ['@Transactional', 'Runs the method as one all-or-nothing change.'], ['number', 'Text that isn\'t a number can\'t be any task, so it does nothing.']] });
    return items;
  }

  function migrationFiles(a, own) {
    var db = ddlDb(a.database);
    if (a.migrations === 'flyway') {
      var it = [{ file: 'src/main/resources/db/migration/V1__create_tasks.sql', lang: 'sql', code: Kit.ddlTasks(db), lines: Kit.DDL_LINES.concat([['V1__create_tasks.sql', 'The name matters: <code>V1</code> is the version, two underscores separate it from the description. Never edit a file after it has run. Add a new one instead.']]) }];
      if (own) it.push({ file: 'src/main/resources/db/migration/V2__create_users.sql', lang: 'sql', code: usersDdl(db), lines: [['unique', 'Stops two accounts from using the same email.'], ['password_hash', 'A one-way scrambled form of the password. Never store the password itself.']] });
      return it;
    }
    return [{ file: 'src/main/resources/db/changeLog.sql', lang: 'sql', code: '--liquibase formatted sql\n\n--changeset demo:1\n' + Kit.ddlTasks(db) + (own ? '\n--changeset demo:2\n' + usersDdl(db) : ''), lines: [['--liquibase formatted sql', 'Marks this as a Liquibase file written in plain SQL.'], ['--changeset demo:1', 'One numbered change. Liquibase records which have run, so never edit one after it has run. Add a new one instead.']].concat(Kit.DDL_LINES) }];
  }

  function checkoutCode(a) {
    var head = 'package org.acme;\n\nimport com.fasterxml.jackson.databind.JsonNode;\nimport com.fasterxml.jackson.databind.ObjectMapper;\nimport jakarta.enterprise.context.ApplicationScoped;\nimport java.io.IOException;\nimport java.net.URI;\nimport java.net.http.HttpClient;\nimport java.net.http.HttpRequest;\nimport java.net.http.HttpResponse;\n' + (a.payment === 'paypal' || a.payment === 'klarna' ? 'import java.nio.charset.StandardCharsets;\nimport java.util.Base64;\n' : '') + (a.payment === 'stripe' ? 'import java.net.URLEncoder;\nimport java.nio.charset.StandardCharsets;\nimport java.util.LinkedHashMap;\nimport java.util.stream.Collectors;\n' : '') + (a.payment !== 'stripe' ? 'import java.util.List;\nimport java.util.Map;\n' : '') + '\n@ApplicationScoped\npublic class Checkout {\n    private static final ObjectMapper JSON = new ObjectMapper();\n    HttpClient http = HttpClient.newHttpClient();\n\n    private JsonNode send(HttpRequest request) throws IOException, InterruptedException {\n        var response = http.send(request, HttpResponse.BodyHandlers.ofString());\n        if (response.statusCode() >= 300) {\n            throw new IOException("Payment provider answered " + response.statusCode());\n        }\n        return JSON.readTree(response.body());\n    }\n\n';
    var jsonReq = 'HttpRequest.newBuilder(URI.create(%U)).header("Content-Type", "application/json")';
    var body, lines;
    if (a.payment === 'stripe') {
      body = '    public String create(String baseUrl) throws IOException, InterruptedException {\n        var form = new LinkedHashMap<String, String>();\n        form.put("mode", "payment");\n        form.put("success_url", baseUrl + "/?paid=1");\n        form.put("cancel_url", baseUrl + "/");\n        form.put("line_items[0][quantity]", "1");\n        form.put("line_items[0][price_data][currency]", "eur");\n        form.put("line_items[0][price_data][unit_amount]", "1000");\n        form.put("line_items[0][price_data][product_data][name]", "Example product");\n        var encoded = form.entrySet().stream()\n                .map(e -> URLEncoder.encode(e.getKey(), StandardCharsets.UTF_8) + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))\n                .collect(Collectors.joining("&"));\n        var request = HttpRequest.newBuilder(URI.create("https://api.stripe.com/v1/checkout/sessions"))\n                .header("Authorization", "Bearer " + System.getenv("STRIPE_SECRET_KEY"))\n                .header("Content-Type", "application/x-www-form-urlencoded")\n                .POST(HttpRequest.BodyPublishers.ofString(encoded))\n                .build();\n        return send(request).get("url").asText();\n    }\n';
      lines = [['/v1/checkout/sessions', 'Creates a Stripe-hosted payment page.'], ['Bearer', 'Logs in with your secret key. It only ever belongs on the server.'], ['URLEncoder', 'Stripe\'s API takes form-encoded data, not JSON.'], ['unit_amount', 'The price in the smallest unit, so 1000 is 10.00 euros.'], ['get("url")', 'The payment page to send the customer to.']];
    } else if (a.payment === 'adyen') {
      body = '    public String create(String baseUrl) throws IOException, InterruptedException {\n        var order = Map.of(\n                "merchantAccount", String.valueOf(System.getenv("ADYEN_MERCHANT")),\n                "reference", "order-" + System.currentTimeMillis(),\n                "amount", Map.of("currency", "EUR", "value", 1000),\n                "returnUrl", baseUrl + "/?paid=1");\n        var request = ' + jsonReq.replace('%U', '"https://checkout-test.adyen.com/v72/paymentLinks"') + '\n                .header("X-API-Key", String.valueOf(System.getenv("ADYEN_API_KEY")))\n                .POST(HttpRequest.BodyPublishers.ofString(JSON.writeValueAsString(order)))\n                .build();\n        return send(request).get("url").asText();\n    }\n';
      lines = [['checkout-test.adyen.com', 'Adyen\'s test system. Production uses a URL specific to your account.'], ['/paymentLinks', 'Creates an Adyen-hosted payment page.'], ['X-API-Key', 'Logs in with your API key.'], ['"value", 1000', 'The price in the smallest unit, so 10.00 euros.']];
    } else if (a.payment === 'paypal') {
      body = '    public String create(String baseUrl) throws IOException, InterruptedException {\n        var api = "https://api-m.sandbox.paypal.com";\n        var login = Base64.getEncoder().encodeToString((System.getenv("PAYPAL_CLIENT_ID") + ":" + System.getenv("PAYPAL_SECRET")).getBytes(StandardCharsets.UTF_8));\n        var tokenRequest = HttpRequest.newBuilder(URI.create(api + "/v1/oauth2/token"))\n                .header("Authorization", "Basic " + login)\n                .header("Content-Type", "application/x-www-form-urlencoded")\n                .POST(HttpRequest.BodyPublishers.ofString("grant_type=client_credentials"))\n                .build();\n        var token = send(tokenRequest).get("access_token").asText();\n        var order = Map.of(\n                "intent", "CAPTURE",\n                "purchase_units", List.of(Map.of("amount", Map.of("currency_code", "EUR", "value", "10.00"))),\n                "payment_source", Map.of("paypal", Map.of("experience_context", Map.of("return_url", baseUrl + "/?paid=1", "cancel_url", baseUrl + "/"))));\n        var request = ' + jsonReq.replace('%U', 'api + "/v2/checkout/orders"') + '\n                .header("Authorization", "Bearer " + token)\n                .POST(HttpRequest.BodyPublishers.ofString(JSON.writeValueAsString(order)))\n                .build();\n        for (var link : send(request).get("links")) {\n            if ("payer-action".equals(link.get("rel").asText())) {\n                return link.get("href").asText();\n            }\n        }\n        throw new IOException("PayPal didn\'t send a payment link");\n    }\n';
      lines = [['api-m.sandbox', 'PayPal\'s test system. Use <code>api-m.paypal.com</code> in production.'], ['/v1/oauth2/token', 'Exchanges your app\'s credentials for a short-lived token.'], ['"intent", "CAPTURE"', 'Takes payment immediately once the buyer approves.'], ['payer-action', 'The link where the buyer approves. After they return, capture the order on your server to actually take the money.']];
    } else {
      body = '    public String create(String baseUrl) throws IOException, InterruptedException {\n        var api = "https://api.playground.klarna.com";\n        var login = "Basic " + Base64.getEncoder().encodeToString((System.getenv("KLARNA_USER") + ":" + System.getenv("KLARNA_PASSWORD")).getBytes(StandardCharsets.UTF_8));\n        var order = Map.of(\n                "purchase_country", "SE",\n                "purchase_currency", "SEK",\n                "locale", "sv-SE",\n                "order_amount", 10000,\n                "order_lines", List.of(Map.of("name", "Example product", "quantity", 1, "unit_price", 10000, "total_amount", 10000)));\n        var sessionRequest = ' + jsonReq.replace('%U', 'api + "/payments/v1/sessions"') + '\n                .header("Authorization", login)\n                .POST(HttpRequest.BodyPublishers.ofString(JSON.writeValueAsString(order)))\n                .build();\n        var sessionId = send(sessionRequest).get("session_id").asText();\n        var page = Map.of(\n                "payment_session_url", api + "/payments/v1/sessions/" + sessionId,\n                "merchant_urls", Map.of("success", baseUrl + "/?paid=1", "cancel", baseUrl + "/", "back", baseUrl + "/", "failure", baseUrl + "/", "error", baseUrl + "/"));\n        var request = ' + jsonReq.replace('%U', 'api + "/hpp/v1/sessions"') + '\n                .header("Authorization", login)\n                .POST(HttpRequest.BodyPublishers.ofString(JSON.writeValueAsString(page)))\n                .build();\n        return send(request).get("redirect_url").asText();\n    }\n';
      lines = [['api.playground.klarna.com', 'Klarna\'s test system. Production uses <code>api.klarna.com</code> or a regional address.'], ['/payments/v1/sessions', 'Describes the order. Amounts are in the smallest unit, so 10000 is 100.00 SEK.'], ['/hpp/v1/sessions', 'Creates the Klarna-hosted payment page for that order.'], ['merchant_urls', 'Where Klarna returns the customer in each outcome.'], ['redirect_url', 'The payment page to send the customer to.']];
    }
    return { code: head + body + '}\n', lines: lines.concat([['HttpClient', 'Java\'s built-in HTTP client.'], ['send', 'Makes the request and reads the JSON answer. Anything other than success becomes an error.']]) };
  }

  function addLibrary(gradle, group, artifact, version) {
    if (gradle) return "printf \"\\ndependencies {\\n    implementation '" + group + ':' + artifact + (version ? ':' + version : '') + "'\\n}\\n\" >> build.gradle";
    return "sed -i '/<\\/dependencyManagement>/,$ s#<dependencies>#<dependencies>\\n        <dependency>\\n            <groupId>" + group + "</groupId>\\n            <artifactId>" + artifact + "</artifactId>" + (version ? '\\n            <version>' + version + '</version>' : '') + "\\n        </dependency>#' pom.xml";
  }

  var VAADIN_VERSION = '25.3.5';
  function addVaadin(gradle) {
    if (gradle) return "printf \"\\ndependencies {\\n    implementation platform('com.vaadin:vaadin-bom:" + VAADIN_VERSION + "')\\n    implementation 'com.vaadin:vaadin-quarkus-extension:" + VAADIN_VERSION + "'\\n}\\n\" >> build.gradle";
    return "sed -i '/<dependencyManagement>/,/<\\/dependencyManagement>/ s#<dependencies>#<dependencies>\\n            <dependency>\\n                <groupId>com.vaadin</groupId>\\n                <artifactId>vaadin-bom</artifactId>\\n                <version>" + VAADIN_VERSION + "</version>\\n                <type>pom</type>\\n                <scope>import</scope>\\n            </dependency>#' pom.xml\n" + addLibrary(false, 'com.vaadin', 'vaadin-quarkus-extension', VAADIN_VERSION);
  }

  // Java views for Vaadin, used as the whole frontend or only as the admin area.
  function vaadinViews(a) {
    var items = [], vaadin = a.frontend === 'vaadin', login = !!a.login, live = vaadin && (a.needs || []).indexOf('live') >= 0;
    var changed = live ? 'Updates.tasksChanged();' : a.transport ? 'live.tasksChanged();' : '';
    if (a.frontend !== 'vaadin' && a.admin === 'vaadin-admin') {
      items.push({ file: J + 'AdminServlet.java', lang: 'java', code: L(
        'package org.acme;', '',
        'import com.vaadin.quarkus.QuarkusVaadinServlet;',
        'import jakarta.servlet.annotation.WebServlet;', '',
        '@WebServlet(urlPatterns = "/admin/*", name = "AdminServlet", asyncSupported = true)',
        'public class AdminServlet extends QuarkusVaadinServlet {',
        '}'), lines: [
        ['urlPatterns', 'Vaadin only answers under <code>/admin</code>, which leaves the rest of the site to your frontend.'],
        ['asyncSupported', 'Lets Vaadin keep a connection open while it waits.']
      ] });
    }
    if (live) {
      items.push({ file: J + 'AppShell.java', lang: 'java', code: L(
        'package org.acme;', '',
        'import com.vaadin.flow.component.page.AppShellConfigurator;',
        'import com.vaadin.flow.component.page.Push;', '',
        '@Push',
        'public class AppShell implements AppShellConfigurator {',
        '}'), lines: [['@Push', 'Keeps a connection open, so your server can update a page without the browser asking. This is all the setup Vaadin needs.']] });
      items.push({ file: J + 'Updates.java', lang: 'java', code: L(
        'package org.acme;', '',
        'import java.util.Set;',
        'import java.util.concurrent.ConcurrentHashMap;', '',
        'final class Updates {',
        '    private static final Set<Runnable> listeners = ConcurrentHashMap.newKeySet();', '',
        '    private Updates() {',
        '    }', '',
        '    static Runnable listen(Runnable listener) {',
        '        listeners.add(listener);',
        '        return () -> listeners.remove(listener);',
        '    }', '',
        '    static void tasksChanged() {',
        '        listeners.forEach(Runnable::run);',
        '    }',
        '}'), lines: [
        ['newKeySet', 'A set that many threads can safely use at once, since each browser tab runs on its own.'],
        ['listen', 'Each open page signs up here, and gets back a way to sign out again.'],
        ['tasksChanged', 'Your views call this after changing data.']
      ] });
    }
    var guard = function (admin) {
      return L(
        '    @Override',
        '    public void beforeEnter(BeforeEnterEvent event) {',
        '        if (identity.isAnonymous()) {',
        '            event.getUI().getPage().setLocation("/login");',
        '            return;',
        '        }',
        admin ? '        if (!Admins.isAdmin(identity.getPrincipal().getName())) {\n            add(new Paragraph("You don\'t have access to this page."));\n            return;\n        }' : '',
        '        show();',
        '    }').replace(/\n\n/g, '\n');
    };
    if (vaadin) {
      var imports = ['com.vaadin.flow.component.button.Button', 'com.vaadin.flow.component.checkbox.Checkbox', 'com.vaadin.flow.component.html.H1', 'com.vaadin.flow.component.html.ListItem', 'com.vaadin.flow.component.html.UnorderedList', 'com.vaadin.flow.component.orderedlayout.VerticalLayout', 'com.vaadin.flow.component.textfield.TextField', 'com.vaadin.flow.router.PageTitle', 'com.vaadin.flow.router.Route', 'jakarta.inject.Inject'];
      if (login) imports.push('com.vaadin.flow.router.BeforeEnterEvent', 'com.vaadin.flow.router.BeforeEnterObserver', 'io.quarkus.security.identity.SecurityIdentity');
      if (live) imports.push('com.vaadin.flow.component.AttachEvent', 'com.vaadin.flow.component.DetachEvent');
      var body = [
        '@Route("")',
        '@PageTitle("Tasks")',
        'public class MainView extends VerticalLayout' + (login ? ' implements BeforeEnterObserver' : '') + ' {',
        '    private final TaskStore store;',
        login ? '    private final SecurityIdentity identity;' : null,
        '    private final UnorderedList list = new UnorderedList();',
        live ? '    private Runnable stopListening;' : null, '',
        '    @Inject',
        '    public MainView(TaskStore store' + (login ? ', SecurityIdentity identity' : '') + ') {',
        '        this.store = store;',
        login ? '        this.identity = identity;' : null,
        login ? '    }\n\n' + guard(false) + '\n    private void show() {' : null,
        '        add(new H1("Tasks"));',
        login ? '        add(new Button("Log out", e -> postTo("/logout")));' : null,
        a.payment ? '        add(new Button("Buy example product", e -> postTo("/api/checkout")));' : null,
        '        var title = new TextField();',
        '        title.setPlaceholder("New task");',
        '        var addButton = new Button("Add", e -> {',
        '            var clean = title.getValue().trim();',
        '            if (!clean.isEmpty() && clean.codePointCount(0, clean.length()) <= 200) {',
        '                store.add(clean);',
        '                title.clear();',
        '                refresh();',
        live ? '                Updates.tasksChanged();' : null,
        '            }',
        '        });',
        '        add(title, addButton, list);',
        '        refresh();',
        '    }', '',
        '    private void refresh() {',
        '        list.removeAll();',
        '        for (var task : store.list()) {',
        '            var box = new Checkbox(task.title(), task.done());',
        '            box.addValueChangeListener(e -> {',
        '                store.setDone(task.id(), e.getValue());',
        live ? '                Updates.tasksChanged();' : null,
        '            });',
        '            list.add(new ListItem(box));',
        '        }',
        '    }'
      ];
      if (login || a.payment) body.push('', '    private void postTo(String path) {', "        getElement().executeJs(\"const form = document.createElement('form'); form.method = 'post'; form.action = $0; document.body.append(form); form.submit();\", path);", '    }');
      if (live) body.push('', '    @Override', '    protected void onAttach(AttachEvent event) {', '        var ui = event.getUI();', '        stopListening = Updates.listen(() -> ui.access(this::refresh));', '    }', '', '    @Override', '    protected void onDetach(DetachEvent event) {', '        stopListening.run();', '    }');
      body.push('}');
      items.push({ file: J + 'MainView.java', lang: 'java', code: 'package org.acme;\n\n' + imports.sort().map(function (x) { return 'import ' + x + ';'; }).join('\n') + '\n\n' + body.filter(function (x) { return x !== null; }).join('\n') + '\n', lines: [
        ['@Route("")', 'This class is the page at your site\'s root.'],
        ['VerticalLayout', 'Stacks its contents from top to bottom. You build the page in Java, and Vaadin draws it in the browser.'],
        ['TextField', 'A text box. You read what was typed with <code>getValue</code>.'],
        ['new Button', 'The code after the label runs on your server when someone clicks.'],
        ['new Checkbox', 'Vaadin shows the label as plain text, so a title can\'t inject HTML.'],
        ['addValueChangeListener', 'Runs on your server when someone ticks the box.']
      ].concat(login ? [
        ['beforeEnter', 'Runs before the page opens. The tasks are only loaded after this check passes.'],
        ['setLocation', 'Sends the browser to your login page.'],
        ['postTo', 'Sends a normal form post from the browser, because logging out has to change the browser\'s cookie.']
      ] : []).concat(live ? [
        ['ui.access', 'Vaadin only lets one thread change a page at a time. This waits for its turn, then pushes the change to the browser.'],
        ['onDetach', 'Runs when a tab closes, so your server stops updating it.']
      ] : []) });
    }
    if (a.admin === 'vaadin-admin' || (vaadin && a.admin === 'in-app')) {
      var adminLive = changed ? '                ' + changed : null;
      var ai = ['com.vaadin.flow.component.button.Button', 'com.vaadin.flow.component.html.H1', 'com.vaadin.flow.component.html.ListItem', 'com.vaadin.flow.component.html.Paragraph', 'com.vaadin.flow.component.html.Span', 'com.vaadin.flow.component.html.UnorderedList', 'com.vaadin.flow.component.orderedlayout.VerticalLayout', 'com.vaadin.flow.router.BeforeEnterEvent', 'com.vaadin.flow.router.BeforeEnterObserver', 'com.vaadin.flow.router.PageTitle', 'com.vaadin.flow.router.Route', 'io.quarkus.security.identity.SecurityIdentity', 'jakarta.inject.Inject'];
      var useLive = !live && !!a.transport;
      var ab = [
        '@Route("' + (vaadin ? 'admin' : '') + '")',
        '@PageTitle("Admin")',
        'public class AdminView extends VerticalLayout implements BeforeEnterObserver {',
        '    private final TaskStore store;',
        '    private final SecurityIdentity identity;',
        useLive ? '    private final Live live;' : null,
        '    private final UnorderedList list = new UnorderedList();', '',
        '    @Inject',
        '    public AdminView(TaskStore store, SecurityIdentity identity' + (useLive ? ', Live live' : '') + ') {',
        '        this.store = store;',
        '        this.identity = identity;',
        useLive ? '        this.live = live;' : null,
        '    }', '',
        guard(true),
        '    private void show() {',
        '        add(new H1("Admin: all tasks"), list);',
        '        refresh();',
        '    }', '',
        '    private void refresh() {',
        '        list.removeAll();',
        '        for (var task : store.list()) {',
        '            var delete = new Button("Delete", e -> {',
        '                store.delete(task.id());',
        '                refresh();',
        adminLive,
        '            });',
        '            list.add(new ListItem(new Span(task.title() + (task.done() ? " (done) " : " ")), delete));',
        '        }',
        '    }',
        '}'
      ];
      items.push({ file: J + 'AdminView.java', lang: 'java', code: 'package org.acme;\n\n' + ai.sort().map(function (x) { return 'import ' + x + ';'; }).join('\n') + '\n\n' + ab.filter(function (x) { return x !== null; }).join('\n').replace(/\n\n+/g, '\n\n') + '\n', lines: [
        ['@Route("' + (vaadin ? 'admin' : '') + '")', vaadin ? 'This page is at <code>/admin</code>.' : 'The root of this servlet, so the page is at <code>/admin</code>.'],
        ['beforeEnter', 'Checks on the server before anything loads. Hiding a link isn\'t protection, because anyone can type a URL.'],
        ['isAdmin', 'Compares the logged-in email with your <code>ADMIN_EMAILS</code> list.'],
        ['new Span', 'Vaadin shows this as plain text, so a title can\'t inject HTML.']
      ] });
    }
    return items;
  }

  function quarkus(a) {
    var gradle = a.build === 'gradle', s = [];
    var spa = Kit.isSpa(a), templates = a.frontend === 'server-templates', login = !!a.login, oidc = Kit.usesOidc(a), own = a.login === 'own';
    var isRest = a.api === 'rest', isGql = a.api === 'graphql', mongo = a.database === 'mongodb';
    var vaadin = a.frontend === 'vaadin', qAdmin = a.admin === 'in-app' && !vaadin;
    var pages = templates || qAdmin || own;
    var run = gradle ? './gradlew' : './mvnw';
    var buildCmd = gradle ? './gradlew build' : './mvnw package';
    var devCmd = gradle ? './gradlew quarkusDev' : './mvnw quarkus:dev';
    var appDir = gradle ? 'build/quarkus-app' : 'target/quarkus-app';

    s.push({ id: 'tools', title: 'Install your tools', items: [
      { p: 'You need a JDK, version 25, for example from <a href="https://adoptium.net/">Adoptium</a>. Quarkus itself runs on 17 or newer. ' + (spa || vaadin || a.admin === 'vaadin-admin' || a.admin === 'low-code' ? 'You also need <a href="https://nodejs.org/en/download">Node.js</a> 22.12 or newer to build the frontend. ' : '') + 'The project comes with its own copy of ' + (gradle ? 'Gradle' : 'Maven') + ', so you don\'t install that. Commands assume a Unix-style terminal. On Windows, use Git Bash or WSL.' },
      { cmd: 'java -version', lines: [['java', 'Should print version 25.']] }
    ] });

    var ext = ['io.quarkus:quarkus-rest-jackson'];
    if (mongo) ext.push('io.quarkus:quarkus-mongodb-client');
    else {
      ext.push(JDBC[a.database][0]);
      ext.push(a.migrations === 'liquibase' ? 'io.quarkus:quarkus-liquibase' : 'io.quarkus:quarkus-flyway');
      if (a.data === 'jpa') ext.push('io.quarkus:quarkus-hibernate-orm');
      if (a.data === 'jooq') ext.push('io.quarkiverse.jooq:quarkus-jooq');
      if (a.data === 'mybatis') ext.push('io.quarkiverse.mybatis:quarkus-mybatis');
      if (a.data !== 'jpa') ext.push('io.quarkus:quarkus-narayana-jta');
    }
    if (pages) ext.push('io.quarkus:quarkus-rest-qute');
    if (isGql) ext.push('io.quarkus:quarkus-smallrye-graphql');
    if (a.transport === 'websocket') ext.push('io.quarkus:quarkus-websockets-next');
    if (own) ext.push('io.quarkus:quarkus-elytron-security-jdbc');
    if (oidc) ext.push('io.quarkus:quarkus-oidc');
    var url = 'https://code.quarkus.io/d?g=org.acme&a=demo&b=' + (gradle ? 'GRADLE' : 'MAVEN') + '&nc=true&j=25&' + ext.map(function (e) { return 'e=' + e; }).join('&');
    var flywayDb = !mongo && a.migrations !== 'liquibase' ? { postgresql: 'org.flywaydb:flyway-database-postgresql', mysql: 'org.flywaydb:flyway-mysql', sqlserver: 'org.flywaydb:flyway-sqlserver' }[a.database] : '';
        s.push({ id: 'project', title: 'Create the project', items: [
      { cmd: 'curl -fsSL -o demo.zip "' + url + '"\nunzip -q demo.zip\nrm demo.zip\ncd demo\nchmod +x ' + (gradle ? 'gradlew' : 'mvnw'), lines: [
        ['code.quarkus.io', 'Quarkus\'s project generator. You can pick the same options on that website instead.'],
        ['b=' + (gradle ? 'GRADLE' : 'MAVEN'), 'Your build tool.'],
        ['nc=true', 'Leaves out the sample code, because this guide writes its own.'],
        ['j=25', 'Your Java version.'],
        ['e=', 'Each one adds an extension: a library that\'s prepared for Quarkus.']
      ] }
    ].concat(flywayDb ? [{ cmd: addLibrary(gradle, flywayDb.split(':')[0], flywayDb.split(':')[1]), lines: [[flywayDb.split(':')[1], 'Flyway\'s support for your database. It isn\'t an extension, so this adds it to your build file directly. Quarkus knows which version to use.']].concat(gradle ? [] : [['sed -i', 'Edits <code>pom.xml</code> in place, adding the library to your project\'s list. On macOS, whose <code>sed</code> differs, add those lines by hand.']]) }] : []) });

    if (vaadin || a.admin === 'vaadin-admin') s[s.length - 1].items.push({ cmd: addVaadin(gradle), lines: [
      ['vaadin-bom', 'Keeps all of Vaadin\'s libraries on versions that work together.'],
      ['vaadin-quarkus-extension', 'Connects Vaadin to Quarkus. It also builds the browser side of your app when you package it, so there\'s no separate Vaadin plugin to set up.']
    ].concat(gradle ? [['enforcedPlatform', 'Keeps Vaadin\'s libraries on the versions it lists.']] : [['sed -i', 'Edits <code>pom.xml</code> in place. You could also make these changes by hand.']]) });

    // Settings
    var props = ['quarkus.http.port=${PORT:3000}', 'quarkus.devservices.enabled=false'];
    if (mongo) props.push('quarkus.mongodb.connection-string=${DATABASE_URL:mongodb://localhost:27017/demo}');
    else {
      props.push('quarkus.datasource.db-kind=' + JDBC[a.database][1], 'quarkus.datasource.jdbc.url=${DATABASE_URL:' + JDBC[a.database][2] + '}');
      if (a.database !== 'h2') props.push('quarkus.datasource.username=${DB_USER:' + { postgresql: 'postgres', mysql: 'root', sqlserver: 'sa' }[a.database] + '}', 'quarkus.datasource.password=${DB_PASSWORD:}');
      if (a.migrations === 'liquibase') props.push('quarkus.liquibase.migrate-at-start=true', 'quarkus.liquibase.change-log=db/changeLog.sql');
      else props.push('quarkus.flyway.migrate-at-start=true');
      if (a.data === 'jpa') props.push('quarkus.hibernate-orm.schema-management.strategy=none');
      if (a.data === 'jooq') props.push('quarkus.jooq.dialect=' + { postgresql: 'POSTGRES', mysql: 'MYSQL', h2: 'H2' }[a.database]);
    }
    if (own) props.push('quarkus.http.auth.form.enabled=true', 'quarkus.http.auth.form.login-page=', 'quarkus.http.auth.form.error-page=/login-failed', 'quarkus.http.auth.form.landing-page=/', 'quarkus.http.auth.form.post-location=/login', 'quarkus.http.auth.form.username-parameter=email', 'quarkus.http.auth.form.password-parameter=password', 'quarkus.http.auth.form.http-only-cookie=true', 'quarkus.http.auth.form.cookie-same-site=lax', 'quarkus.http.auth.session.encryption-key=${SESSION_SECRET:}');
    if (oidc) props.push('quarkus.oidc.auth-server-url=${OIDC_ISSUER:http://localhost:8180/realms/demo}', 'quarkus.oidc.client-id=${OIDC_CLIENT_ID:demo-app}', 'quarkus.oidc.credentials.secret=${OIDC_CLIENT_SECRET:}', 'quarkus.oidc.application-type=web-app', 'quarkus.oidc.authentication.scopes=profile,email', 'quarkus.oidc.authentication.redirect-path=/auth/callback', 'quarkus.oidc.authentication.restore-path-after-redirect=false', 'quarkus.oidc.authentication.java-script-auto-redirect=false', 'quarkus.oidc.token.principal-claim=email', '%test.quarkus.oidc.tenant-enabled=false');
    if (login) props.push('quarkus.http.auth.permission.app.paths=' + ['/api/*'].concat(isGql ? ['/graphql'] : []).concat(templates ? ['/tasks', '/tasks/*'] : []).join(','), 'quarkus.http.auth.permission.app.policy=authenticated');
    if (oidc) props.push('quarkus.http.auth.permission.signin.paths=/login,/auth/callback', 'quarkus.http.auth.permission.signin.policy=authenticated');

    var dbItems = Kit.dbSetup(a);
    if (a.database === 'h2') dbItems = [{ p: 'H2 runs inside your app and stores its data in a file in the project folder, so there\'s nothing to install or start. It suits development and small single-server sites.' }];
    var dbEnv = mongo ? 'export DATABASE_URL="mongodb://localhost:27017/demo"' : a.database === 'h2' ? '' : 'export DB_PASSWORD=your-password';
    if (dbEnv) dbItems.push({ cmd: dbEnv, manual: true, lines: [[mongo ? 'DATABASE_URL' : 'DB_PASSWORD', 'A setting read from the environment, which keeps secrets out of your code.'], ['export', 'Applies to this terminal and the programs it starts, so set it again in a new terminal.']] });
    dbItems = dbItems.concat(mongo ? [{ p: 'MongoDB has no fixed table structure, so there are no migrations to run. Collections are created the first time you save data.' }] : migrationFiles(a, own));
    dbItems.push({ file: 'src/main/resources/application.properties', lang: 'text', code: props.join('\n') + '\n', lines: [
      ['${PORT:3000}', 'Reads an environment variable, with a default after the colon. Hosting platforms choose the port this way.'],
      ['devservices.enabled=false', 'Quarkus would otherwise try to start a database in Docker for you, and this guide connects to yours.']
    ].concat(mongo ? [['connection-string', 'Where MongoDB is, including the database name.']] : [
      ['db-kind', 'Which kind of database you use. This is fixed when you build.'],
      ['jdbc.url', 'Where the database is. Set <code>DATABASE_URL</code> to use another one.'],
      [a.migrations === 'liquibase' ? 'liquibase.migrate-at-start' : 'flyway.migrate-at-start', 'Runs any new migrations each time the app starts.']
    ]).concat(a.data === 'jpa' && !mongo ? [['schema-management.strategy=none', 'Stops Hibernate from changing tables by itself. Your migrations own the structure.']] : [])
     .concat(a.data === 'jooq' && !mongo ? [['jooq.dialect', 'Which kind of SQL jOOQ writes.']] : [])
     .concat(own ? [
       ['auth.form.enabled', 'Turns on login through an HTML form, with an encrypted session cookie.'],
       ['login-page=', 'Left empty, so a visitor who isn\'t logged in gets a 401. Pages then send them to the login page themselves, and your frontend can do the same.'],
       ['error-page', 'Where a wrong password goes.'],
       ['post-location', 'The address the login form posts to. Quarkus handles it for you.'],
       ['username-parameter', 'The name of the email field in your form.'],
       ['http-only-cookie', 'Stops page scripts from reading the cookie, and is what logging out needs.'],
       ['cookie-same-site=lax', 'Keeps the cookie off forms posted from other sites, while still sending it when someone follows a link to your site.'],
       ['encryption-key', 'Encrypts the session cookie. Anyone with it could forge a login, so keep it private.']
     ] : [])
     .concat(oidc ? [
       ['auth-server-url', 'Your provider\'s address. Quarkus finds its login and token addresses from it.'],
       ['application-type=web-app', 'Sends visitors to the provider\'s login page, and keeps them logged in with a cookie.'],
       ['redirect-path', 'Where the provider sends people back to.'],
       ['java-script-auto-redirect=false', 'Calls from page scripts get an error code rather than a redirect, because a script can\'t follow a redirect to a login page.'],
       ['principal-claim=email', 'Identifies people by their email, which is what <code>ADMIN_EMAILS</code> lists.'],
       ['%test.', 'Applies only while testing, so tests don\'t need your provider.']
     ] : [])
     .concat(login ? [['auth.permission', 'Requires a login for these paths, before any of your code runs.']] : []) });
    dbItems.push({ file: J + 'Task.java', lang: 'java', code: 'package org.acme;\n\n' + (pages ? 'import io.quarkus.qute.TemplateData;\n' : '') + (isGql ? 'import org.eclipse.microprofile.graphql.Id;\nimport org.eclipse.microprofile.graphql.NonNull;\n' : '') + (pages || isGql ? '\n' : '') + (pages ? '@TemplateData\n' : '') + 'public record Task(' + (isGql ? '@Id @NonNull String id, @NonNull String title, boolean done' : 'String id, String title, boolean done') + ') {\n}\n', lines: TASK_RECORD_LINES.concat(pages ? [['@TemplateData', 'Lets templates read this record\'s fields.']] : []).concat(isGql ? [['@Id and @NonNull', 'Describe the field in your GraphQL schema: an ID that\'s never empty.']] : []) });
    dbItems = dbItems.concat(storeItems(a, own));
    s.push({ id: 'db', title: 'Set up the database', items: dbItems });

    // Login
    if (login) {
      var li = [];
      if (oidc) li = li.concat(Kit.oidcSetup(a, '/auth/callback', 3000));
      li.push({ cmd: (own ? 'export SESSION_SECRET="$(openssl rand -base64 32)"\n' : '') + 'export ADMIN_EMAILS=you@example.com', lines: (own ? [['openssl rand -base64 32', 'Generates a random secret. Save the value somewhere safe and reuse it, because changing it logs everyone out.']] : []).concat([['ADMIN_EMAILS', 'A comma-separated list of admin accounts.']]) });
      if (own) li.push({ file: J + 'PasswordLogin.java', lang: 'java', code: 'package org.acme;\n\nimport io.quarkus.elytron.security.common.BcryptUtil;\nimport io.quarkus.security.AuthenticationFailedException;\nimport io.quarkus.security.identity.AuthenticationRequestContext;\nimport io.quarkus.security.identity.IdentityProvider;\nimport io.quarkus.security.identity.SecurityIdentity;\nimport io.quarkus.security.identity.request.UsernamePasswordAuthenticationRequest;\nimport io.quarkus.security.runtime.QuarkusPrincipal;\nimport io.quarkus.security.runtime.QuarkusSecurityIdentity;\nimport io.smallrye.mutiny.Uni;\nimport jakarta.enterprise.context.ApplicationScoped;\nimport jakarta.inject.Inject;\nimport java.util.Locale;\n\n@ApplicationScoped\npublic class PasswordLogin implements IdentityProvider<UsernamePasswordAuthenticationRequest> {\n    @Inject\n    TaskStore store;\n\n    @Override\n    public Class<UsernamePasswordAuthenticationRequest> getRequestType() {\n        return UsernamePasswordAuthenticationRequest.class;\n    }\n\n    @Override\n    public Uni<SecurityIdentity> authenticate(UsernamePasswordAuthenticationRequest request, AuthenticationRequestContext context) {\n        return context.runBlocking(() -> {\n            var email = request.getUsername().trim().toLowerCase(Locale.ROOT);\n            var hash = store.findPasswordHash(email);\n            var password = new String(request.getPassword().getPassword());\n            if (hash == null || !BcryptUtil.matches(password, hash)) {\n                throw new AuthenticationFailedException();\n            }\n            return QuarkusSecurityIdentity.builder().setPrincipal(new QuarkusPrincipal(email)).build();\n        });\n    }\n}\n', lines: [['IdentityProvider', 'Quarkus calls this to check a login. Writing your own works with any database or library.'], ['runBlocking', 'Database calls can\'t run on the threads that accept requests, so this moves it to a worker.'], ['BcryptUtil.matches', 'Checks a password against the stored one-way hash.'], ['AuthenticationFailedException', 'Means a wrong email or password, which sends the visitor to the error page.']] });
      if (own) li.push({ file: J + 'SessionLogin.java', lang: 'java', code: 'package org.acme;\n\nimport io.quarkus.security.identity.AuthenticationRequestContext;\nimport io.quarkus.security.identity.IdentityProvider;\nimport io.quarkus.security.identity.SecurityIdentity;\nimport io.quarkus.security.identity.request.TrustedAuthenticationRequest;\nimport io.quarkus.security.runtime.QuarkusPrincipal;\nimport io.quarkus.security.runtime.QuarkusSecurityIdentity;\nimport io.smallrye.mutiny.Uni;\nimport jakarta.enterprise.context.ApplicationScoped;\n\n@ApplicationScoped\npublic class SessionLogin implements IdentityProvider<TrustedAuthenticationRequest> {\n    @Override\n    public Class<TrustedAuthenticationRequest> getRequestType() {\n        return TrustedAuthenticationRequest.class;\n    }\n\n    @Override\n    public Uni<SecurityIdentity> authenticate(TrustedAuthenticationRequest request, AuthenticationRequestContext context) {\n        return Uni.createFrom().item(QuarkusSecurityIdentity.builder().setPrincipal(new QuarkusPrincipal(request.getPrincipal())).build());\n    }\n}\n', lines: [['TrustedAuthenticationRequest', 'Used on later requests, when the visitor\'s encrypted cookie has already proved who they are.']] });
      if (a.admin === 'in-app' || a.admin === 'vaadin-admin') li.push({ file: J + 'Admins.java', lang: 'java', code: 'package org.acme;\n\nimport java.util.Arrays;\nimport java.util.Locale;\nimport java.util.Objects;\n\nfinal class Admins {\n    private Admins() {\n    }\n\n    static boolean isAdmin(String email) {\n        var list = Objects.requireNonNullElse(System.getenv("ADMIN_EMAILS"), "");\n        return Arrays.stream(list.split(",")).anyMatch(admin -> admin.trim().equalsIgnoreCase(email.toLowerCase(Locale.ROOT)));\n    }\n}\n', lines: [['isAdmin', 'Treats the emails listed in <code>ADMIN_EMAILS</code> as admins, so you don\'t need a separate roles system to start.']] });
      if (oidc && spa) li.push({ file: J + 'ScriptRequests.java', lang: 'java', code: 'package org.acme;\n\nimport io.quarkus.oidc.JavaScriptRequestChecker;\nimport io.vertx.ext.web.RoutingContext;\nimport jakarta.enterprise.context.ApplicationScoped;\n\n@ApplicationScoped\npublic class ScriptRequests implements JavaScriptRequestChecker {\n    @Override\n    public boolean isJavaScriptRequest(RoutingContext context) {\n        return !"/login".equals(context.normalizedPath());\n    }\n}\n', lines: [['isJavaScriptRequest', 'Only the login page itself redirects to your provider. Other logged-out requests get the status 499, and your frontend then opens the login page.']] });
      s.push({ id: 'login', title: 'Add login', items: li });
    }

    // Live updates
    if (a.transport) {
      var liveItems = [], code, ll;
      if (a.transport === 'sse') {
        code = 'package org.acme;\n\nimport io.smallrye.mutiny.Multi;\nimport io.smallrye.mutiny.operators.multi.processors.BroadcastProcessor;\nimport jakarta.enterprise.context.ApplicationScoped;\nimport jakarta.ws.rs.GET;\nimport jakarta.ws.rs.Path;\nimport jakarta.ws.rs.Produces;\nimport jakarta.ws.rs.core.MediaType;\nimport org.jboss.resteasy.reactive.RestStreamElementType;\n\n@Path("/api/live")\n@ApplicationScoped\npublic class Live {\n    private final BroadcastProcessor<String> changes = BroadcastProcessor.create();\n\n    public void tasksChanged() {\n        changes.onNext("changed");\n    }\n\n    @GET\n    @Produces(MediaType.SERVER_SENT_EVENTS)\n    @RestStreamElementType(MediaType.TEXT_PLAIN)\n    public Multi<String> events() {\n        return changes;\n    }\n}\n';
        ll = [['BroadcastProcessor', 'A stream that many listeners can share. Each message reaches them all.'], ['tasksChanged', 'Your routes call this after changing data.'], ['SERVER_SENT_EVENTS', 'Keeps the response open, and sends each value as one event.']];
      }
      if (a.transport === 'websocket') {
        code = 'package org.acme;\n\nimport io.quarkus.websockets.next.OnOpen;\nimport io.quarkus.websockets.next.OpenConnections;\nimport io.quarkus.websockets.next.WebSocket;\nimport jakarta.inject.Inject;\nimport jakarta.inject.Singleton;\n\n@WebSocket(path = "/live")\n@Singleton\npublic class Live {\n    @Inject\n    OpenConnections connections;\n\n    @OnOpen\n    void opened() {\n    }\n\n    public void tasksChanged() {\n        connections.forEach(connection -> connection.sendTextAndAwait("changed"));\n    }\n}\n';
        ll = [['@WebSocket', 'Accepts WebSocket connections at this path, on the same port as your web server.'], ['OpenConnections', 'Every open connection, so a change can reach them all.'], ['sendTextAndAwait', 'Sends the message, and waits until it has gone out.']];
      }
      if (a.transport === 'managed') {
        liveItems.push({ p: 'Create a free <a href="https://ably.com/docs/getting-started">Ably</a> account and copy an API key.' }, { cmd: 'export ABLY_API_KEY=your-key', manual: true, lines: [['ABLY_API_KEY', 'Your secret key. It stays on the server.']] });
        liveItems.push({ cmd: addLibrary(gradle, 'io.ably', 'ably-java', '1.8.2'), lines: [['ably-java', 'Ably\'s official library. It isn\'t a Quarkus extension, so this adds it to your build file directly, with its version.']] });
        code = 'package org.acme;\n\nimport io.ably.lib.rest.AblyRest;\nimport io.ably.lib.rest.Auth;\nimport io.ably.lib.types.AblyException;\nimport jakarta.annotation.PostConstruct;\nimport jakarta.enterprise.context.ApplicationScoped;\nimport jakarta.ws.rs.GET;\nimport jakarta.ws.rs.Path;\nimport jakarta.ws.rs.Produces;\nimport jakarta.ws.rs.core.MediaType;\n\n@Path("/api/live-token")\n@ApplicationScoped\npublic class Live {\n    private AblyRest rest;\n\n    @PostConstruct\n    void connect() {\n        try {\n            var key = System.getenv("ABLY_API_KEY");\n            rest = key == null ? null : new AblyRest(key);\n        } catch (AblyException e) {\n            throw new IllegalStateException(e);\n        }\n    }\n\n    @GET\n    @Produces(MediaType.APPLICATION_JSON)\n    public String token() throws AblyException {\n        var params = new Auth.TokenParams();\n        params.capability = "{\\"tasks\\":[\\"subscribe\\"]}";\n        return rest.auth.createTokenRequest(params, null).asJson();\n    }\n\n    public void tasksChanged() {\n        if (rest == null) {\n            return;\n        }\n        try {\n            rest.channels.get("tasks").publish("changed", "");\n        } catch (AblyException e) {\n            System.err.println(e.getMessage());\n        }\n    }\n}\n';
        ll = [['AblyRest', 'Sends messages to Ably over normal HTTP requests.'], ['createTokenRequest', 'Gives the browser a short-lived permission that can only subscribe, so your key stays secret.'], ['publish', 'Ably delivers this to every subscribed browser.']];
      }
      liveItems.push({ file: J + 'Live.java', lang: 'java', code: code, lines: ll });
      s.push({ id: 'live', title: 'Add live updates', items: liveItems });
    }

    // Payments
    if (a.payment) {
      var pay = checkoutCode(a);
      s.push({ id: 'pay', title: 'Add payments with ' + Kit.PAYMENT[a.payment].name, items: Kit.paymentIntro(a).concat([{ file: J + 'Checkout.java', lang: 'java', code: pay.code, lines: pay.lines }]).concat(Kit.paymentOutro(a)) });
    }

    // Routes
    var appItems = vaadinViews(a);
    var liveField = a.transport ? '    @Inject\n    Live live;\n\n' : '';
    var notify = a.transport ? '\n        live.tasksChanged();' : '';
    if (isRest) {
      appItems.push({ file: J + 'TaskResource.java', lang: 'java', code: 'package org.acme;\n\nimport jakarta.inject.Inject;\nimport jakarta.ws.rs.Consumes;\nimport jakarta.ws.rs.GET;\nimport jakarta.ws.rs.NotFoundException;\nimport jakarta.ws.rs.POST;\nimport jakarta.ws.rs.PUT;\nimport jakarta.ws.rs.Path;\nimport jakarta.ws.rs.Produces;\nimport jakarta.ws.rs.core.MediaType;\nimport jakarta.ws.rs.core.Response;\nimport java.util.Map;\n\n@Path("/api/tasks")\n@Produces(MediaType.APPLICATION_JSON)\n@Consumes(MediaType.APPLICATION_JSON)\npublic class TaskResource {\n    public record NewTask(String title) {\n    }\n\n    public record Change(boolean done) {\n    }\n\n    @Inject\n    TaskStore store;\n\n' + liveField + '    @GET\n    public Response list() {\n        var tasks = store.list();\n        return Response.ok(tasks)\n                .header("Content-Range", "tasks 0-" + tasks.size() + "/" + tasks.size())\n                .header("Access-Control-Expose-Headers", "Content-Range")\n                .build();\n    }\n\n    @GET\n    @Path("/{id}")\n    public Task one(String id) {\n        return store.list().stream().filter(t -> t.id().equals(id)).findFirst().orElseThrow(NotFoundException::new);\n    }\n\n    @POST\n    public Response create(NewTask body) {\n        var title = body == null || body.title() == null ? "" : body.title().trim();\n        if (title.isEmpty() || title.codePointCount(0, title.length()) > 200) {\n            return Response.status(400).entity(Map.of("error", "A title of 1 to 200 characters is required")).build();\n        }\n        var task = store.add(title);' + notify + '\n        return Response.status(201).entity(task).build();\n    }\n\n    @PUT\n    @Path("/{id}")\n    public Task change(String id, Change body) {\n        store.setDone(id, body.done());' + notify + '\n        return one(id);\n    }\n}\n', lines: [
        ['@Path', 'The URL this class answers, under the site\'s root.'],
        ['@Produces and @Consumes', 'Sends and reads JSON.'],
        ['@Inject', 'Quarkus hands this class the object it needs.'],
        ['Content-Range', 'Tells clients how many rows exist. React-admin needs this.'],
        ['String id', 'A parameter named after the <code>{id}</code> part of the URL gets its value.'],
        ['NotFoundException', 'Throwing it sends a 404 response.'],
        ['status(201)', 'The standard status for &quot;created&quot;.']
      ] });
    }
    if (isGql) {
      appItems.push({ file: J + 'TaskGraph.java', lang: 'java', code: 'package org.acme;\n\nimport jakarta.inject.Inject;\nimport java.util.List;\nimport org.eclipse.microprofile.graphql.GraphQLApi;\nimport org.eclipse.microprofile.graphql.Id;\nimport org.eclipse.microprofile.graphql.Mutation;\nimport org.eclipse.microprofile.graphql.Name;\nimport org.eclipse.microprofile.graphql.NonNull;\nimport org.eclipse.microprofile.graphql.Query;\n\n@GraphQLApi\npublic class TaskGraph {\n    @Inject\n    TaskStore store;\n\n' + liveField + '    @Query("tasks")\n    public @NonNull List<@NonNull Task> tasks() {\n        return store.list();\n    }\n\n    @Mutation("addTask")\n    public @NonNull Task addTask(@Name("title") @NonNull String title) {\n        var task = store.add(title);' + notify + '\n        return task;\n    }\n\n    @Mutation("setDone")\n    public boolean setDone(@Name("id") @Id @NonNull String id, @Name("done") boolean done) {\n        store.setDone(id, done);' + notify + '\n        return true;\n    }\n}\n', lines: [['@GraphQLApi', 'Serves these methods at <code>/graphql</code>. Quarkus builds the schema from them.'], ['@Query and @Mutation', 'Mark methods that read and change data.'], ['@Name', 'The argument\'s name in GraphQL.'], ['@Id and @NonNull', 'Make the argument a required ID.']] });
    }
    if (pages || login || a.payment) {
      var imp = ['jakarta.inject.Inject', 'jakarta.ws.rs.Path', 'jakarta.ws.rs.core.Response'];
      var parts = [], fields = [];
      if (pages) imp.push('io.quarkus.qute.Template', 'jakarta.ws.rs.GET', 'jakarta.ws.rs.Produces', 'jakarta.ws.rs.core.MediaType');
      var needStore = templates || qAdmin || own;
      if (needStore) fields.push('    @Inject\n    TaskStore store;\n');
      if (a.transport && (templates || qAdmin)) fields.push('    @Inject\n    Live live;\n');
      if (login) { imp.push('io.quarkus.security.identity.SecurityIdentity', 'java.net.URI', 'jakarta.ws.rs.POST'); fields.push('    @Inject\n    SecurityIdentity identity;\n'); }
      if (templates) { imp.push('jakarta.ws.rs.FormParam', 'jakarta.ws.rs.POST', 'jakarta.ws.rs.Consumes'); fields.push('    @Inject\n    Template index;\n', '    @Inject\n    Template list;\n'); }
      if (own) { imp.push('jakarta.ws.rs.FormParam', 'jakarta.ws.rs.POST', 'io.quarkus.vertx.http.runtime.security.FormAuthenticationMechanism', 'io.quarkus.elytron.security.common.BcryptUtil', 'io.quarkus.qute.Location', 'java.util.Locale', 'jakarta.ws.rs.Consumes', 'java.net.URI'); fields.push('    @Inject\n    Template login;\n'); }
      if (oidc) { imp.push('io.quarkus.oidc.OidcSession', 'jakarta.ws.rs.GET'); fields.push('    @Inject\n    OidcSession session;\n'); }
      if (qAdmin) { imp.push('jakarta.ws.rs.ForbiddenException', 'jakarta.ws.rs.POST'); fields.push('    @Inject\n    Template admin;\n'); }
      if (a.payment) { imp.push('jakarta.ws.rs.POST', 'jakarta.ws.rs.core.Context', 'jakarta.ws.rs.core.UriInfo', 'java.net.URI', 'java.io.IOException'); fields.push('    @Inject\n    Checkout checkout;\n'); }
      imp = imp.filter(function (x) { return x !== 'io.quarkus.qute.Location'; });
      if (templates) {
        parts.push('    @GET\n    @Path("/")\n    @Produces(MediaType.TEXT_HTML)\n    public Response home() {\n' + (login ? '        if (identity.isAnonymous()) {\n            return Response.seeOther(URI.create("/login")).build();\n        }\n' : '') + '        return Response.ok(index.data("tasks", store.list())).build();\n    }\n');
        parts.push('    @GET\n    @Path("/tasks")\n    @Produces(MediaType.TEXT_HTML)\n    public Response listPart() {\n        return Response.ok(list.data("tasks", store.list())).build();\n    }\n');
        parts.push('    @POST\n    @Path("/tasks")\n    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)\n    @Produces(MediaType.TEXT_HTML)\n    public Response add(@FormParam("title") String title) {\n        var clean = title == null ? "" : title.trim();\n        if (!clean.isEmpty() && clean.codePointCount(0, clean.length()) <= 200) {\n            store.add(clean);' + (a.transport ? '\n            live.tasksChanged();' : '') + '\n        }\n        return listPart();\n    }\n');
        parts.push('    @POST\n    @Path("/tasks/{id}/toggle")\n    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)\n    @Produces(MediaType.TEXT_HTML)\n    public Response toggle(String id, @FormParam("done") String done) {\n        store.setDone(id, "on".equals(done));' + notify + '\n        return listPart();\n    }\n');
      }
      if (own) {
        parts.push('    @GET\n    @Path("/login")\n    @Produces(MediaType.TEXT_HTML)\n    public Response loginPage() {\n        return Response.ok(login.data("error", "")).build();\n    }\n');
        parts.push('    @GET\n    @Path("/login-failed")\n    @Produces(MediaType.TEXT_HTML)\n    public Response loginFailed() {\n        return Response.status(401).entity(login.data("error", "Wrong email or password.")).build();\n    }\n');
        parts.push('    @POST\n    @Path("/signup")\n    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)\n    @Produces(MediaType.TEXT_HTML)\n    public Response signUp(@FormParam("email") String email, @FormParam("password") String password) {\n        var clean = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);\n        if (!clean.contains("@") || password == null || password.length() < 8) {\n            return Response.status(400).entity(login.data("error", "Use a real email and a password of at least 8 characters.")).build();\n        }\n        if (store.findPasswordHash(clean) != null) {\n            return Response.status(409).entity(login.data("error", "That email can\'t be used. Try logging in.")).build();\n        }\n        store.addUser(clean, BcryptUtil.bcryptHash(password));\n        return Response.temporaryRedirect(URI.create("/login")).build();\n    }\n');
        parts.push('    @POST\n    @Path("/logout")\n    public Response logOut() {\n        if (!identity.isAnonymous()) {\n            FormAuthenticationMechanism.logout(identity);\n        }\n        return Response.seeOther(URI.create("/login")).build();\n    }\n');
      }
      if (oidc) {
        parts.push('    @GET\n    @Path("/login")\n    public Response signedIn() {\n        return Response.seeOther(URI.create("/")).build();\n    }\n');
        parts.push('    @POST\n    @Path("/logout")\n    public Response logOut() {\n        if (!identity.isAnonymous()) {\n            session.logout().await().indefinitely();\n        }\n        return Response.seeOther(URI.create("/")).build();\n    }\n');
      }
      if (qAdmin) {
        parts.push('    private Response adminOnly() {\n        if (identity.isAnonymous()) {\n            return Response.seeOther(URI.create("/login")).build();\n        }\n        if (!Admins.isAdmin(identity.getPrincipal().getName())) {\n            throw new ForbiddenException();\n        }\n        return null;\n    }\n');
        parts.push('    @GET\n    @Path("/admin")\n    @Produces(MediaType.TEXT_HTML)\n    public Response adminPage() {\n        var stop = adminOnly();\n        return stop != null ? stop : Response.ok(admin.data("tasks", store.list())).build();\n    }\n');
        parts.push('    @POST\n    @Path("/admin/tasks/{id}/delete")\n    public Response adminDelete(String id) {\n        var stop = adminOnly();\n        if (stop != null) {\n            return stop;\n        }\n        store.delete(id);' + notify + '\n        return Response.seeOther(URI.create("/admin")).build();\n    }\n');
      }
      if (a.payment) {
        parts.push('    @POST\n    @Path("/api/checkout")\n    public Response checkout(@Context UriInfo uri) throws IOException, InterruptedException {\n        var configured = System.getenv("PUBLIC_URL");\n        var base = configured != null ? configured : uri.getBaseUri().toString().replaceAll("/$", "");\n        return Response.seeOther(URI.create(checkout.create(base))).build();\n    }\n');
      }
      var uniq = imp.filter(function (x, i, l) { return l.indexOf(x) === i; }).sort();
      appItems.push({ file: J + 'Pages.java', lang: 'java', code: 'package org.acme;\n\n' + uniq.map(function (x) { return 'import ' + x + ';'; }).join('\n') + '\n\n@Path("")\npublic class Pages {\n' + fields.join('\n') + '\n' + parts.join('\n') + '}\n', lines: [
        ['@Path("")', 'These routes start at the site\'s root.'],
        ['@Inject', 'Quarkus hands this class the objects it needs.']
      ].concat(pages ? [['Template', 'A template from <code>src/main/resources/templates</code>, found by the field\'s name.'], ['.data', 'Passes values to the template.']] : [])
       .concat(templates ? [['listPart', 'Returns only the list, because htmx swaps just that part of the page.'], ['"on".equals(done)', 'A checked checkbox sends <code>on</code>, and an unchecked one sends nothing.']] : [])
       .concat(login ? [['identity', 'Who is making this request.'], ['isAnonymous', 'True if nobody is logged in.']] : [])
       .concat(own ? [['BcryptUtil.bcryptHash', 'Scrambles a new password one way. Never store the password itself.'], ['temporaryRedirect', 'Makes the browser send the same form to <code>/login</code>, which logs the new user in.'], ['FormAuthenticationMechanism.logout', 'Removes the session cookie. It\'s a POST so other sites can\'t log someone out with a link.']] : [])
       .concat(oidc ? [['/login', 'Requires a login in your settings, so your provider handles this. Once someone is signed in, it sends them home.'], ['session.logout', 'Ends the session in your app.']] : [])
       .concat(qAdmin ? [['adminOnly', 'Checks on the server. Hiding a link isn\'t protection, because anyone can type a URL.'], ['ForbiddenException', 'Sends a 403: logged in, but not allowed.'], ['seeOther', 'Sends the browser to another page after the change, so refreshing doesn\'t repeat it.']] : [])
       .concat(a.payment ? [['PUBLIC_URL', 'Your site\'s real address. Set this in production, because the <code>Host</code> header can be forged.']] : []) });
    }
    s.push({ id: 'app', title: 'Write the app', items: appItems });

    if (pages) {
      var v = [], R = 'src/main/resources/templates/';
      if (templates) {
        var liveScript = a.transport === 'sse' ? "<script>new EventSource('/api/live').onmessage = () => htmx.trigger('#list', 'reload');</script>\n" : a.transport === 'websocket' ? "<script>\n  const scheme = location.protocol === 'https:' ? 'wss://' : 'ws://';\n  new WebSocket(scheme + location.host + '/live').onmessage = () => htmx.trigger('#list', 'reload');\n</script>\n" : a.transport === 'managed' ? "<script src=\"https://cdn.ably.com/lib/ably.min-2.js\"></script>\n<script>\n  new Ably.Realtime({ authUrl: '/api/live-token' }).channels.get('tasks').subscribe(() => htmx.trigger('#list', 'reload'));\n</script>\n" : '';
        v.push({ file: R + 'index.html', lang: 'html', code: "<!doctype html>\n<html lang=\"en\">\n<meta charset=\"utf-8\">\n<title>Tasks</title>\n<script src=\"https://unpkg.com/htmx.org@2.0.11\"></script>\n<h1>Tasks</h1>\n" + (login ? "<form method=\"post\" action=\"/logout\"><button>Log out</button></form>\n" : '') + (a.payment ? "<form method=\"post\" action=\"/api/checkout\"><button>Buy example product</button></form>\n" : '') + "<form hx-post=\"/tasks\" hx-target=\"#list\" hx-on::after-request=\"this.reset()\">\n  <input name=\"title\" maxlength=\"200\" required>\n  <button>Add</button>\n</form>\n<div id=\"list\" hx-get=\"/tasks\" hx-trigger=\"reload\">{#include list tasks=tasks /}</div>\n" + liveScript + "</html>\n", lines: [['htmx', 'A small library that lets HTML attributes make requests and update part of the page.'], ['hx-post', 'Submits the form to this URL without reloading the page.'], ['hx-target', 'Replaces this element with the response.'], ['hx-on::after-request', 'Clears the form after it submits.'], ['{#include', 'Inserts another template, in Qute, the template language Quarkus uses.']].concat(a.transport ? [['hx-trigger="reload"', 'Lets the live-update script ask for a fresh list.']] : []) });
        v.push({ file: R + 'list.html', lang: 'html', code: "<ul>\n  {#for task in tasks}\n    <li>\n      <label>\n        <input type=\"checkbox\" name=\"done\" {#if task.done}checked{/if} hx-post=\"/tasks/{task.id}/toggle\" hx-target=\"#list\">\n        {task.title}\n      </label>\n    </li>\n  {/for}\n</ul>\n", lines: [['{#for}', 'Repeats this part for each task.'], ['{task.title}', 'Prints a value and escapes it, so a title can\'t inject HTML or scripts.']] });
      }
      if (own) v.push({ file: R + 'login.html', lang: 'html', code: "<!doctype html>\n<html lang=\"en\">\n<meta charset=\"utf-8\">\n<title>Log in</title>\n<h1>Log in or sign up</h1>\n{#if error}<p role=\"alert\">{error}</p>{/if}\n<form method=\"post\">\n  <label>Email <input name=\"email\" type=\"email\" required></label>\n  <label>Password <input name=\"password\" type=\"password\" minlength=\"8\" required></label>\n  <button formaction=\"/login\">Log in</button>\n  <button formaction=\"/signup\">Sign up</button>\n</form>\n</html>\n", lines: [['formaction', 'Each button posts the same form to a different URL.'], ['{#if error}', 'Only shows the message when there is one.']] });
      if (qAdmin) v.push({ file: R + 'admin.html', lang: 'html', code: "<!doctype html>\n<html lang=\"en\">\n<meta charset=\"utf-8\">\n<title>Admin</title>\n<h1>Admin: all tasks</h1>\n<table>\n  {#for task in tasks}\n    <tr>\n      <td>{task.title}</td>\n      <td>{#if task.done}Done{#else}Open{/if}</td>\n      <td><form method=\"post\" action=\"/admin/tasks/{task.id}/delete\"><button>Delete</button></form></td>\n    </tr>\n  {/for}\n</table>\n</html>\n", lines: [['form method="post"', 'Deleting uses POST, so a link or a search engine can\'t trigger it.'], ['/admin', 'A small page rendered by the server, whichever frontend you chose. The admin check runs on the server.']] });
      s.push({ id: 'views', title: templates ? 'Write the pages' : 'Write the pages it needs', items: v });
    }
    if (spa) {
      s.push({ id: 'frontend', title: 'Build the frontend', items: Kit.spaItems(a, 3000).concat([
        { cmd: 'mkdir -p src/main/resources/META-INF/resources\ncp -r ' + Kit.spaDistPath(a) + '/. src/main/resources/META-INF/resources/', lines: [['META-INF/resources', 'Quarkus serves anything in this folder as a plain file, so your frontend becomes part of the app. Repeat this copy after building the frontend again.']] }
      ]) });
    }
    if (a.admin === 'low-code') s.push({ id: 'admin', title: 'Add the admin tool', items: Kit.lowCodeItems(a) });

    // Tests
    var post = function (p, ct, body) { return 'http.send(HttpRequest.newBuilder(URI.create(base + "' + p + '")).header("Content-Type", "' + ct + '").POST(HttpRequest.BodyPublishers.ofString(' + JSON.stringify(body) + ')).build(), HttpResponse.BodyHandlers.ofString())'; };
    var get = function (p) { return 'http.send(HttpRequest.newBuilder(URI.create(base + "' + p + '")).build(), HttpResponse.BodyHandlers.ofString())'; };
    var t = 'package org.acme;\n\nimport static org.junit.jupiter.api.Assertions.assertEquals;\nimport static org.junit.jupiter.api.Assertions.assertTrue;\n\nimport io.quarkus.test.common.http.TestHTTPResource;\nimport io.quarkus.test.junit.QuarkusTest;\nimport jakarta.inject.Inject;\nimport java.net.URI;\nimport java.net.URL;\nimport java.net.http.HttpClient;\nimport java.net.http.HttpRequest;\nimport java.net.http.HttpResponse;\nimport org.junit.jupiter.api.Test;\n\n@QuarkusTest\nclass AppTest {\n    @TestHTTPResource("/")\n    URL root;\n\n    @Inject\n    TaskStore store;\n\n    private final HttpClient http = HttpClient.newHttpClient();\n\n    @Test\n    void theDataLayerSavesAndChangesATask() {\n        var task = store.add("From the test");\n        store.setDone(task.id(), true);\n        assertTrue(store.list().stream().anyMatch(t -> t.id().equals(task.id()) && t.done()));\n    }\n';
    var base = '        var base = root.toString().replaceAll("/$", "");\n';
    if (login && (isRest || isGql || !vaadin)) {
      var probe = isRest ? '/api/tasks' : isGql ? '/graphql' : '/tasks';
      t += '\n    @Test\n    void loggedOutVisitorsAreBlocked() throws Exception {\n' + base + '        var res = ' + post(probe, 'application/json', '{}') + ';\n        assertEquals(401, res.statusCode());\n    }\n';
    } else if (!login && isRest) {
      t += '\n    @Test\n    void theRestApiAddsAndLists() throws Exception {\n' + base + '        var created = ' + post('/api/tasks', 'application/json', '{"title":"Through the API"}') + ';\n        assertEquals(201, created.statusCode());\n        var list = ' + get('/api/tasks') + ';\n        assertTrue(list.body().contains("Through the API"));\n        assertTrue(list.headers().firstValue("Content-Range").isPresent());\n    }\n\n    @Test\n    void anEmptyTitleIsRejected() throws Exception {\n' + base + '        var res = ' + post('/api/tasks', 'application/json', '{"title":"   "}') + ';\n        assertEquals(400, res.statusCode());\n    }\n';
    } else if (!login && isGql) {
      t += '\n    @Test\n    void graphQlAddsAndLists() throws Exception {\n' + base + '        ' + post('/graphql', 'application/json', '{"query":"mutation { addTask(title: \\"Through GraphQL\\") { id } }"}') + ';\n        var list = ' + post('/graphql', 'application/json', '{"query":"{ tasks { title } }"}') + ';\n        assertTrue(list.body().contains("Through GraphQL"));\n    }\n';
    }
    if (templates && !login) t += '\n    @Test\n    void thePageEscapesTitles() throws Exception {\n' + base + '        ' + post('/tasks', 'application/x-www-form-urlencoded', 'title=%3Cb%3EFrom+a+form%3C%2Fb%3E') + ';\n        var page = ' + get('/') + ';\n        assertTrue(page.body().contains("&lt;b&gt;From a form&lt;/b&gt;"));\n    }\n';
    if (qAdmin) t += '\n    @Test\n    void theAdminPageNeedsALogin() throws Exception {\n' + base + '        var page = ' + get('/admin') + ';\n        assertTrue(!page.body().contains("Admin: all tasks"));\n    }\n';
    t += '}\n';
    s.push({ id: 'test', title: 'Test it', items: [
      { file: 'src/test/java/org/acme/AppTest.java', lang: 'java', code: t, lines: [
        ['@QuarkusTest', 'Starts your whole app before the tests, on a free port.'],
        ['@TestHTTPResource', 'Gives the test the address the app is using.'],
        ['HttpClient', 'Makes real HTTP requests to your app.']
      ] },
      { cmd: buildCmd, lines: [[buildCmd, 'Compiles the app, runs the tests, and builds the final program. Tests use whichever database your settings point at, so use a development database.']] },
      { p: 'Then start it with the command below and open <code>http://localhost:3000</code>.' + (spa ? ' For working on the frontend, also run <code>npm run dev</code> inside <code>web</code>, and open the address it prints.' : '') },
      { cmd: devCmd, manual: true, lines: [[devCmd, 'Starts Quarkus in development mode, which picks up your changes as you save. Press q to stop it.']] }
    ] });

    var envList = ['DATABASE_URL'];
    if (!mongo && a.database !== 'h2') envList.push('DB_USER', 'DB_PASSWORD');
    if (own) envList.push('SESSION_SECRET', 'ADMIN_EMAILS');
    if (oidc) envList.push('ADMIN_EMAILS', 'OIDC_ISSUER', 'OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET');
    if (a.transport === 'managed') envList.push('ABLY_API_KEY');
    if (a.payment) { envList.push('PUBLIC_URL'); Kit.PAYMENT[a.payment].env.forEach(function (e) { envList.push(e[0]); }); }
    var docker = 'FROM eclipse-temurin:25-jdk AS build\nWORKDIR /src\nCOPY . .\nRUN ' + (gradle ? './gradlew build -x test' : './mvnw package -DskipTests') + '\n\nFROM eclipse-temurin:25-jre\nWORKDIR /srv\nCOPY --from=build /src/' + appDir + ' /srv/app\nUSER 1001\nEXPOSE 3000\nCMD ["java", "-jar", "/srv/app/quarkus-run.jar"]\n';
    s.push({ id: 'deploy', title: 'Deploy it', items: Kit.hostingItems(a, { port: 3000, env: envList, dockerfile: docker, dockerignore: 'target\nbuild\n.gradle\nweb/node_modules\nweb/dist\n.git\n.env\n*.db\n', dockerLines: [
      ['AS build', 'A first stage compiles your app with the full JDK. Only the finished program goes into the final image.'],
      [appDir, 'Quarkus\'s finished program. It\'s a folder, and all of it needs copying.'],
      ['USER 1001', 'Runs as a limited user rather than as root.'],
      ['CMD', 'What runs when the container starts.']
    ] }) });
    return s;
  }
  Kit.frameworks.quarkus = quarkus;
  Kit.javaCheckout = checkoutCode;
  Kit.javaLibrary = addLibrary;
})(StackKit);
