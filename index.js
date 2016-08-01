// JQuery part - when text is selected, window pops up, giving user options of what to do with text

var clicking = false;

$(document).ready(function() {
        $('.sample').mousedown(function() {
            clicking = true;
            $('.sample').css('background-color', 'yellow');

            // how to apply color only to selected text - individual letters
        });

        $(document).mouseup(function() {
            clicking = false;
            console.log(clicking);
        });

        $('.sample').mousemove(function() {
            if (clicking == false) return;
            console.log('clicking', clicking)

        });
    })
    // Backend part - take the highlights and spit back relevant info to clients
