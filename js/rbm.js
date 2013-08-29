$(function(){

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
