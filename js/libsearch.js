var libsearch = (function() {

    var my = {};


    /**
     * Initialization code.
    **/
    $(function(){

        // Make the search-by-tag box an autocomplete widget
        $("#css-search-by-tag").autocomplete({
            delay:  0,
            source: libtags.getAllTagNames(),
        }).keyup(function(evt){
            if(evt.keyCode == 13){
                libexp.showAndSelectTags(libtags.getIdFromName($("#css-search-by-tag").autocomplete("close").val()));
                $("#css-search-by-tag").val("");
            }
        });
    });


    /**
     * Update the list of tags when searching by tag.
    **/
    my.updateSourceTags = function()
    {
        $("#css-search-by-tag").autocomplete("option", "source", libtags.getAllTagNames());
    }


    return my;

}());
