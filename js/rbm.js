$(function(){

    // Make the search-by-tag box an autocomplete widget
    $("#css-search-by-tag").autocomplete({
        delay:  0,
        source: libtags.jsfunc_getAllTagNames(),
    }).keyup(function(evt){
        if(evt.keyCode == 13){
            libexp.jsfunc_scrollToTag($("#css-search-by-tag").autocomplete("close").val());
        }
    });

    // Default settings for AJAX requests
    $.ajaxSetup({
        url:   "ajax/ajax.php",
        type:  "GET",
        cache: false,
    });
});
