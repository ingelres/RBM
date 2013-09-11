var libbookmarks = (function(){

    var my = {};


    /**
     * Initialization code.
    **/
    $(function(){

        // Create the dialog box used to edit a bookmark
        $("#css-dialog-edit-bookmark").dialog({
            modal: true,
            width: 400,
            autoOpen: false,
            buttons: [{
                text: L10N.cancel,
                click: function(){
                    $(this).dialog("close");
                }},{
                text: L10N.ok,
                click: function(){
                }}
            ]
        });
    });


    /**
     * Let the user create a new bookmark.
    **/
    my.create = function()
    {
        $("#css-dialog-edit-bookmark").dialog("option", "title", L10N.create_bookmark).dialog("open");
    }


    return my;

}());
