var libtags = (function() {

    var my = {};

    // Return true if tid is a descendant of ptid (it doesn't have to be a direct child)
    my.jsfunc_tidIsDescendant = function(tid, ptid)
    {
        while((tid = rbm_tid_parents[tid]) != undefined)
        {
            if(tid == ptid)
                return true;
        }

        return false;
    }

    // Return an array with all the tags Id from the top-level to tid (tid is not included in the array)
    my.jsfunc_getParents = function(tid)
    {
        var hierarchy = [];

        while((tid = rbm_tid_parents[tid]) != undefined)
            hierarchy.push(tid);

        return hierarchy.reverse();
    }

    return my;

}());
