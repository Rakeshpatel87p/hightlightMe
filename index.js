var textHighlightedByUser;

$(function() {
    $(".sample")
        .mouseup(function() {
            $(".highlightOptions").show();
            textHighlightedByUser = getSelectionText();            
            highlightText();
            console.log(textHighlightedByUser);

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

function highlightText() {
    $(".highlightOptions").show();
    if ($('#yellowCheck').is(':checked')) {
        $('div:contains(' + textHighlightedByUser + ')').html(function(_, html) {
            return html.replace(textHighlightedByUser, '<span class="selectedYellow">' + textHighlightedByUser + '</span>');
        });
        $(".highlightOptions").hide();
        $('input[name="colorSelection"]').prop('checked', false);
    } else if ($("#redCheck").is(':checked')) {
        $('div:contains(' + textHighlightedByUser + ')').html(function(_, html) {
            return html.replace(textHighlightedByUser, '<span class="selectedRed">' + textHighlightedByUser + '</span>');
        });
        $(".highlightOptions").hide();
        $('input[name="colorSelection"]').prop('checked', false);
    }

};

// Backend part - take the highlights and spit back relevant info to clients
