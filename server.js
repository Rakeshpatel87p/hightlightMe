var express = require('express');

// Is this server-side logic or client-side logic?
var userComments = function() {
    this.commentedOnByUser = [];
    this.highlightsByUser = [];
    // this.id = 0;
};

userComments.prototype.addHighlights = function(selectedText, user, date) {
    // What other info to include? Date, user,...
    var highlightedItem = {
        'selectedText': selectedText,
        'user': user,
        'date': date
    };
    // Homework: for-in loop
    if (this.highlightsByUser.length > 0) { // are there any highlights?
        // when there are highlights
        for (var i = 0; i < this.highlightsByUser.length; i++) {
            // check for duplicates           
            if (selectedText != this.highlightsByUser[i].selectedText) {
                this.highlightsByUser.push(highlightedItem);
                // get out of loop
                return highlightedItem;
            }
        }

    } else {
        this.highlightsByUser.push(highlightedItem);
    }
    return highlightedItem; // sent with new date
};

userComments.prototype.addComments = function(comment, selectedText, user, date) {
    // What other info to include? Date, user,...
    var item = {
        'comment': comment,
        'selected text': selectedText,
        'user': user,
        'date': date
    };
    this.commentedOnByUser.push(item);
    // this.id += 1;
    return item;
};

// Why do I need to create a new instance of this?
var userComments = new userComments();

// Storage.prototype.delete = function(positionOfObject) {
//     this.items.splice(positionOfObject, 1);
// };

// Storage.prototype.edit = function(positionOfObject, editedName) {
//     this.items[positionOfObject].name = editedName;

// }

var app = express();
app.use(express.static('public'));

app.get('/userData', function(req, res) {
    res.json(userComments);
});

// app.get('/items/:id', function(req, res){
//     var id = req.params.id;
//     var getID = findObject(id);
//     res.json(storage.items[getID]);
// })

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

app.get('/userData', function(req, res) {
    res.json(userComments);
});

app.post('/userData', jsonParser, function(req, res) {
    if (!req.body) {
        return res.sendStatus(400);
    }
    if (!req.body.comment) {
        var item = userComments.addHighlights(req.body.selectedText, req.body.user, req.body.date)
    } else {
        var item = userComments.addComments(req.body.comment, req.body.selectedText, req.body.user, req.body.date);
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
exports.userComments = userComments;
