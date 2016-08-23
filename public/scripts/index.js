// Load highlighted items of user onto webpage
// Send comments to server
// Load commens of user onto webpage

var textHighlightedByUser;
var cursorPosition;
var id;
var date = $.datepicker.formatDate('yy/mm/dd', new Date());


$(function() {
    var username = prompt('What is your username? If not registered, please write one');
    checkForUserData(username);
    $(".sample")
        .mouseup(function() {
            var thisText = $(this).text();
            textHighlightedByUser = getSelectionText();
            cursorPosition = { top: event.pageY, left: event.pageX }
            if (textHighlightedByUser != "") {
                $(".highlightOptions").show().css({ 'top': event.pageY + 10, 'left': event.pageX });
                if ($("#highlight").click(function() {
                        // LIKELY SPOT FOR DUPLICATE SPAN APPLICATIONS
                        // if (textHighlightedByUser = )
                        var textToHighlight = getHighlightedTextPosition(thisText, textHighlightedByUser);
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
                        var highlightedItem = { 'selectedText': textHighlightedByUser, 'date': date };
                        var ajax = $.ajax('/userData', {
                            type: 'GET',
                            dataType: 'json',
                            success: function(data) {
                                for (var i = 0; i < data.user_1.highlightsByUser.length; i++) {
                                    console.log('Before if', textHighlightedByUser, data.user_1.highlightsByUser[i].selectedText);

                                    // console.log(data.user_1.highlightsByUser[i]);
                                    if (textHighlightedByUser === data.user_1.highlightsByUser[i].selectedText) {
                                        console.log('During if', textHighlightedByUser, data.user_1.highlightsByUser[i].selectedText);

                                        return;
                                    } else {
                                        console.log('else', textHighlightedByUser, data.user_1.highlightsByUser[i].selectedText);
                                    }
                                }
                            }
                        });
                        var ajax = $.ajax('/users', {
                            type: 'POST',
                            data: JSON.stringify(highlightedItem),
                            dataType: 'json',
                            contentType: 'application/json',
                        });
                        ajax.done();
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
            // How to get newly appended items in diff positions, based on the cursor click
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
});

var checkForUserData = function(username) {
    var ajax = $.ajax('/users/' + username, {
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            if (data == null) {
                registerNewUser(username);
            } else {
                console.log('we got a match');
                console.log(data);
                // if (data.highlights.length > 0) {
                //     for (var i = 0; i < data.highlights.length; i++) {
                //         var spn_start = '<span class="selectedYellow">' + data.highlights[i].selectedText;
                //         var spn_end = 
                //         // need to play with this more. Maybe insert vs. replace?
                //         $('.sample').html($('.sample').html().replace(data.highlights[i].text_start, spn_start));

                //     }
                // }
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

var getHighlightedTextPosition = function(thisText, textHighlightedByUser) {
    var start = thisText.indexOf(textHighlightedByUser);
    var end = start + textHighlightedByUser.length;
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
