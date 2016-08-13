// UI:
// Comment boxes positioned by cursor
// HeatMap:
// Prevent duplicate spans
// Adjust color based on # of comments/highlights
var accumulatedHighlightedItems = [];

$(function() {
    var ajax = $.ajax('/userData', {
        type: 'GET',
        dataType: 'json',

        // Stop assigning spans if it already exists in the doc
        // assigning color shade based on this color
        success: function(data) {
            var numberOfTimesHighlighted = 1;
            for (var key in data) {
                var obj = data[key];
                if (accumulatedHighlightedItems.length > 0) {
                    for (var i = 0; i < obj.highlightsByUser.length; i++) {
                        var highlightedText = obj.highlightsByUser[i].selectedText;
                        for (var j = 0; j < accumulatedHighlightedItems.length; j++) {
                            if (highlightedText != accumulatedHighlightedItems[j].text) {
                                accumulatedHighlightedItems.push({ 'text': highlightedText, 'id': numberOfTimesHighlighted });

                            }
                        }
                        console.log(accumulatedHighlightedItems);
                    }
                }
                console.log(obj.highlightsByUser.selectedText);
                accumulatedHighlightedItems.push({ 'text': obj.highlightsByUser.selectedText, 'id': numberOfTimesHighlighted });
            };
            // REMOVE DUPLICATE VALUES BASED ON OBJECT VALUE
            // accumulatedHighlightedItems = accumulatedHighlightedItems.filter(function(obj) {
            //     return obj.text !== accumulatedHighlightedItems[1].text;
            // });
            console.log(accumulatedHighlightedItems);
        }
    });
    ajax.done();
});




// If there are more than 1 highlight
//                     if (obj.highlightsByUser.length > 0) {
//                         // Will iterate over all the highlights by indiv user
//                         for (var i = 0; i < obj.highlightsByUser.length; i++) {
//                             var highlightedText = obj.highlightsByUser[i].selectedText;
//                             accumulatedHighlightedItems.push({ 'text': highlightedText, 'id': 1 });
//                         };

//                         if (accumulatedHighlightedItems.length > 0){
//                             for (var j = 0; j < accumulatedHighlightedItems.length; j++) {
//                                 if (accumulatedHighlightedItems[j]['text'] == highlightedText){
//                                 console.log('already exists');
//                         // arr[accumulatedHighlightedItems[j]['text']] == accumulatedHighlightedItems[j];
//                             }
//                         }

//                         // if my array of highlights is greater than 0
//                         // if (accumulatedHighlightedItems.length > 0) {
//                         //     // going to run through that array and look for duplicates
//                         //     for (var j = 0; j < accumulatedHighlightedItems.length; j++) {
//                         //         if (highlightedText == accumulatedHighlightedItems[j].text) {
//                         //             // if they exist, increase value of numberoftimeshighlighted
//                         //             console.log(accumulatedHighlightedItems[j]);
//                         //         }
//                         //         // just push it into the array
//                         //         // accumulatedHighlightedItems.push({ 'text': highlightedText, 'numberOfTimesHighlighted': numberOfTimesHighlighted });
//                         //     }
//                         //     console.log(accumulatedHighlightedItems);
//                         //     // accumulatedHighlightedItems.push({ 'text': highlightedText, 'numberOfTimesHighlighted': numberOfTimesHighlighted });


//                         // }

//                         // PseudoCode:
//                         // If (!highlighted txt in doc has span){
//                         // id += 1;

//                         // Option 2: massage the data and store into new array
//                         // Take all the highlights, push them into array as an object w/ id.
//                         // If duplicate highlights exist, increment id value.

//                         // if (accumulatedHighlightedItems.length > 0) {
//                         //     for (var i = 0; i < accumulatedHighlightedItems.length; i++) {
//                         //         var existingHighlightedText = accumulatedHighlightedItems[i]
//                         //         if (existingHighlightedText = highlightedText) {
//                         //             console.log('already exists');
//                         //         };
//                         //     };

//                         // }
//                         // accumulatedHighlightedItems.push(highlightedText);
//                         // This method is mushes the txt together. Can reformat into something cleaner?
//                         // console.log($('.sample span').text());

//                         // This method only gets me the 1st highlighted item:
//                         // var spanedAlready = $('.sample span').first().contents().filter(function() {
//                         //     return this.nodeType == 3;
//                         // }).text();
//                         // console.log(spanedAlready);

//                         // This method no work:
//                         // if ($('div:contains(' + obj.highlightsByUser[i].selectedText + '</span>)')) {
//                         //  console.log('need to highlight');
//                         // }

//                         // This method didn't work:
//                         // console.log($("div:contains(" + obj.highlightsByUser[i].selectedText + ')'.find('span').length > 0));
//                         // This evaluates to true. Could be used?
//                         // $('.sample').find('span').length > 0

//                         var spn = '<span class="selectedYellow">' + highlightedText + '</span>'
//                         $('.sample').html($('.sample').html().replace(highlightedText, spn));

//                     };
//                     // if (id > x){make color this}
//                 // accumulatedHighlightedItems.push({ 'text': highlightedText, 'numberOfTimesHighlighted': numberOfTimesHighlighted });
//                 // var arr = {};

//                 // accumulatedHighlightedItems = new Array();
//                 // for (var key in arr)
//                 //     accumulatedHighlightedItems.push(arr[key]);
//                 // console.log(accumulatedHighlightedItems);

//                 };
//         };
//     };            // console.log(obj.commentsByUser);
// });

// Take the entire document.
// See where users have highlighted and assign a point.
// If value > X, assign it a color.
// Color increases depnding on how high X is.
// Take all selectedText values, compare them
// Depending on overlap, assign a numerical value.
// Numerical value gets converted into color tone - darker, more highlights 
// if (data.user.highlightsByUser.length > 0) {
//     for (var i = 0; i < data.user.highlightsByUser.length; i++) {
//         var spn = '<span class="selectedYellow">' + data.user.highlightsByUser[i].selectedText + '</span>'
//         $('.sample').html($('.sample').html().replace(data.user.highlightsByUser[i].selectedText, spn));

//     }
// }
// if (data.user.commentsByUser.length > 0) {
//     for (var i = 0; i < data.user.commentedOnByUser.length; i++) {
//         $('.userComments').append('<i class="material-icons" id="comment">insert_comment</i>');

//     }
// }
