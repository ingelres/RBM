function jsfunc_addTag()
{
    var tag = prompt("Enter the tag name");

    $.ajax({
        data: "action=addTag&name=" + tag,
    });
}

function jsfunc_deleteTag()
{
    var tag = prompt("Enter the tag Id");

    $.ajax({
        data: "action=deleteTag&id=" + tag,
    });
}

function jsfunc_onReady()
{
    // JQuery default settings for AJAX requests
    $.ajaxSetup({
        url:   "ajax/ajax.php",
        type:  "GET",
        cache: false,
    });
}

$(document).ready(jsfunc_onReady);
