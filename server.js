var express = require('express');
var mongoose = require('mongoose');
var app = express();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(jsonParser);

app.use(express.static('public'));

mongoose.connect('mongodb://localhost/highlightMeData');

mongoose.connection.on('error', function(err) {
    console.error('Could not connect. Error', err)
});

// Data to store per selection
// - start-of-selection
// - end-of-selection
// - comment / highligth
// - who comment? user's id/username

// ---> relationships with mongodb
// */

// text?? articles? content?
var userSchema = mongoose.Schema({
    // What will Mongoose be managing?
    // highlightsByUser and Comments by User
    // Does it need to take over all my data in order to search it?
    username: { type: String, unique: true },
    // userId: { type: String, unique: true },
    comments: [{ comment: String, text_end: Number, text_start: Number }], // content, when they were made??
    highlights: [{ text_end: Number, text_start: Number }] // user? date?
}, { timestamps: true });
var User = mongoose.model('User', userSchema)

// POST COMMENTS & HIGHLIGHTS FOR INDIV USERS
// DELETE COMMENTS & HIGHLIGHTS FOR INDIV USERS
// GET ALL USER DATA

app.get('/users', function(req, res) {
    User.find(function(err, users) {
        if (err) {
            res.status(500), json('User data did not load properly')
        }
        res.status(201).json(users)
    })
})

app.post('/users', function(req, res) {
    // Create a User
    // Only if user doesn't exist
    User.create({
        username: req.body.username
    }, function(err, user) {
        if (err) {
            return res.status(500).json({ message: "Registering User Error" })
        }
        // 201 Created
        res.status(201).json(user);
    });
});

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

app.put('/users/:username/highlights-comments', function(req, res) {
    /**
    Creating highlights for text
    */
    var query = { username: req.params.username };
    if (!req.body.comment) {
        // User.findOneAndUpdate(query, { $push: { highlights: { text_end: req.body.text_end, text_start: req.body.text_start } } }, { new: true }, function(error, data) {
        var highlight = {
            text_start: req.body.text_start,
            text_end: req.body.text_end
        };
        // Not properly adding highlights
        User.find({username: req.params.username, 'highlights.text_start': req.body.text_start, 'hightlights.text_end': req.body.text_end}, {'highlights.$': 1}, function(err, highlight){
            console.log(highlight, err);
            res.status(200).json(highlight);
            console.log(highlight);
            // If highlight returns no value, then we push it into array
            if (highlight.length == 0) {
                User.findOneAndUpdate(req.params.username, {$push: {highlights: highlight}}, function(error, data){
                    if (error){
                        res.status(500).json(err)
                    };
                    res.status(201).json(data);
                });
            };
                
        });
        // User.findOneAndUpdate(req.params.username, { $push: { highlights: highlight } }, { upsert: true }, function(error, data) {
        //     console.log(data);
        //     if (error) {,
        //         res.status(500).json('Mistake was made');
        //         return;
        //     };
        //     res.status(201).json(data);
        // });
        // });
    } else {
        User.findOneAndUpdate(query, { $push: { comments: { comment: req.body.comment, text_end: 0, text_start: 0, date: "8/12/12" } } }, { new: true }, function(error, data) {
            if (error) {
                res.status(500).json('Comment not uploaded');
                return;
            };
            res.status(201).json(data);
        });
    }
});

// Deleting highlights and comments from User
app.delete('/users/:username/highlights', function(req, res) {
    var username = { username: req.params.username };
    // console.log(user.highlights);
    // findOneAndUpdate or update; pull vs pullAll

    // User.update(username, {
    //         $pull: { 'highlights': { text_end: req.body.text_end } } },
    //         false,
    //         true
    //     // function(err, callback) {
    //     //     if (err) {
    //     //         res.status(500).json(err)
    //     //     }
    //     //     res.status(201).json(callback);
    //     //     console.log(callback);
    //     // }
    // );
    User.findOneAndUpdate(username, { $pull: { highlights: { text_end: req.body.text_end, text_start: req.body.text_start } } }, function(err, data) {
        console.log('data', data);
        if (err) {
            return res.status(500).json(err)
        }
        res.status(201).json(data)
    });
});

// app.put('/users/:username', function(req, res, newHighlight, errback) {
//     var query = { username: req.params.username };
//     var newHighlight = req.body.newHighlight;
//     console.log(query);
//     User.findOneAndUpdate(query, { highlights: { text_end: newHighlight, text_start: 2, date: '8/12/12' } }, function(err, user) {
//         if (err) {
//             errback(err);
//             return;
//         }
//     });
//     res.status(201).json(user);
// });
// var username = req.params.username;
// console.log(username);
// // Find right user
// User.findOneAndUpdate({ username: username }, { $push: { highlights: [{ text_end: newHighlight, text_start: 6, date: '8/12' }] } }, function(err, callback){
//     if (err){
//         errback(err);
//         return;
//     }
//     res.status(201).json(User)
// });
// function(err, user) {
//     if (err) {
//         errback(err);
//         return;
//     }
//     // user.highlights.create({text_end: newHighlight, text_start: 6, date: '8/12/16'});
//     res.status(201).json(user);
//     console.log(user);

// });
// Push highlights from client into object

// Establishing the service and making call to the service
// app.get('/userData', function(req, res) {
//     userData.heatMapData(function(userData) {
//         res.json(userData)
//     }, function(err) {
//         res.status(400).json(err);
//     });
// });

// Mongoose Count
// userData.heatMapData = function(callback, errback) {
//     // Count the number of instances in which the selected highlighted txt is highlighted
//     userData.count({ highlightsByUser: })
// }

// Basically, create a Mongoose service that does a count and finds similar items
// Get information in Mongoose so it becomes easier to read


// app.post('/userData', jsonParser, function(req, res) {
//     if (!req.body) {
//         return res.sendStatus(400);
//     }
//     if (!req.body.comment) {
//         console.log(req.body.comment);
//         var item = userData.addHighlights(req.body.selectedText, req.body.date)

//         // if (req.body.id){
//         //     var highlightedItemData = addAccumulatedHighlightedItem(req.body.highlightedText, req.body.id)
//         // }    
//     } else {
//         var item = userData.addComments(req.body.comment, req.body.selectedText, req.body.date);
//     }
//     res.status(201).json(item);
// });

// app.delete('/items/:id', function(req, res) {
//     var id = req.params.id;
//     var positionOfObject = findObject(id);
//     storage.delete(positionOfObject);
//     res.status(200).json({message: "successfully deleted", status: "ok"});

// });

// app.put('/items/:id', jsonParser, function(req, res) {
//     var id = req.params.id;
//     var positionOfObject = findObject(id);
//     var updatedName = storage.edit(positionOfObject, req.body.name);
// res.status(200).json(updatedName);

// });

// var read = function(Snippet){
//     // Item that I want to find
//     var userDataForMongoose = Snippet
//     collection.findOne(userDataForMongoose, function(err, snippet){
//         if (!snippet || err){
//             console.error('Could not read snippet', name);
//             db.close();
//             return;
//         }
//         console.log('Read snippet', userDataForMongoose);
//         db.close();
//     });
// };


// Demo user object
// var userData = function() {
//     this.user_1 = {
//         userName: 'sampleUser',
//         userId: 'sampleId',
//         commentsByUser: [],
//         highlightsByUser: []
//     };
//     // Sample user for heatmap
//     this.user_2 = {
//         userName: 'BillyBob',
//         userId: 'YYYYY',
//         commentsByUser: [],
//         highlightsByUser: [{
//                 "selectedText": 'To use Angular effectively',
//                 'date': '2016/8/8'
//             }, {
//                 "selectedText": 'HTTP is the protocol',
//                 'date': '2016/8/8'
//             }

//         ]
//     };
//     // Sample user2 for heatmap
//     this.user_3 = {
//         userName: 'HillaryClinton',
//         userId: 'XXXXX',
//         commentsByUser: [],
//         highlightsByUser: [{
//                 "selectedText": 'To use Angular effectively',
//                 'date': '2016/8/8'
//             }, {
//                 "selectedText": 'HTTP is the protocol',
//                 'date': '2016/8/8'
//             }

//         ]
//     }

// };

// var addAccumulatedHighlightedItem = function(accumulatedHighlightedText, numberOfTimesHighlighted) {
//     // What other info to include? Date, user,...
//     var highlightedItemData = {
//         "text": accumulatedHighlightedText,
//         'numberOfTimesHighlighted': numberOfTimesHighlighted
//     };
//     if (this.length > 0) { // are there any highlights?
//         // when there are highlights
//         for (var i = 0; i < this.length; i++) {
//             // check for duplicates           
//             if (accumulatedHighlightedText != this[i].highlightedItemData.text) {
//                 this.push(highlightedItemData);
//                 // get out of loop
//                 return highlightedItemData;
//             }
//         }

//     } else {
//         this.push(highlightedItemData);
//     }
//     return highlightedItemData; // sent with new date
// };

// userData.prototype.addHighlights = function(selectedText, date) {
//     // What other info to include? Date, user,...
//     var highlightedItem = {
//         "selectedText": selectedText,
//         'date': date
//     };


// Homework: for-in loop
//     if (this.user_1.highlightsByUser.length > 0) { // are there any highlights?
//         // when there are highlights
//         for (var i = 0; i < this.user_1.highlightsByUser.length; i++) {
//             // check for duplicates           
//             if (selectedText != this.user_1.highlightsByUser[i].selectedText) {
//                 this.user_1.highlightsByUser.push(highlightedItem);
//                 // get out of loop
//                 return highlightedItem;
//             }
//         }

//     } else {
//         this.user_1.highlightsByUser.push(highlightedItem);
//     }
//     return highlightedItem; // sent with new date
// };

// userData.prototype.addComments = function(comment, selectedText, date) {
//     var item = {
//         'comment': comment,
//         'selected text': selectedText,
//         'date': date
//     };
//     this.user_1.commentsByUser.push(item);
//     return item;
// };

// var userData = new userData();

app.listen(process.env.PORT || 8080);

exports.app = app;
// exports.userData = userData;
