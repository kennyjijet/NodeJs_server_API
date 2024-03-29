/**
 * Created by theerat on 8/24/2015.
 */
var uuid = require("uuid");
var db = require("../app").bucket;

function SessionModel() { };

/*
 * Check the authorization status for a particular session and refresh it if it
 * exists
 */
SessionModel.authenticate = function(req, res, next) {
    console.log("session authenticate...1");
    if(!req.headers.authorization) {
        next("Must be authorized to use");
    }
    console.log("session authenticate...2");
    var authInfo = req.headers.authorization.split(" ");
    console.log(req.headers.authorization);
    if(authInfo[0] === "Bearer") {
        var sid = authInfo[1];
        console.log("session authenticate...3");
        SessionModel.get(sid, function(error, result) {
            if(error) {
                console.log("session authenticate...4");
                console.log(authInfo[1]);
                return next(error);
            }
            console.log("session authenticate...5");
            SessionModel.refresh(sid, function() {});
            req.uid = result.value.uid;
            console.log("session authenticate...6");
            next();
        });
    }
};

/*
 * Create a unique session that expires after sixty minutes for a user
 */
SessionModel.create = function(uid, callback) {
    var sessionDoc = {
        type: "session",
        sid: uuid.v4(),
        uid: uid
    };
    db.insert("session::" + sessionDoc.sid, sessionDoc, {"expiry": 300}, function(error, result) {
        if(error) {
            callback(error, null);
            return;
        }
        callback(null, sessionDoc.sid);
    });
};

/*
 * Get the session for a particular user based on the session id
 */
SessionModel.get = function(sid, callback) {
    db.get("session::" + sid, function(error, result) {
        if(error) {
            callback(error, null);
            return;
        }
        callback(null, result);
    });
};

/*
 * Refresh a user session by resetting the expiration time back to 60 minutes
 */
SessionModel.refresh = function(sid, callback) {
    db.touch("session::" + sid, 300, function(error, result) {
        if(error) {
            callback(error, null);
        }
    });
};

module.exports = SessionModel;