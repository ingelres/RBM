var libtags = (function() {

    var my = {};


    /**
     * Check whether a tag is a descendant of another tag (not necessary a direct child).
     *
     * @param tid  The ID of the potential descendant.
     * @param ptid The ID of the potential ancestor.
     *
     * @return true or false.
    **/
    my.jsfunc_tidIsDescendant = function(tid, ptid)
    {
        while((tid = rbm_tid_parents[tid]) != 0)
        {
            if(tid == ptid)
                return true;
        }

        return false;
    }


    /**
     * Return all the parents of a tag from the top level.
     *
     * @param tid The ID of the tag.
     *
     * @return The array of the parents ID.
    **/
    my.jsfunc_getParents = function(tid)
    {
        var parents = [];

        while((tid = rbm_tid_parents[tid]) != 0)
            parents.push(tid);

        return parents.reverse();
    }


    /**
     * @return An array with the name of all the tags.
     *
     * @note The array is not sorted.
    **/
    my.jsfunc_getAllTagNames = function()
    {
        var tnames = [];

        for(tid in rbm_tid_to_tname)
            tnames.push(rbm_tid_to_tname[tid]);

        return tnames;
    }


    /**
     * @return The level of a tag starting from the top level (top-level is level 1)
    **/
    my.jsfunc_getLevel = function(tid)
    {
        var level = 1;

        while((tid = rbm_tid_parents[tid]) != 0)
            ++level;

        return level;
    }


    /**
     * Add a tag to the children of another tag, keeping the list of children sorted by their name.
     *
     * @param tid  The ID of the tag.
     * @param ptid The ID of the new parent.
     *
     * @return The ID of the new sibling after which the tag has been inserted, or -1 if it's the first child of the list.
    **/
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


    /**
     * Reparent a tag.
     *
     * @param tid  The ID of the tag to reparent.
     * @param ptid The ID of the new parent.
     *
     * @return The ID of the new sibling after which the tag has been inserted, or -1 if it's the first child of the new parent.
    **/
    my.jsfunc_reparent = function(tid, ptid)
    {
        // Delete tid from its parent's children
        var oldptid     = rbm_tid_parents[tid];
        var oldchildren = rbm_tid_children[oldptid];

        if(oldchildren.length == 1) delete rbm_tid_children[oldptid];
        else                        oldchildren.splice(oldchildren.indexOf(tid), 1);

        // Update the parent of tid
        rbm_tid_parents[tid] = ptid;

        // Add the new child to ptid
        return jsfunc_addToChildren(tid, ptid);
    }

    /**
     * Rename a tag.
     *
     * @param tid   The ID of the tag to be renamed.
     * @param tname The new name of the tag.
    **/
    my.jsfunc_rename = function(tid, tname)
    {
        delete rbm_tname_to_tid[rbm_tid_to_tname[tid].toLowerCase()];

        rbm_tid_to_tname[tid]                 = tname;
        rbm_tname_to_tid[tname.toLowerCase()] = tid;
    }


    /**
     * Delete a tag, taking care of subtags.
     *
     * @param tid The ID of the tag.
    **/
    my.jsfunc_delete = function(tid)
    {
        // Delete tags from bottom to top to avoid issues while manipulating hierarchy
        var tags         = [];
        var toBeExplored = [tid];

        while(toBeExplored.length != 0)
        {
            var tid      = toBeExplored.shift();
            var children = rbm_tid_children[tid];

            tags.push(tid);

            if(children != undefined)
                toBeExplored = toBeExplored.concat(children);
        }

        tags = tags.reverse();

        for(var i=0; i<tags.length; ++i)
        {
            var tid = tags[i];

            // Delete the tag from its parent's children
            var ptid     = rbm_tid_parents[tid];
            var children = rbm_tid_children[ptid];

            if(children.length == 1) delete rbm_tid_children[ptid];
            else                     children.splice(children.indexOf(tid), 1);

            // Delete the tag itself
            delete rbm_tname_to_tid[rbm_tid_to_tname[tid]];
            delete rbm_tid_to_tname[tid];
            delete rbm_tid_children[tid];
            delete rbm_tid_parents[tid];
        }
    }

    return my;

}());
