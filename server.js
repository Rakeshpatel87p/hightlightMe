// Put non-dupicative highlights
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
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/highlightMeData');

mongoose.connection.on('error', function(err) {
    console.error('Could not connect. Error', err)
});
// unique: true == doesn't work
// dropDups true == doesn't work
// $addToSet in PUT doesnt work
// Option: create seperate schema for highlights, use populate method to ensure unqiueness
// 
var userSchema = mongoose.Schema({
    username: { type: String, unique: true },
    comments: [{ comment: String, text_end: Number, text_start: Number, cursorPositionTop: Number, cursorPositionLeft: Number, time: { type: Date, default: Date.now } }],

    // highlights: [{ text_end: Number, text_start: Number }, { unique: true, dropDups: true }]
});

var highlightSchema = mongoose.Schema({
    // username: String,
    text_end: Number,
    text_start: Number,
    users: [{ userId: { type: Schema.Types.ObjectId, ref: 'User' } }]
        // time: { type: Date, default: Date.now }
}, { unique: true });

// highlightSchema.index({ users: 1, text_end: 1, text_start: 1 }, { unique: true })

var User = mongoose.model('User', userSchema);
var Highlight = mongoose.model('Highlight', highlightSchema);

// Example of implementing populate
app.get('/users/sample', function(req, res) {
        var rakesh2 = new User({ username: "rakesh4" });
        rakesh2.save();

        var newHighlight = new Highlight({
            text_end: 52,
            text_start: 12,
            users: [{ userId: rakesh2._id }]
        });

        newHighlight.save(function(err) {
            if (err) {
                console.log(err)
            } else {
                Highlight.find({}) //~want to enter in find query here
                    .populate('users')
                    .exec(function(err, highlights) {
                        console.log(highlights);
                    })
            }
        });
        // This method of preventing duplicates did not work - would not create new highlight
        Highlight.on('index', function(error) {
            console.log('here');

        })
        // Highlight.find({}) //~want to enter in find query here
        //     .populate('users')
        //     .exec(function(err, highlights) {
        //         console.log(highlights);
        //     })

        res.json({});

    })
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

    var newHighlight = new Highlight({
        'username': req.params.username,
        'text_end': req.body.text_end,
        'text_start': req.body.text_start
    });

    newHighlight.save(function(err) {
        if (!err) {
            Highlight.find({})
                .populate('users')
                .exec(function(err, posts) {

                })
        }
    })


    // User.highlights.push(highlight);
    // Highlights.push({'username': user.username, 'text_end': req.body.text_end, 'text_start': req.body.text_start});
    // });

    // Highlights.create(highlight, function(err, newHighlight){
    //     if (err) return res.status(500).json(err);
    //     console.log('new highlight .create', newHighlight);

    // });

    // User.findOne(username).populate('User.highlights').exec(function(err, user){
    //     if (err) return res.status(500).json(err);
    //     console.log(user)
    // });
    // User.findOneAndUpdate(username, {
    //         $addToSet: { highlights: highlight }
    //     }, { new: true },
    //     function(error, data) {
    //         if (error) {
    //             res.status(500).json('Highlight Already Exists', error)
    //         };
    //         console.log('highlight created', data);
    //         res.status(201).json(data);
    //     });

    // User.findOne(username, function(err, user) {
    //     // Not properly filtering out possible duplicates:
    //     // 1) require statement looks good - line 10
    //     // 2) Syntax is right.
    //     // 3) Tried findWhere - no success
    //     // var results = _.where(user.highlights, highlight );
    //     // var results = _.where(user.highlights, {
    //     //     'text_end': req.body.text_end,
    //     //     'text_start': req.body.text_start
    //     // });
    //     if (err) {
    //         res.status(500).json(err)
    //     }
    //     user.update()

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
