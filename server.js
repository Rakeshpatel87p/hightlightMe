// Explanatory comments
// Take out unneeded code
// Run Tests

var express = require('express');
var mongoose = require('mongoose');
var app = express();
var Schema = mongoose.Schema;
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(jsonParser);

app.use(express.static('public'));
mongoose.connect('mongodb://localhost/highlightMeData');

mongoose.connection.on('error', function(err) {
    console.error('Could not connect. Error', err)
});

var userSchema = mongoose.Schema({
    username: { type: String, unique: true },
});

var highlightSchema = mongoose.Schema({
    users: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },

    text_end: {
        type: Number,
        index: true
    },
    text_start: {
        type: Number,
        index: true
    },

    time: {
        type: Date,
        default: Date.now
    }
});

var commentSchema = mongoose.Schema({
    users: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    comment: String,
    text_end: Number,
    text_start: Number,
    cursorPositionTop: Number,
    cursorPositionLeft: Number,

    time: {
        type: Date,
        default: Date.now
    }

});

// Prevents duplicate docs
highlightSchema.index({ text_end: 1, text_start: 1, users: 1 }, { unique: true })

var User = mongoose.model('User', userSchema);
var Highlight = mongoose.model('Highlight', highlightSchema);
var Comment = mongoose.model('Comment', commentSchema);

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

        if (user == null) {
            return res.status(200).json(null)
        }

        Highlight.find({ 'users': user._id }, function(err, userHighlights) {
            if (err) return res.status(500).json({});

            Comment.find({ 'users': user._id }, function(err, userComments) {
                if (err) return res.status(500).json({});
                res.status(200).json({ 'userHighlights': userHighlights, 'userComments': userComments })
            });
        })
    });
});

// Put new highlights
app.put('/users/:username/highlights', function(req, res) {
    User.findOne({ username: req.params.username }, function(err, user) {
        if (err) {
            console.log(err)
        }
        console.log(user);
        var newHighlight = new Highlight({
            'text_end': req.body.text_end,
            'text_start': req.body.text_start,
            'users': user._id,
        });
        newHighlight.save(function(err) {
            if (!err) {
                Highlight.find({})
                    .populate('users')
                    .exec(function(err, newHighlight) {
                        console.log('newHighlight', newHighlight)
                    });
            };
            console.log(err)
        });
    });

    res.status(200).json({});
});

// Get individual comments
app.get('/users/:username/comments/:commentId', function(req, res) {
    Comment.findOne({ _id: req.params.commentId }, function(err, userComment) {
        if (err) return res.status(500).json(err)
        res.status(201).json(userComment);
    });
});

// Put comments
app.put('/users/:username/comments', function(req, res) {
    User.findOne({ username: req.params.username }, function(err, user) {
        if (err) {
            console.log(err)
        }
        console.log(user);
        var newComment = new Comment({
            'users': user._id,
            'comment': req.body.comment,
            'text_end': req.body.text_end,
            'text_start': req.body.text_start,
            'cursorPositionLeft': req.body.cursorPositionLeft,
            'cursorPositionTop': req.body.cursorPositionTop
        });

        newComment.save(function(err) {
            if (!err) {
                Comment.find({})
                    .populate('users')
                    .exec(function(err, newComment) {
                        console.log('newComment', newComment)
                    });
            };
            console.log(err)
        });
        res.status(200).json(newComment);
    });

});

// Delete comments
app.delete('/users/:username/comments', function(req, res) {
    Comment.findByIdAndRemove({ _id: req.body.commentIdToDelete }, function(err, callback) {
        if (err) return res.status(500).json('wtf');
        console.log(callback);
    });

});
app.listen(process.env.PORT || 8080);
exports.app = app;