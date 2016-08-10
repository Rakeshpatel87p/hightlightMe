var express = require('express');

// Demo user object
var userData = function() {
    this.user = {
        userName: 'sampleUser',
        userId: 'sampleId',
        commentsByUser: [],
        highlightsByUser: []
    };
    // Sample user for heatmap
    this.user2 = {
        userName: 'BillyBob',
        userId: 'YYYYY',
        commentsByUser: [],
        highlightsByUser: [{
                "selectedText": 'To use Angular effectively',
                'date': '2016/8/8'
            }, {
                "selectedText": 'HTTP is the protocol',
                'date': '2016/8/8'
            }

        ]
    };
    // Sample user2 for heatmap
    this.user3 = {
        userName: 'HillaryClinton',
        userId: 'XXXXX',
        commentsByUser: [],
        highlightsByUser: [{
                "selectedText": 'To use Angular effectively',
                'date': '2016/8/8'
            }, {
                "selectedText": 'HTTP is the protocol',
                'date': '2016/8/8'
            }

        ]
    }

};

userData.prototype.addHighlights = function(selectedText, date) {
    // What other info to include? Date, user,...
    var highlightedItem = {
        "selectedText": selectedText,
        'date': date
    };
    // Homework: for-in loop
    if (this.user.highlightsByUser.length > 0) { // are there any highlights?
        // when there are highlights
        for (var i = 0; i < this.user.highlightsByUser.length; i++) {
            // check for duplicates           
            if (selectedText != this.user.highlightsByUser[i].selectedText) {
                this.user.highlightsByUser.push(highlightedItem);
                // get out of loop
                return highlightedItem;
            }
        }

    } else {
        this.user.highlightsByUser.push(highlightedItem);
    }
    return highlightedItem; // sent with new date
};

userData.prototype.addComments = function(comment, selectedText, date) {
    // What other info to include? Date, user,...
    var item = {
        'comment': comment,
        'selected text': selectedText,
        'date': date
    };
    this.user.commentsByUser.push(item);
    return item;
};

var userData = new userData();

var app = express();
app.use(express.static('public'));

app.get('/userData', function(req, res) {
    res.json(userData);
});

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

app.post('/userData', jsonParser, function(req, res) {
    if (!req.body) {
        return res.sendStatus(400);
    }
    if (!req.body.comment) {
        var item = userData.addHighlights(req.body.selectedText, req.body.date)
    } else {
        var item = userData.addComments(req.body.comment, req.body.selectedText, req.body.date);
    }
    res.status(201).json(item);
});

// When to use jsonParser? Necessary here? For put?
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

// var findObject = function(id) {
//     for (var i = 0; i < storage.items.length; i++) {
//         if (storage.items[i].id == id) {
//             return i
//         }
//     }
//     return -1

// }

app.listen(process.env.PORT || 8080);

exports.app = app;
exports.userData = userData;
