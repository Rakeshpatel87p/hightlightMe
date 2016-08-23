// Put non-dupicative highlights
// Delete highlights
// Stop storing duplicate values

var express = require('express');
var mongoose = require('mongoose');
var app = express();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var _ = require('underscore');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(jsonParser);

app.use(express.static('public'));

mongoose.connect('mongodb://localhost/highlightMeData');

mongoose.connection.on('error', function(err) {
    console.error('Could not connect. Error', err)
});

var userSchema = mongoose.Schema({
    username: { type: String, unique: true },
    comments: [{ comment: String, text_end: Number, text_start: Number }], // content, when they were made??
    highlights: [{ text_end: Number, text_start: Number }] // user? date?
}, { timestamps: true });

var User = mongoose.model('User', userSchema)

// Get user information
app.get('/users', function(req, res) {
    User.find(function(err, users) {
        if (err) {
            res.status(500), json('User data did not load properly')
        }
        res.status(201).json(users)
    })
});

// Create New Users
app.post('/users', function(req, res) {
    console.log(req.body.username);
    User.create({
        username: req.body.username
    }, function(err, user) {
        if (err) {
            return res.status(500).json({ message: "Registering User Error", err })
        }
        res.status(201).json(user);
    });
});

// Delete Users
app.delete('/users', function(req, res) {
    User.remove({
        username: req.body.username
    }, function(err, user) {
        if (err) {
            return res.status(500).json({ message: "Internal server error" })
        }
        res.status(201).json(user);
    })
});

// Get highlights and comments
app.get('/users/:username', function(req, res, errback) {
    var username = req.params.username;
    User.findOne({ username: username }, function(err, user) {
        if (err) {
            errback(err);
            return;
        }
        res.status(201).json(user);
    })
});
// Needs work - see below
app.put('/users/:username/highlights', function(req, res) {
    var username = { username: req.params.username };
    var highlight = {
        'text_end': req.body.text_end,
        'text_start': req.body.text_start
    };
    // Not returning needed object

    User.findOne(username, function(err, user) {
        // Not properly filtering out possible duplicates:
        // 1) require statement looks good - line 10
        // 2) Syntax is right.
        // 3) Tried findWhere - no success
        // var results = _.where(user.highlights, highlight );
        var results = _.where(user.highlights, {
            'text_end': req.body.text_end,
            'text_start': req.body.text_start
        });
        console.log('results', results);
        if (results.length == 0) {
            User.findOneAndUpdate(username, { $push: { highlights: highlight } }, { new: true }, function(error, data) {
                if (error) {
                    res.status(500).json('Highlight Already Exists', error)
                };
                console.log('highlight already exists');
                // res.status(201).json(data);
            });
        }

        res.status(200).json(user);
    });
});

// Delete highlights
app.delete('/users/:username/highlights', function(req, res) {
    var username = { username: req.params.username };
    highlight = {
        text_end: req.body.text_end,
        text_start: req.body.text_start
    }

    User.findOneAndUpdate(username, { $pull: { highlights: highlight } }, { new: true }, function(err, data) {
        if (err) {
            res.status(500).json('Not properly pulled')
        }
        res.status(201).json(data);
    })
});

// Put comments
// more specificity for url /:id
app.put('/users/:username/comments', function(req, res) {
    var query = { username: req.params.username };
    var comment = {
        comment: req.body.comment,
        text_end: req.body.text_end,
        text_start: req.body.text_start,
    };

    User.findOneAndUpdate(query, { $push: { comments: comment } }, { upsert: true, new: true }, function(error, data) {
        if (error) {
            res.status(500).json('Comment not uploaded');
            return;
        }
        res.status(201).json(data);
    });
});

// Delete comments
app.delete('/users/:username/comments', function(req, res) {
    var username = { username: req.params.username };
    var comment = {
        comment: req.body.comment,
        text_end: req.body.text_end,
        text_start: req.body.text_start
    };

    User.findOneAndUpdate(username, { $pull: { comments: comment } }, { new: true }, function(err, data) {
            if (err) {
                res.status(500).json('Not properly pulled')
            }
            res.status(201).json(data);
        })
        // User.findOneAndRemove(username, {sort: {'comments': comment} }, { new: true }, function(err, callback) {
        //     if (err) {
        //         return res.status(500).json('Not Able to Delete Comment', err)
        //     }
        //     res.status(201).json(data);
        // });
})

app.listen(process.env.PORT || 8080);

exports.app = app;
// exports.userData = userData;
