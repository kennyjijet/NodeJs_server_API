var express = require("express");
var bodyParser = require("body-parser");
var couchbase = require("couchbase");
var config = require("./config");
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

module.exports.bucket = (new couchbase.Cluster(config.couchbase.server)).openBucket(config.couchbase.bucket);

var routes = require("./routes/routes.js")(app);
var server = app.listen(3000,function(
){
    console.log("Listening on port %s",server.address().port);
})

