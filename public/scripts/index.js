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
            // User selects text
            if (textHighlightedByUser != "") {
                $(".highlightOptions").show().css({ 'top': event.pageY + 10, 'left': event.pageX });
                // Highlight button is clicked
                if ($("#highlight").click(function() {
                        var textToHighlight = getHighlightedTextPosition(textHighlightedByUser, end, start);
                        var spn = '<span class="selectedYellow">' + textToHighlight + '</span>'
                        $('.sample').html($('.sample').html().replace(textToHighlight, spn));
                        $(".highlightOptions").hide();
                    }));
                // Comment button is clicked
                if ($("#comment").click(function(event) {
                        event.preventDefault();
                        var id = $(this).data("id");
                        $('#msgbox').dialog('open').css({ 'top': event.pageY - 100, 'left': event.pageX });
                    }));

            } else {
                $('.highlightOptions').hide();
            };
        });
    // Indiv comment is clicked - user comment is loaded
    $('.sample').on('click', '.indivCommentDiv', function(event) {
        var commentId = $(event.target).closest('.indivCommentContainer').children('.indivCommentDiv').children('.indivComment').attr('id');
        var ajax = $.ajax('/users/' + username + '/comments/' + commentId, {
            type: 'GET',
            contentType: "application/json",
            dataType: 'json',
            success: function(data) {
                if ($(event.target).closest('.indivCommentContainer').has('.userCommentAfterClick').length == 0) {
                    $('<p class="userCommentAfterClick">' + data.comment + '</p>').prependTo($(event.target).closest('.indivCommentDiv'))
                        .css({
                            'bottom': 4,
                        });
                    $('<i class="material-icons closeCommentIcon">highlight_off</i>').appendTo($(event.target).closest('.indivCommentContainer'));
                    $('<i class="material-icons deleteCommentIcon">delete</i>').appendTo($(event.target).closest('.indivCommentContainer'));

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
    // Comment is closed by user
    $('.sample').on('click', '.closeCommentIcon', function(event) {
        $(event.target).closest('.closeCommentIcon').siblings('.indivCommentDiv').children().first().hide();
        $(event.target).closest('.indivCommentContainer').children('.closeCommentIcon').hide();
        $(event.target).closest('.indivCommentContainer').children('.deleteCommentIcon').hide();
    });
    // Comment is deleted by user
    $('.sample').on('click', '.deleteCommentIcon', function(event) {
        var commentToDelete = $(event.target).closest('.indivCommentContainer').children('.indivCommentDiv').children('.indivComment').attr('id');
        var ajax = $.ajax('/users/:username/comments', {
            type: 'DELETE',
            data: { commentIdToDelete: commentToDelete },
            dataType: 'json'
        });
        ajax.done();
        $(event.target).closest('.indivCommentContainer').remove();

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
                    console.log(data);
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
            if (userData == null) {
                registerNewUser(username);
                console.log('Welcome', username)
            } else {
                console.log('Welcome back', username)
                if (userData.userHighlights.length > 0) {
                    for (var i = 0; i < userData.userHighlights.length; i++) {
                        var textToHighlight = thisText.slice(userData.userHighlights[i].text_start, userData.userHighlights[i].text_end);
                        var spn = '<span class="selectedYellow">' + textToHighlight + '</span>';
                        $('.sample').html($('.sample').html().replace(textToHighlight, spn));

                    }
                }

                if (userData.userComments.length > 0) {
                    for (var i = 0; i < userData.userComments.length; i++) {
                        $('<div class="indivCommentContainer"><div class="indivCommentDiv"><i class="material-icons indivComment" id=' + userData.userComments[i]._id + '>insert_comment</i></div></div>').appendTo('.sample')
                            .css({
                                'position': 'absolute',
                                'top': userData.userComments[i].cursorPositionTop,
                                'left': userData.userComments[i].cursorPositionLeft,
                            });
                    }
                }
            }
        },
        error: function(err) {
            registerNewUser(username);
            console.log('Welcome', username)
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
