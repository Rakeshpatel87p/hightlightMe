// Delete highlights

// Create unique records for embedded docs
// VERSUS one to many, creating relationships

var express = require('express');
var mongoose = require('mongoose');
var app = express();
var Schema = mongoose.Schema;
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var _ = require('underscore');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(jsonParser);

app.use(express.static('public'));
// Fix for deprecation warning # 4291
// mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/highlightMeData');

mongoose.connection.on('error', function(err) {
    console.error('Could not connect. Error', err)
});

var userSchema = mongoose.Schema({
    username: { type: String, unique: true },
    comments: [{ comment: String, text_end: Number, text_start: Number, cursorPositionTop: Number, cursorPositionLeft: Number, time: { type: Date, default: Date.now } }],

    // highlights: [{ text_end: Number, text_start: Number }, { unique: true, dropDups: true }]
});

var highlightSchema = mongoose.Schema({
    text_end: {
        type: Number,
        index: true
    },
    text_start: {
        type: Number,
        index: true
    },
    users: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    time: {
        type: Date,
        default: Date.now
    }
});

// Prevents duplicate docs
highlightSchema.index({ text_end: 1, text_start: 1, users: 1 }, { unique: true })

var User = mongoose.model('User', userSchema);
var Highlight = mongoose.model('Highlight', highlightSchema);
// Magnifying error events for highlight
// Highlight.schema.options.emitIndexErrors;
// Highlight.on('error', function(error) {
//     console.log(error)
// });

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
    User.find({ username: username }, function(err, user) {
        if (err) {
            errback(err);
            return;
        }
        
        Highlight.find({'users': user._id})
            .populate('users')
            .exec(function(err, userHighlights){
                if (err) return res.status(500).json(err)
                return ({user, userHighlights})
            });

        // Highlight.find({ 'users': user._id }, function(err, userHighlights) {
        //     if (err) return res.status(500).json({});
        //     res.status(200).json({'userHighlights': userHighlights, 'userData': user})
        // });
    });
});
// Needs work - see below
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

// Get comments
app.get('/users/:username/comments/:positionLeft/:positionTop', function(req, res) {
    User.findOne({ username: req.params.username }, function(err, user) {
        if (err) {
            res.status(500).json(err);
        }
        var commentClickedUpon = _.findWhere(user.comments, {
            cursorPositionLeft: parseInt(req.params.positionLeft),
            cursorPositionTop: parseInt(req.params.positionTop)
        });
        res.status(201).json(commentClickedUpon);
    });
});

// Put comments
app.put('/users/:username/comments', function(req, res) {
    var query = { username: req.params.username };
    var comment = {
        comment: req.body.comment,
        text_end: req.body.text_end,
        text_start: req.body.text_start,
        cursorPositionLeft: req.body.cursorPositionLeft,
        cursorPositionTop: req.body.cursorPositionTop
    };
    console.log(comment);
    User.findOneAndUpdate(query, { $push: { comments: comment } }, { upsert: true, new: true }, function(error, data) {
        if (error) {
            res.status(500).json('Comment not uploaded');
            return;
        }
        console.log(data);
        res.status(201).json(data);
    });
});

// Delete comments
app.delete('/users/:username/comments', function(req, res) {
    var username = { username: req.params.username };
    // var comment = {
    //     comment: req.body.comment,
    //     text_end: req.body.text_end,
    //     text_start: req.body.text_start
    // };

    User.findOneAndUpdate(username, { $pull: { _id: req.body.commentToDelete } }, { new: true }, function(err, data) {
            if (err) {
                res.status(500).json('Not properly pulled')
            }
            console.log(data);
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
