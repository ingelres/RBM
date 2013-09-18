var libbookmarks = (function(){

    var my   = {};
    var tags = [];


    /**
     * Initialization code.
    **/
    $(function(){

        // Create the dialog box used to edit a bookmark
        $("#css-dialog-edit-bookmark").dialog({
            modal: false,
            width: 400,
            autoOpen: false,
            buttons: [{
                text: L10N.cancel,
                click: function(){
                    $(this).dialog("close");
                }},{
                text: L10N.ok,
                click: onDlgOk,
            }]
        });

        $("#css-edit-bookmark-tags-dropzone").droppable({
            tolerance: "pointer",
            hoverClass: "css-edit-bookmark-droppable",
            accept: function(drg){ return tags.indexOf(drg.data("tid")) == -1},
            drop: function(evt, ui){
                var tid = $(ui.draggable).data("tid");

                // FIXME There should be some tooltip on the tag to distinguish between homonyms
                // FIXME Do something smart when there's too many tags and the line wraps
                tags.push(tid);
                $("#css-edit-bookmark-tags-dropzone").append("<span class='css-tag-drawing'>" + libtags.getName(tid) + "</span>");
            },
        });
    });


    /**
     * Open the dialog box that allows the user to create a bookmark.
    **/
    my.create = function()
    {
        // Start from scratch
        tags = [];

        $("#css-edit-bookmark-url").val("");
        $("#css-edit-bookmark-name").val("");
        $("#css-edit-bookmark-tags-dropzone").empty();

        // Show the dialog box
        $("#css-dialog-edit-bookmark").dialog("option", "title", L10N.create_bookmark).dialog("open");
    }


    /**
     * Handler for the OK button (creating/editing a bookmark).
    **/
    function onDlgOk()
    {
        var url  = $("#css-edit-bookmark-url").val();
        var name = $("#css-edit-bookmark-name").val();

             if(url.length == 0)  libsysmsg.error(L10N.url_empty);
        else if(name.length == 0) libsysmsg.error(L10N.name_empty);
        else if(tags.length == 0) libsysmsg.error(L10N.tags_empty);
        else
        {
            // FIXME Create the bookmark
        }
    }


    return my;

}());
