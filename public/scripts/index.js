//Filter comments for that position
//Send comment back
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
var start;
var end;

$(function() {
    username = prompt('What is your username? If not registered, please write one');
    console.log(username);
    checkForUserData(username);
    $(".sample")
        .mouseup(function() {
            textHighlightedByUser = getSelectionText();
            start = thisText.indexOf(textHighlightedByUser);
            end = start + textHighlightedByUser.length;
            // Add 2 for comment flag position.
            cursorPosition = { top: event.pageY - 36, left: event.pageX - 44 }
            if (textHighlightedByUser != "") {
                $(".highlightOptions").show().css({ 'top': event.pageY + 10, 'left': event.pageX });
                if ($("#highlight").click(function() {
                        // LIKELY SPOT FOR DUPLICATE SPAN APPLICATIONS
                        // Still putting up duplicate highlights
                        var textToHighlight = getHighlightedTextPosition(textHighlightedByUser, end, start);
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

    $('.sample').on('click', '#indivComment', function(event) {
        // Target the element that was clicked
        // Get the attribute value
        // Use this value to filter data and return the comment
        var position = $(event.target).closest('#indivComment').position();
        console.log(position.top, position.left);
        var ajax = $.ajax('/users/' + username + '/comments/' + position.top + '/' + position.left, {
            type: 'GET',
            parameters: 
            dataType: 'json',
            success: function(data) {
                console.log(data)
            },
            error: function(err) {
                console.log(err)
            }
        });
    });
});

$('#msgbox').dialog({
    position: 'right',
    autoOpen: false,
    modal: true,
    buttons: {
        Okay: function(e) {
            var userComment = $('#ta').val();
            $(this).dialog('close');
            $('<i class="material-icons id="indivComment">insert_comment</i>').appendTo('.sample')
                .css({
                    'position': 'absolute',
                    'top': cursorPosition.top,
                    'left': cursorPosition.left,
                    'opacity': 0.4
                });
            $('.userComments i').attr('id', function(i) {
                id = 'number' + (i + 1);
                return id

            });
            $('#' + id).css(cursorPosition);
            var newComment = { 'comment': userComment, 'text_end': end, 'text_start': start, 'cursorPositionTop': cursorPosition.top, 'cursorPositionLeft': cursorPosition.left };
            var ajax = $.ajax('/users/' + username + '/comments', {
                type: 'PUT',
                data: newComment,
                dataType: 'json',
            });
            ajax.done();
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
                    console.log(data);
                    for (var i = 0; i < data.highlights.length; i++) {
                        var textToHighlight = thisText.slice(data.highlights[i].text_start, data.highlights[i].text_end);
                        var spn = '<span class="selectedYellow">' + textToHighlight + '</span>';
                        // need to play with this more. Maybe insert vs. replace?
                        $('.sample').html($('.sample').html().replace(textToHighlight, spn));

                    }
                }

                if (data.comments.length > 0) {
                    for (var i = 0; i < data.comments.length; i++) {
                        $('<i class="material-icons" id="indivComment">insert_comment</i>').appendTo('.sample')
                            .css({
                                'position': 'absolute',
                                'top': data.comments[i].cursorPositionTop,
                                'left': data.comments[i].cursorPositionLeft,
                                'opacity': 0.4
                            });
                    }
                }
            }

        },
        error: function(err) {
            console.log(err);
        }
    });
    ajax.done();
};

var getHighlightedTextPosition = function(textHighlightedByUser, end, start) {
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
