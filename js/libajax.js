var libajax = (function(){

    var TIMEOUT = 3000;

    var my        = {};
    var queue     = [];
    var callback  = null;
    var timeoutId = null;


    /**
     * Handler AJAX requests timeout.
    **/
    function timeoutHandler()
    {
        timeoutId = null;

        // Something went wrong with the current request: Alert the user
        // Further AJAX requests won't be executed since this one will forever stay in the queue
        libsysmsg.error(L10N.server_communication_error);
    }

    /**
     * Perform the next AJAX request.
    **/
    function next()
    {
        var params = queue[0];

        // Replace or add the handler
        if(params.hasOwnProperty("success")) callback = params.success;
        else                                 callback = null;

        params.success = success;

        // Manage request timeout
        timeoutId = setTimeout(timeoutHandler, TIMEOUT);

        // Now we can perform the request
        $.ajax(params);
    }


    /**
     * Internal callback for successful AJAX requests.
    **/
    function success(output)
    {
        // If the timeout is no longer running, something bad happened and we
        // should stop handling further AJAX requests
        if(timeoutId == null)
            return;

        clearTimeout(timeoutId);

        queue.shift();

        // Call the actual handler, if any
        if(callback != null)
            callback(output);

        // Next request?
        if(queue.length > 0)
            next();
    }


    /**
     * Queue AJAX requests to make sure they're executed sequentially.
     * Time out when a request takes too long to be executed.
     *
     * @param params Parameters of the AJAX request.
    **/
    my.ajax = function(params)
    {
        queue.push(params);

        // If that's the only pending request, process it right now
        if(queue.length == 1)
            next();
    }

    return my;

}());
