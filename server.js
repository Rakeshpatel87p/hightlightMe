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
    // comments: [{ comment: String, text_end: Number, text_start: Number, cursorPositionTop: Number, cursorPositionLeft: Number, time: { type: Date, default: Date.now } }],
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

// Delete highlights
// app.delete('/users/:username/highlights', function(req, res) {
//     var username = { username: req.params.username };
//     highlight = {
//         text_end: req.body.text_end,
//         text_start: req.body.text_start
//     }

//     User.findOneAndUpdate(username, { $pull: { highlights: highlight } }, { new: true }, function(err, data) {
//         if (err) {
//             res.status(500).json('Not properly pulled')
//         }
//         res.status(201).json(data);
//     })
// });

// Get individual comments
app.get('/users/:username/comments/:commentId', function(req, res) {
    Comment.findOne({ _id: req.params.commentId }, function(err, userComment) {
        if (err) return res.status(500).json(err)
        res.status(201).json(userComment);
    });
    // Comment.findOne({ _id: req.params.commentId }, function(err, user) {
    //     if (err) {
    //         res.status(500).json(err);
    //     }
    //     var commentClickedUpon = _.findWhere(user.comments, {
    //         cursorPositionLeft: parseInt(req.params.positionLeft),
    //         cursorPositionTop: parseInt(req.params.positionTop)
    //     });
    //     res.status(201).json(commentClickedUpon);
    // });
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

// var query = { username: req.params.username };
// var comment = {
//     comment: req.body.comment,
//     text_end: req.body.text_end,
//     text_start: req.body.text_start,
//     cursorPositionLeft: req.body.cursorPositionLeft,
//     cursorPositionTop: req.body.cursorPositionTop
// };
// console.log(comment);
// User.findOneAndUpdate(query, { $push: { comments: comment } }, { upsert: true, new: true }, function(error, data) {
//     if (error) {
//         res.status(500).json('Comment not uploaded');
//         return;
//     }
//     console.log(data);
//     res.status(201).json(data);
// });


// Delete comments
app.delete('/users/:username/comments', function(req, res) {
    Comment.findByIdAndRemove({ _id: req.body.commentIdToDelete }, function(err, callback) {
        if (err) return res.status(500).json('wtf');
        console.log(callback);
    });
    // User.update({ _id: req.body.commentIdToDelete }, { $pull: { 'users.comments': { _id: req.body.commentIdToDelete } } })
    // User.findOneAndUpdate({ username: req.params.username }, { $pull: { _id: req.body.commentIdToDelete } }, { new: true }, function(err, data) {
    //     if (err) {
    //         res.status(500).json('Not properly pulled')
    //     }
    //     console.log(data);
    //     res.status(201).json(data);
    // });

});

// app.delete('/users/:username/comments', function(req, res) {
//         console.log(req.body.commentIdToDelete);
//         User.findOne({username: req.params.username, comments._id: req.body.commentIdToDelete}, function(err, data){
//             console.log(data);
//         })
//             // .remove()
//             // .exec(function(err, callback) {
//             //     if (err) return res.status(500).json(err)
//             //     console.log(callback);
//             // })

//     })
// User.findOne(req.body.commentIdToDelete, function(err, callback) {
//     if (err) return res.status(500).json(err)
//     console.log(callback);
// })

// var username = { username: req.params.username };
// var comment = {
//     comment: req.body.comment,
//     text_end: req.body.text_end,
//     text_start: req.body.text_start
// };

// User.findOneAndUpdate(username, { $pull: { _id: req.body.commentToDelete } }, { new: true }, function(err, data) {
//         if (err) {
//             res.status(500).json('Not properly pulled')
//         }
//         console.log(data);
//         res.status(201).json(data);
//     })
// User.findOneAndRemove(username, {sort: {'comments': comment} }, { new: true }, function(err, callback) {
//     if (err) {
//         return res.status(500).json('Not Able to Delete Comment', err)
//     }
//     res.status(201).json(data);
// });


app.listen(process.env.PORT || 8080);

exports.app = app;
// exports.userData = userData;
