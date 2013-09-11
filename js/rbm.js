$(function(){


    /**
     * Set the height of the page content according to the available space.
    **/
    function resize()
    {
        // Take into account the header and the 1px border
        var height = $(window).height() - 50 - 1;

        if(height < 200)
            height = 200;

        $('#css-explorer').css('height', height);
        $('#css-bookmarks').css('height', height);
    }


    // Resize the height of the page content when the available space changes, and do it now as well
    resize();
    $(window).resize(resize);

    // Default settings for AJAX requests
    $.ajaxSetup({
        url:   "ajax/ajax.php",
        type:  "GET",
        cache: false,
    });

    // Initialization error?
    if(INIT_ERR != null)
        libsysmsg.error(INIT_ERR);
});
