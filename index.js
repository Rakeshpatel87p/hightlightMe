// Positioning of comment box
// Place marker flag where comments are left
// Unhighlighting highlighted text
// Click again and have highlighter toolkit go away
// Determine unsmile face usability
// Determine server-side req

var textHighlightedByUser;
var cursorPosition

$(function() {
    $(".sample")
        .mouseup(function() {
            cursorPosition = {'top': event.pageY, 'left': event.pageX }
            textHighlightedByUser = getSelectionText();
            $(".highlightOptions").show().css({ 'top': event.pageY + 10, 'left': event.pageX });
            if ($("#highlight").click(function() {
                    $('div:contains(' + textHighlightedByUser + ')').html(function(_, html) {
                        return html.replace(textHighlightedByUser, '<span class="selectedYellow">' + textHighlightedByUser + '</span>');
                    });
                    $(".highlightOptions").hide();
                }));
            if ($("#comment").click(function(event) {
                    console.log(event.pageX);
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
            //     if ($(document).click(function() {
            //             $(".highlightOptions").hide();
            //         }))

            //         console.log(textHighlightedByUser);

        });

    $('#msgbox').dialog({        
        autoOpen: false,
        modal: true,
        buttons: {
            Okay: function() {
                // var oldComments = $("#theDescription").html();
                var newComments = $('#ta').val();
                $(this).dialog('close');
                $('.userComments').append('<i class="material-icons" id="comment">insert_comment</i>').css(cursorPosition);
                //Do your ajax update here:
                /*
                $.ajax({
                    //Unsure of cfc syntax
                });
                */
                // $(this).dialog('close');
                $(".highlightOptions").hide();

            },
            Cancel: function() {
                $(this).dialog('close');
                $(".highlightOptions").hide();
            }
        }
    });

});

function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
};

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
