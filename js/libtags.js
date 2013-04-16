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
        var hierarchy = Array();

        while((tid = rbm_tid_parents[tid]) != undefined)
            hierarchy.push(tid);

        return hierarchy.reverse();
    }

    // Return an array with all the tag names (not sorted)
    my.jsfunc_getAllTagNames = function()
    {
        var tnames = Array();

        $.each(rbm_tid_to_tname, function(tid, tname){
            tnames.push(tname);
        });

        return tnames;
    }

    // Return the level of tid (top-level is level 1)
    my.jsfunc_getLevel = function(tid)
    {
        var level = 1;

        while((tid = rbm_tid_parents[tid]) != undefined)
            ++level;

        return level;
    }

    // Make tid a child of ptid
    my.jsfunc_reparent = function(tid, ptid)
    {
        // If tid already had a parent, remove it from this parent's children
        var oldptid = rbm_tid_parents[tid];

        if(oldptid != undefined)
        {
            var oldchildren = rbm_tid_children[oldptid];

            if(oldchildren.length == 1) delete rbm_tid_children[oldptid];
            else                        oldchildren.splice(oldchildren.indexOf(tid), 1);
        }

        // Add the new child to ptid
        if(rbm_tid_children[ptid] == undefined)
            rbm_tid_children[ptid] = Array();

        rbm_tid_children[ptid].push(tid);

        // Now we just have to update the parent of tid
        rbm_tid_parents[tid] = ptid;
    }

    return my;

}());
