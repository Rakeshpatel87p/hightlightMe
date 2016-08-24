// Send comments to server
// Load comments of user onto webpage
// Ensure no duplicates of highlights

// Call and receive highlights data to/from heat map
// Call and receive comments data to/from heat map
// Design UI tools to manipulate data

var textHighlightedByUser;
var cursorPosition;
var id;
var date = $.datepicker.formatDate('yy/mm/dd', new Date());
var thisText = $('.sample').text();
var username;

$(function() {
    username = prompt('What is your username? If not registered, please write one');
    checkForUserData(username);
    $(".sample")
        .mouseup(function() {
            textHighlightedByUser = getSelectionText();
            cursorPosition = { top: event.pageY, left: event.pageX }
            if (textHighlightedByUser != "") {
                $(".highlightOptions").show().css({ 'top': event.pageY + 10, 'left': event.pageX });
                if ($("#highlight").click(function() {
                        // LIKELY SPOT FOR DUPLICATE SPAN APPLICATIONS
                        // Still putting up duplicate highlights
                        var textToHighlight = getHighlightedTextPosition(textHighlightedByUser);
                        var spn = '<span class="selectedYellow">' + textToHighlight + '</span>'
                        $('.sample').html($('.sample').html().replace(textToHighlight, spn));
                        // console.log('logging THIS', $(this));
                        if ($(textHighlightedByUser).hasClass('selectedYellow')) {
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
                        // var highlightedItem = { 'selectedText': textHighlightedByUser, 'date': date };
                        $(".highlightOptions").hide();
                    }));
                if ($("#comment").click(function(event) {
                        event.preventDefault();
                        var id = $(this).data("id");

                        $('#msgbox').dialog('open').css({ 'top': event.pageY - 100, 'left': event.pageX });
                    }));


            } else {
                $('.highlightOptions').hide();
            };

            // Logic that should hide highlightOptions when click registered outside
            //     if ($(document).click(function() {
            //             $(".highlightOptions").hide();
            //         }))

            //         console.log(textHighlightedByUser);

        });


});

$('#msgbox').dialog({
    position: 'right',
    autoOpen: false,
    modal: true,
    buttons: {
        Okay: function(e) {
            var newComments = $('#ta').val();
            $(this).dialog('close');
            $('<i class="material-icons" id="comment">insert_comment</i>').appendTo('.sample')
                .css({
                    'position': 'absolute',
                    'top': cursorPosition.top + 2,
                    'left': cursorPosition.left,
                    'opacity': 0.4
                });
            $('.userComments i').attr('id', function(i) {
                id = 'number' + (i + 1);
                return id

            });
            $('#' + id).css(cursorPosition);
            // Need to find way of bringing start/end values here.
            // var item = { 'comment': newComments, 'selectedText': 'sample' 'text_end': 'sample'};
            // var ajax = $.ajax('/user/' + username + '/comments', {
            //     type: 'PUT',
            //     data: JSON.stringify(item),
            //     dataType: 'json',
            //     contentType: 'application/json',
            // });
            // ajax.done(console.log('PostedItem:', item));
            $(".highlightOptions").hide();

        },
        // $(this).dialog('close');

        // },
        Cancel: function() {
            $(this).dialog('close');
            $(".highlightOptions").hide();
        }
    }
});

var checkForUserData = function(username) {
    var ajax = $.ajax('/users/' + username, {
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            if (data == null) {
                registerNewUser(username);
            } else {
                if (data.highlights.length > 0) {
                    for (var i = 0; i < data.highlights.length; i++) {
                        var textToHighlight = thisText.slice(data.highlights[i].text_start, data.highlights[i].text_end);
                        var spn = '<span class="selectedYellow">' + textToHighlight + '</span>';
                        // need to play with this more. Maybe insert vs. replace?
                        $('.sample').html($('.sample').html().replace(textToHighlight, spn));

                    }
                }
                // if (data.user_1.commentsByUser.length > 0) {
                //     for (var i = 0; i < data.user_1.commentsByUser.length; i++) {
                //         $('.userComments').append('<i class="material-icons" id="comment">insert_comment</i>');

                //     }
                // }
            }


        },
        error: function(err) {
            console.log(err);
        }
    });
    ajax.done();
};

var getHighlightedTextPosition = function(textHighlightedByUser) {
    var start = thisText.indexOf(textHighlightedByUser);
    var end = start + textHighlightedByUser.length;
    var ajax = $.ajax('/users/' + username + '/highlights', {
        type: 'PUT',
        data: { 'text_end': end, 'text_start': start },
        dataType: 'json'

    });
    ajax.done();

    return thisText.slice(start, end);
};

var registerNewUser = function(username) {
    var ajax = $.ajax('/users', {
        type: 'POST',
        data: { username: username },
        dataType: 'string',
    });
    ajax.done(console.log('registered new user'));
};

function getSelectionText() {
    var text = "";
    // console.log('winSelect', window.getSelection());
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
