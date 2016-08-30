// Comments:
// Delete comments permanently

// Comments link - open/close all
// Unhighlight item

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
    checkForUserData(username);
    $(".sample")
        .mouseup(function() {
            textHighlightedByUser = getSelectionText();
            // Getting numerical txt position of textHighlightedByUser
            start = thisText.indexOf(textHighlightedByUser);
            end = start + textHighlightedByUser.length;
            cursorPosition = { top: event.pageY - 36, left: event.pageX - 44 }
            if (textHighlightedByUser != "") {
                $(".highlightOptions").show().css({ 'top': event.pageY + 10, 'left': event.pageX });
                if ($("#highlight").click(function() {
                        // PUT IN RETURNED DATA HERE TO DETERMINE IF HIGHLIGHT IS UNIQUE
                        var textToHighlight = getHighlightedTextPosition(textHighlightedByUser, end, start);
                        var spn = '<span class="selectedYellow">' + textToHighlight + '</span>'
                        $('.sample').html($('.sample').html().replace(textToHighlight, spn));
                        if ($(textHighlightedByUser).hasClass('selectedYellow')) {
                            console.log('already highlighted');
                        }
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
        });

    $('.sample').on('click', '.indivCommentDiv', function(event) {
        var position = $(event.target).closest('.indivCommentContainer').position();
        var ajax = $.ajax('/users/' + username + '/comments/' + position.left + '/' + position.top, {
            type: 'GET',
            contentType: "application/json",
            dataType: 'json',
            success: function(data) {
                if ($(event.target).closest('.indivCommentContainer').has('.userCommentAfterClick').length == 0) {
                    $('<p class="userCommentAfterClick">' + data.comment + '</p>').prependTo($(event.target).closest('.indivCommentDiv'))
                        .css({
                            'bottom': 4,
                        });
                    $('<i class="material-icons closeCommentIcon">highlight_off</i>').appendTo($(event.target).closest('.indivCommentContainer'))
                        // .css({
                        //     'bottom': 55,
                        //     'left': data.cursorPositionLeft
                        // });
                    $('<i class="material-icons deleteCommentIcon">delete</i>').appendTo($(event.target).closest('.indivCommentContainer'));
                    // .css({
                    //     'bottom': data.cursorPositionTop + 50,
                    //     'left': data.cursorPositionLeft + 40
                    // });
                } else {
                    $(event.target).closest('.indivCommentDiv').children().first().show();
                    $(event.target).closest('.indivCommentContainer').children('.closeCommentIcon').show();
                    $(event.target).closest('.indivCommentContainer').children('.deleteCommentIcon').show();
                }


            },
            error: function(err) {
                console.log(err)
            }
        });

    });

    $('.sample').on('click', '.closeCommentIcon', function(event) {
        $(event.target).closest('.closeCommentIcon').siblings('.indivCommentDiv').children().first().hide();
        $(event.target).closest('.indivCommentContainer').children('.closeCommentIcon').hide();
        $(event.target).closest('.indivCommentContainer').children('.deleteCommentIcon').hide();
        // $(event.target).closest('#indivCommentDiv').hide();
    });

    $('.sample').on('click', '.deleteCommentIcon', function(event) {
        $(event.target).closest('.deleteCommentIcon').siblings('.indivCommentDiv').children().first().hide();
        $(event.target).closest('.indivCommentContainer').children('.closeCommentIcon').hide();
        $(event.target).closest('.indivCommentContainer').children('.deleteCommentIcon').hide().children().first();
        var commentToDelete = $(event.target).closest('.indivCommentContainer').children('.indivCommentDiv').children('.indivComment').attr('id');
        var ajax = $.ajax('/users/:username/comments', {
            type: 'DELETE',
            data: commentToDelete,
            dataType: 'json'
        });
        console.log(commentToDelete);
        ajax.done()
    });

});

$('#msgbox').dialog({
    position: 'right',
    autoOpen: false,
    modal: true,
    open: function() {
        emptyContentBox = $('#msgbox').html()
    },
    close: function() {
        $('#msgbox').html(emptyContentBox);
    },
    buttons: {
        Okay: function(e) {
            var userComment = $('#ta').val();
            $(this).dialog('close');
            var newComment = { 'comment': userComment, 'text_end': end, 'text_start': start, 'cursorPositionTop': cursorPosition.top, 'cursorPositionLeft': cursorPosition.left };
            var ajax = $.ajax('/users/' + username + '/comments', {
                type: 'PUT',
                data: newComment,
                dataType: 'json',
                success: function(data) {
                    var commentObjectID = data._id;

                    $('<div class="indivCommentContainer"><div class="indivCommentDiv"><i class="material-icons indivComment" id=' + commentObjectID + '>insert_comment</i></div></div>').appendTo('.sample')
                        .css({
                            'position': 'absolute',
                            'top': cursorPosition.top,
                            'left': cursorPosition.left,
                        });
                }
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
        success: function(userData) {
            console.log(userData);
            if (userData.userData.length == 0) {
                registerNewUser(username);
                console.log('Welcome', username)
            } else {
                if (userData.userHighlights.length > 0) {
                    for (var i = 0; i < userData.userHighlights.length; i++) {
                        var textToHighlight = thisText.slice(userData.userHighlights[i].text_start, userData.userHighlights[i].text_end);
                        var spn = '<span class="selectedYellow">' + textToHighlight + '</span>';
                        // need to play with this more. Maybe insert vs. replace?
                        $('.sample').html($('.sample').html().replace(textToHighlight, spn));

                    }
                }

                if (userData.userData.comments.length > 0) {
                    for (var i = 0; i < userData.userData.comments.length; i++) {
                        $('<div class="indivCommentContainer"><div class="indivCommentDiv"><i class="material-icons indivComment" id=' + userData.userData.comments[i]._id + '>insert_comment</i></div></div>').appendTo('.sample')
                            .css({
                                'position': 'absolute',
                                'top': userData.userData.comments[i].cursorPositionTop,
                                'left': userData.userData.comments[i].cursorPositionLeft,
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
        dataType: 'json',
        success: function(data) {
            console.log(data);
        }

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
    ajax.done();
};

function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
};
