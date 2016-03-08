var cfenv = require('cfenv'); // access env vars.
var express = require('express'); // RESTful server.
var bodyParser = require('body-parser'); // parse the body of HTTP requests.
var mysql = require("mysql"); // access the mysql database.
var _ = require("underscore");

var appEnv = cfenv.getAppEnv();

// Configure mysql connection.
// Local
var mysqlCon = mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "test",
    password: "",
    database: "test"
});

// Create a connection.
mysqlCon.connect(function(err){
    if(err){
        console.log('Error connecting to database!');
        console.log(err);
        return;
    }
    console.log('Connection to database established.');
});

// Create express and configure.
var app = express();
app.use(bodyParser.urlencoded({
      extended: true
}));

// Helpers function
var check_parameters = function (req, res, keys){
    for (i=0; i<keys.length; i++){
        if (! (keys[i] in req.body)){
            res.send({"status": "failure", "help": "Missing key in header.", "key": keys[i]});
            return false;
        }
    }
    return true;
};

var send_failure = function (res, err){
    res.send({"status":"failure"});
    console.log(err);
}

var send_success_create = function (res, id){
    res.send({"status": "successful","id": id});
}

var send_success_get = function (res, content){
    if(!content)
        res.send({"status": "failure", "help": "No data found."});
    else
        res.send({"status": "successful", "content": content});
}

var create_query = function (query, args, req, res){
    res.header("Access-Control-Allow-Origin", "*");
    queryArgs = _.map(args, function (e){ return req.body[e]; });
    console.log(args);
    console.log(queryArgs);
    if (check_parameters(req, res, args)){
        mysqlCon.query(query, queryArgs, function(err, rows){
            if(err)
                send_failure(res, err);
            else
                send_success_create(res, rows.insertId);
        });
    }
}

var get_query_single = function (query, queryArgs, res){
    res.header("Access-Control-Allow-Origin", "*");
    mysqlCon.query(query, queryArgs, function(err, rows){
        if(err)
            send_failure(res, err);
        else
            send_success_get(res, rows[0]);
    });
}

var get_query_multiple = function (query, queryArgs, res){
    res.header("Access-Control-Allow-Origin", "*");
    mysqlCon.query(query, queryArgs, function(err, rows){
        if(err)
            send_failure(res, err);
        else
            send_success_get(res, rows);
    });
}

// POST requests
// Create a new user.
app.post('/users/create', function (req, res) {
    query = 'INSERT \
             INTO users (mail, password, name) \
             VALUES (?, ?, ?);';
    create_query(query, ["mail", "password", "name"], req, res);
});

// Create a new company.
app.post('/companies/create', function (req, res) {
    query = 'INSERT \
             INTO companies \
             (mail, password, name, description, short_description, details) \
             VALUES (?, ?, ?, ?, ?, ?);';
    create_query(query,
        ["mail", "password", "name", "description",
         "short_description", "details"], req, res);
});

// Create a new offer.
app.post('/offers/create', function (req, res) {
    query = 'INSERT \
             INTO offers \
             (title, company_id, type_id, description, date, rome_id) \
             VALUES (?, ?, ?, ?, ?, ?);';
    create_query(query,
        ["title", "company_id", "type_id",
         "description", "date", "rome_id"], req, res);
    res.header("Access-Control-Allow-Origin", "*");
});

// Create a new application.
app.post('/applications/create', function (req, res) {
    query = 'INSERT \
             INTO applications (offer_id, user_id, cover_letter) \
             VALUES (?, ?, ?);';
    create_query(query, ["offer_id", "user_id", "cover_letter"], req, res);
});

// Create a new cv.
app.post('/cvs/create', function (req, res) {
    query = 'INSERT \
             INTO cvs (firstname, lastname, age, nationality, user_id) \
             VALUES (?, ?, ?, ?, ?);';
    create_query(query,
        ["firstname", "lastname", "age", "nationality", "user_id"], req, res);
});

// Create a new formation.
app.post('/formations/create', function (req, res) {
    query = 'INSERT \
             INTO formations (cv_id, description, begin, end, title) \
             VALUES (?, ?, ?, ?, ?);';
     create_query(query,
        ["cv_id", "description", "begin", "end", "title"], req, res);
});

// Create a new experience.
app.post('/experiences/create', function (req, res) {
    query = 'INSERT \
             INTO experiences (cv_id, description, begin, end, title) \
             VALUES (?, ?, ?, ?, ?);';
    create_query(query,
        ["cv_id", "description", "begin", "end", "title"], req, res);
});

// Login a user
app.post('/login', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    query = 'SELECT * FROM users WHERE mail = ? AND password = ?;';
    queryArgs = [req.body.mail, req.body.password];
    if (check_parameters(req, res, ["mail", "password"])){
        mysqlCon.query(query, queryArgs, function(err, rows){
            if(err){
                send_failure(res, err);
            } else{
                if (rows.length === 0){
                    res.send({
                        "status": "failure",
                        "help": "User does not exists or bad password."
                    });
                } else{
                    res.send({
                                "status": "successful",
                                "id": rows[0].id
                         });
                }
            }
        });
    }
});

// GET requests
app.get('/offers/:id', function (req, res) {
    query = 'SELECT id, company_id, title, type_id, \
                    description, DATE_FORMAT(date, \'%Y-%m-%d\') AS date, \
                    rome_id \
             FROM offers \
             WHERE id = ?;';
    get_query_single(query, [req.params.id], res);
});

app.get('/users', function (req, res) {
    get_query_multiple('SELECT * FROM users;', [], res);
});

app.get('/users/:id', function (req, res) {
    get_query_single('SELECT * FROM users WHERE id = ?;', [req.params.id], res);
});

app.get('/users/:id/applications', function (req, res) {
    query = 'SELECT * FROM applications WHERE user_id = ?;';
    get_query_multiple(query, [req.params.id], res);
});

app.get('/companies', function (req, res) {
    get_query_multiple('SELECT * FROM companies;', [], res);
});

app.get('/companies/:id', function (req, res) {
    query = 'SELECT * FROM companies WHERE id = ?;';
    get_query_single(query, [req.params.id], res);
});

app.get('/companies/:id/offers', function (req, res) {
    query = 'SELECT id, company_id, title, type_id, description, \
                    DATE_FORMAT(date, \'%Y-%m-%d\') as date, \
                    rome_id \
             FROM offers \
             WHERE company_id = ?;';
    get_query_multiple(query, [req.params.id], res);
});

app.get('/companies/:id/applications', function (req, res) {
    query = 'SELECT applications.id, applications.offer_id, \
                    applications.user_id, applications.cover_letter \
             FROM applications, offers \
             WHERE applications.offer_id = offers.id AND offers.company_id = ?;';
    get_query_multiple(query, [req.params.id], res);
});

app.get('/applications/:id', function (req, res) {
    query = 'SELECT * FROM applications WHERE id = ?;';
    get_query_single(query, [req.params.id], res);
});

app.get('/jobtypes', function (req, res) {
    get_query_multiple('SELECT * FROM jobtypes;', [], res);
});

app.get('/jobtypes/:id', function (req, res) {
    query = 'SELECT * FROM jobtypes WHERE id = ?;';
     get_query_single(query, [req.params.id], res);
});

app.get('/romev3', function (req, res) {
    get_query_multiple('SELECT * FROM romev3;', [], res);
});

app.get('/romev3byid/:id', function (req, res) {
    query = 'SELECT * FROM romev3 WHERE id = ?;';
    get_query_single(query, [req.params.id], res);
});

app.get('/romev3bycode/:code', function (req, res) {
    query = 'SELECT * FROM romev3 WHERE code = ?;';
    get_query_single(query, [req.params.code], res);
});

app.get('/cvs', function (req, res) {
    get_query_multiple('SELECT * FROM cvs;', [], res);
});

app.get('/cvs/:id', function (req, res) {
    query = 'SELECT * FROM cvs WHERE id = ?;';
    get_query_single(query, [req.params.id], res);
});

app.get('/cvs/:id/experiences', function (req, res) {
    query = 'SELECT cv_id, description, \
                    DATE_FORMAT(begin, \'%Y-%m-%d\') AS begin, \
                    DATE_FORMAT(end, \'%Y-%m-%d\') AS end, \
                    title \
             FROM experiences \
             WHERE cv_id = ?;';
    get_query_multiple(query, [req.params.id], res);
});

app.get('/cvs/:id/formations', function (req, res) {
    query = 'SELECT cv_id, description, \
                    DATE_FORMAT(begin, \'%Y-%m-%d\') AS begin, \
                    DATE_FORMAT(end, \'%Y-%m-%d\') AS end, \
                    title \
             FROM formations \
             WHERE cv_id = ?;';
    get_query_multiple(query, [req.params.id], res);
});

app.get('/formations', function (req, res) {
    query = 'SELECT cv_id, description, \
                    DATE_FORMAT(begin, \'%Y-%m-%d\') AS begin, \
                    DATE_FORMAT(end, \'%Y-%m-%d\') AS end, \
                    title \
             FROM formations;';
    get_query_multiple(query, [], res);
});

app.get('/formations/:id', function (req, res) {
    query = 'SELECT cv_id, description, \
                    DATE_FORMAT(begin, \'%Y-%m-%d\') AS begin, \
                    DATE_FORMAT(end, \'%Y-%m-%d\') AS end, \
                    title \
             FROM formations \
             WHERE id = ?;';
    get_query_single(query, [req.params.id], res);
});

app.get('/experiences', function (req, res) {
    query = 'SELECT cv_id, description, \
                    DATE_FORMAT(begin, \'%Y-%m-%d\') AS begin, \
                    DATE_FORMAT(end, \'%Y-%m-%d\') AS end, \
                    title \
             FROM experiences;';
    get_query_multiple(query, [], res);
});

app.get('/experiences/:id', function (req, res) {
    query = 'SELECT cv_id, description, \
                    DATE_FORMAT(begin, \'%Y-%m-%d\') AS begin, \
                    DATE_FORMAT(end, \'%Y-%m-%d\') AS end, \
                    title \
             FROM experiences \
             WHERE id = ?;';
    get_query_single(query, [req.params.id], res);
});

var server = app.listen(appEnv.port, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("QRJob app listening at http://%s:%s", host, port)
});
