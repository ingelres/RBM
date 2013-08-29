var libsysmsg = (function(){

    var my = {};

    /**
     * Display an error message.
     *
     * @param msg The error message.
    **/
    my.error = function(msg)
    {
        var dlg = $("<span id='css-errmsg'>" + msg + "</span>").appendTo("body");

        // Center the message: It must be present in the DOM for outerWidth() to work
        dlg.css('left', ($("body").outerWidth() - dlg.outerWidth()) / 2).fadeIn();
    }

    return my;

}());
