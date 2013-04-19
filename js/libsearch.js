var libsearch = (function() {

    var my = {};


    /**
     * Initialization code.
    **/
    $(function(){

        // Make the search-by-tag box an autocomplete widget
        $("#css-search-by-tag").autocomplete({
            delay:  0,
            source: libtags.jsfunc_getAllTagNames(),
        }).keyup(function(evt){
            if(evt.keyCode == 13){
                libexp.jsfunc_showAndSelectTag($("#css-search-by-tag").autocomplete("close").val());
            }
        });
    });


    /**
     * Update the list of tags when searching by tag.
    **/
    my.jsfunc_updateSourceTags = function()
    {
        $("#css-search-by-tag").autocomplete("option", "source", libtags.jsfunc_getAllTagNames());
    }


    return my;

}());
