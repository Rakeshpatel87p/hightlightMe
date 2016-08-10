// Server-side req:
// When user loads page, if certain number of highlights are met:
//      -Shows users.
// Create heat map of comments on a page & issues

// UI Issues:
// Determine unsmile face usability
// Place marker flag where comments are left
// Unhighlighting highlighted text

var textHighlightedByUser;
var cursorPosition;
var id;
var date = $.datepicker.formatDate('yy/mm/dd', new Date());


$(function() {
    getIndivUserData();
    $(".sample")
        .mouseup(function() {
            cursorPosition = { 'top': event.pageY, 'left': event.pageX }
            textHighlightedByUser = getSelectionText();
            if (textHighlightedByUser != "") {
                $(".highlightOptions").show().css({ 'top': event.pageY + 10, 'left': event.pageX });
                // $(".highlightOptions").show().css({ 'top': event.pageY + 10, 'left': event.pageX });
                if ($("#highlight").click(function() {
                        // LIKELY SPOT FOR DUPLICATE SPAN APPLICATIONS
                        var spn = '<span class="selectedYellow">' + textHighlightedByUser + '</span>'
                        $('.sample').html($('.sample').html().replace(textHighlightedByUser, spn));
                        
                        if ($(textHighlightedByUser).hasClass('selectedYellow')){
                            console.log('already highlighted');
                        }
                        // This method didn't work
                        // if ($('div:contains(' + textHighlightedByUser + ')').hasAttribute('span'){
                        //  console.log('yeppers');
                        // })
                        
                        // This method didn't work either.
                        // $('div:contains(' + textHighlightedByUser + ')').html(function(_, html) {
                        // var attr = $('div:contains(' + textHighlightedByUser + ')').hasClass('selectedYellow');
                        
                        // if ($('div:contains(' + textHighlightedByUser + ')').hasClass('selectedYellow') == false) {
                        // return html.replace(textHighlightedByUser, '<span class="selectedYellow">' + textHighlightedByUser + '</span>');
                        // } 
                        // console.log('statement evals to true');
                        // });
                        var highlightedItem = { 'selectedText': textHighlightedByUser, 'date': date };
                        console.log('highlighted Item', highlightedItem);
                        var ajax = $.ajax('/userData', {
                            type: 'POST',
                            data: JSON.stringify(highlightedItem),
                            dataType: 'json',
                            contentType: 'application/json',
                        });
                        ajax.done(console.log('Posted Item:', highlightedItem));
                        $(".highlightOptions").hide();
                    }));
                if ($("#comment").click(function(event) {
                        event.preventDefault();
                        var id = $(this).data("id");

                        // var src = 'http://placehold.it/150x150';
                        // var desc = 'This is the first bit of remarks';

                        // $("#theImage").attr("src", src).removeClass("hide");
                        // $("#theDescription").html(desc).removeClass("hide");

                        $('#msgbox').dialog('open').css({ 'top': event.pageY - 100, 'left': event.pageX });
                    }));

                if ($("#negFeedback").click(function() {

                        $(".highlightOptions").hide();
                    }));


            } else {
                $('.highlightOptions').hide();
            };

            // if ($(document).click(function(evt) {
            //         if (!$(evt.target).closest('.highlightOptions').length) {
            //             console.log('stage one');
            //             if ($('.highlightOptions').is(":visible")) {
            //                 console.log('made it!')
            //                 $('.highlightOptions').hide();
            //             }
            //         }
            //     }));

            // Logic that should hide highlightOptions when click registered outside


            //     if ($(document).click(function() {
            //             $(".highlightOptions").hide();
            //         }))

            //         console.log(textHighlightedByUser);

        });
    $('.heatMapLink').click(function() {
        var ajax = $.ajax('/userData', {
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                for (var i = Things.length - 1; i >= 0; i--) {
                    Things[i]
                }
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
            }
        });
        ajax.done();
    })

});

var getIndivUserData = function(data) {
    var ajax = $.ajax('/userData', {
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            if (data.user.highlightsByUser.length > 0) {
                for (var i = 0; i < data.user.highlightsByUser.length; i++) {
                    var spn = '<span class="selectedYellow">' + data.user.highlightsByUser[i].selectedText + '</span>'
                    $('.sample').html($('.sample').html().replace(data.user.highlightsByUser[i].selectedText, spn));

                }
            }
            if (data.user.commentsByUser.length > 0) {
                for (var i = 0; i < data.user.commentedOnByUser.length; i++) {
                    $('.userComments').append('<i class="material-icons" id="comment">insert_comment</i>');

                }
            }
        }
    });
    ajax.done();
};

$('#msgbox').dialog({
    position: 'right',
    autoOpen: false,
    modal: true,
    buttons: {
        Okay: function() {
            // var oldComments = $("#theDescription").html();
            var newComments = $('#ta').val();
            $(this).dialog('close');
            // How to get newly appended items in diff positions, based on the cursor click
            $('.userComments').append('<i class="material-icons" id="comment">insert_comment</i>');
            $('.userComments i').attr('id', function(i) {
                id = 'number' + (i + 1);
                return id

            });
            $('#' + id).css(cursorPosition);
            var item = { 'comment': newComments, 'selectedText': textHighlightedByUser, 'date': date };
            var ajax = $.ajax('/userData', {
                type: 'POST',
                data: JSON.stringify(item),
                dataType: 'json',
                contentType: 'application/json',
            });
            ajax.done(console.log('PostedItem:', item));
            $(".highlightOptions").hide();

        },
        // $(this).dialog('close');

        // },
        Cancel: function() {
            $(this).dialog('close');
            $(".highlightOptions").hide();
        }
    }
})

function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
};
// Trying to assign indiv id values so that can properly position comment flags
function add() {
    $('.userComments i').attr('id', function(i) {
        'number' + (i + 1)

    });
    $('#')
};

// var dataFromUsers = function() {
// this.items = [];
// // this.itemList = $('#item-list');
// // this.itemListTemplate = Handlebars.compile($("#item-list-template").html());
// this.input = $('#item-input');
// this.input.keydown(this.onAddInputKeydown.bind(this));
// $(document).on('click', 'button',
//     this.onAddInputKeydown.bind(this));
//     dataFromUsers.onAddInputKeydown(sample);
// });
// this.main = $('#main');
// this.main.on('dblclick', 'li',
//              this.onEditItemClicked.bind(this));
// this.main.on('keydown', 'li input',
//              this.onEditInputKeydown.bind(this));
// this.main.on('focusout', 'li input',
//              this.onEditFocusOut.bind(this));
// this.main.on('click', 'li .delete-item',
//              this.onDeleteItemClicked.bind(this));
// this.getItems();
// };

// dataFromUsers.prototype.onAddInputKeydown = function(event) {
//     if (event.which != 13) {
//         return;
//     }
//     var input = $(event.target);
//     var value = input.val().trim();
//     if (value != '') {
//         this.addItem(value);
//     }
//     input.val('');
//     event.preventDefault();
// };

// dataFromUsers.prototype.addItem = function(comment) {
//     var item = { 'comment': comment };
//     var ajax = $.ajax('/userData', {
//         type: 'POST',
//         data: JSON.stringify(item),
//         dataType: 'json',
//         contentType: 'application/json'
//     });
//     console.log('adding')
//     ajax.done(this.getItems.bind(this));
// };

// function highlightText() {
//     $('input[name="colorSelection"]').prop('checked', false);
//     $(".highlightOptions").show();
//     // Requires value to be selected and then highlighting takes place.
//     // Want to reverse this: select text, choose color, highlight txt.
//     if ($('#yellowCheck').is(':checked')) {
//         $('div:contains(' + textHighlightedByUser + ')').html(function(_, html) {
//             return html.replace(textHighlightedByUser, '<span class="selectedYellow">' + textHighlightedByUser + '</span>');
//         });
//         // $(".highlightOptions").hide();
//         $('input[name="colorSelection"]').prop('checked', false);
//     } else if ($("#redCheck").is(':checked')) {
//         $('div:contains(' + textHighlightedByUser + ')').html(function(_, html) {
//             return html.replace(textHighlightedByUser, '<span class="selectedRed">' + textHighlightedByUser + '</span>');
//         });
//         // $(".highlightOptions").hide();
//         $('input[name="colorSelection"]').prop('checked', false);
//     }

// };

// Backend part - take the highlights and spit back relevant info to clients
