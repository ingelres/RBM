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
        var parents = [];

        while((tid = rbm_tid_parents[tid]) != undefined)
            parents.push(tid);

        return parents.reverse();
    }

    // Return an unsorted array with all the tag names
    my.jsfunc_getAllTagNames = function()
    {
        var tnames = [];

        for(tid in rbm_tid_to_tname)
            tnames.push(rbm_tid_to_tname[tid]);

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

    // Add tid to the children of ptid, keeping the list of children sorted by tname
    // Return the new sibling after which tid has been inserted, or -1 if it's the first child
    function jsfunc_addToChildren(tid, ptid)
    {
        var children       = rbm_tid_children[ptid];
        var insertionPoint = 0;

        if(children != undefined)
        {
            // There's at least one child, so we know that low <= high the first time
            var tname = rbm_tid_to_tname[tid].toLowerCase(), low = 0, high = children.length-1;

            while(low <= high)
            {
                var middle     = Math.floor((low + high) / 2);
                var comparison = tname.localeCompare(rbm_tid_to_tname[children[middle]].toLowerCase());

                if(comparison > 0) low  = middle + 1;
                else               high = middle - 1;
            }

            if(comparison > 0) var insertionPoint = middle+1;
            else               var insertionPoint = middle;

            children.splice(insertionPoint, 0, tid);
        }
        else
            rbm_tid_children[ptid] = [tid];

        if(insertionPoint == 0) return -1;
        else                    return children[insertionPoint-1];
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
        else
            rbm_top_level_tid.splice(rbm_top_level_tid.indexOf(tid), 1);

        // Update the parent of tid
        rbm_tid_parents[tid] = ptid;

        // Add the new child to ptid
        return jsfunc_addToChildren(tid, ptid);
    }

    return my;

}());
