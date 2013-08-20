var libajax = (function(){

    var my       = {};
    var queue    = [];
    var callback = null;


    /**
     * Perform the next AJAX request.
    **/
    function jsfunc_next()
    {
        var params = queue[0];

        // Replace or add the handler
        if(params.hasOwnProperty("success")) callback = params.success;
        else                                 callback = null;

        params.success = jsfunc_success;

        // Now we can perform the request
        $.ajax(params);
    }


    /**
     * Internal callback for successful AJAX requests.
    **/
    function jsfunc_success(output)
    {
        queue.shift();

        // Call the actual handler, if any
        if(callback != null)
            callback(output);

        // Next request?
        if(queue.length > 0)
            jsfunc_next();
    }


    /**
     * Queue AJAX requests to make sure they're executed sequentially.
     * Time out when a request takes too long to be executed.
     *
     * @param params Parameters of the AJAX request.
    **/
    my.jsfunc_ajax = function(params)
    {
        queue.push(params);

        // If that's the only pending request, process it right now
        if(queue.length == 1)
            jsfunc_next();
    }

    return my;

}());
