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
                searchByTagName($("#css-search-by-tag").autocomplete("close").val());
                $("#css-search-by-tag").val("");
            }
        });
    });


    /**
     * Search for tags with a given name.
     * If multiple tags match the name, fill in the homonyms section.
     *
     * @param tname The tag name.
    **/
    function searchByTagName(tname)
    {
        var tid = libtags.getIdFromName(tname);

        libexp.showAndSelectTags(tid, false);

        // Multiple matches: Allow the user to distinguish between them
        if(tid.length > 1)
        {
            // Make sure parents are sorted
            var parents = [];

            for(var i=0; i<tid.length; ++i)
                parents.push([libtags.getName(libtags.getParent(tid[i])), tid[i]]);

            parents.sort();

            // Create the HTML code
            var code = "<b>" + L10N.parent_tags + "</b>";

            for(var i=0; i<parents.length; ++i)
                code += "<span class='css-tag-drawing' onclick='libsearch.onHomonymClicked(" + parents[i][1] + ")'>" + parents[i][0] + "</span>";

            // Update the homonyms section
            $("#css-results-homonyms").html(code).show();
        }
        else
            $("#css-results-homonyms").hide();
    }


    /**
     * Homonym selection handler.
     *
     * @param tid The homonym tag ID.
    **/
    my.onHomonymClicked = function(tid)
    {
        libexp.showAndSelectTags([tid], false);
        $("#css-results-homonyms").hide();
    }


    /**
     * Update the list of tags when searching by tag.
    **/
    my.updateSourceTags = function()
    {
        $("#css-search-by-tag").autocomplete("option", "source", libtags.getAllTagNames());
    }


    return my;

}());
