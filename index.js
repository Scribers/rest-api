var express = require('express');
var app = express();

// POST requests
// Create a new user.
app.get('/users/create', function (req, res) { // TODO
    res.send({
                "status": "success",
                "id": "42"
                });
})

// Create a new company.
app.get('/companies/create', function (req, res) { // TODO
    res.send({
                "status": "success",
                "id": "42"
                });

})

// Create a new offer.
app.get('/offers/create', function (req, res) { // TODO
    res.send({
                "status": "success",
                "id": "42"
                });

})

// Create a new application.
app.get('/applications/create', function (req, res) { // TODO
    res.send({
                "status": "success",
                "id": "42"
                });

})

// GET requests
app.get('/joboffers/:id', function (req, res) { // TODO
    console.log(req.params.id);
    res.send({
                "status": "success",
                "content": {
                        "id": 42,
                        "company_id": 43,
                        "title": "My sexy job offer."
                    }
                });
})

app.get('/users/:id', function (req, res) { // TODO
    console.log(req.params.id);
    res.send({
                "status": "success",
                "content": {
                        "mail": "dev@sexy.xxx",
                        "name": "John Doe"
                    }
                });

})
app.get('/companies/:id', function (req, res) { // TODO
    console.log(req.params.id);
    res.send({
                "status": "success",
                "content": {
                        "name": "Sexy & co",
                        "mail": "company@sexy.xxx"
                    }
                });
   
})
app.get('/applications/:id', function (req, res) { // TODO
    console.log(req.params.id);
    res.send({
                "status": "success",
                "content": {
                        "offer_id": 43,
                        "user_id": 42
                    }
                });

})


var server = app.listen(8081, function () {

      var host = server.address().address
            var port = server.address().port

              console.log("Example app listening at http://%s:%s", host, port)

})
