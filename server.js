var express = require('express');

// Demo user object
var userData = function() {
    this.user_1 = {
        userName: 'sampleUser',
        userId: 'sampleId',
        commentsByUser: [],
        highlightsByUser: []
    };
    // Sample user for heatmap
    this.user_2 = {
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
    this.user_3 = {
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
    if (this.user_1.highlightsByUser.length > 0) { // are there any highlights?
        // when there are highlights
        for (var i = 0; i < this.user_1.highlightsByUser.length; i++) {
            // check for duplicates           
            if (selectedText != this.user_1.highlightsByUser[i].selectedText) {
                this.user_1.highlightsByUser.push(highlightedItem);
                // get out of loop
                return highlightedItem;
            }
        }

    } else {
        this.user_1.highlightsByUser.push(highlightedItem);
    }
    return highlightedItem; // sent with new date
};

userData.prototype.addComments = function(comment, selectedText, date) {
    var item = {
        'comment': comment,
        'selected text': selectedText,
        'date': date
    };
    this.user_1.commentsByUser.push(item);
    return item;
};

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
    if (req.body.comment) {
        var item = userData.addComments(req.body.comment, req.body.selectedText, req.body.date);

    // if (req.body.id){
    //     var highlightedItemData = addAccumulatedHighlightedItem(req.body.highlightedText, req.body.id)
    // }    
    } else {
        var item = userData.addHighlights(req.body.selectedText, req.body.date)
    }
    res.status(201).json(item);
});

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

app.listen(process.env.PORT || 8080);

exports.app = app;
exports.userData = userData;
