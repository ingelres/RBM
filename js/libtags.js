var libtags = (function() {

    var my = {};


    /**
     * @return An array with all the top-level tags.
    **/
    my.jsfunc_getTopLevelTags = function()
    {
        return tags.children[0];
    }


    /**
     * Return the ID of a tag from its name.
     *
     * @param tname The name of the tag.
     *
     * @return The ID of the tag.
    **/
    my.jsfunc_getIdFromName = function(tname)
    {
        return tags.tname_to_tid[tname.toLowerCase()];
    }


    /**
     * Return the name of a tag.
     *
     * @param tid The ID of the tag.
     *
     * @return The name of the tag.
    **/
    my.jsfunc_getName = function(tid)
    {
        return tags.tid_to_tname[tid];
    }


    /**
     * Return whether a tag has subtags.
     *
     * @param tid The ID of the tag.
     *
     * @return true if the tag has subtags, false otherwise.
    **/
    my.jsfunc_hasSubTags = function(tid)
    {
        return tags.children[tid] != undefined;
    }


    /**
     * Get the subtags of a tag.
     *
     * @param tid The ID of the tag.
     *
     * @return An array with the ID of the subtags (may be empty).
    **/
    my.jsfunc_getSubTags = function(tid)
    {
        var children = tags.children[tid];

        if(children == undefined) return [];
        else                      return children;
    }


    /**
     * Get the parent of a tag.
     *
     * @param tid The ID of the tag.
     *
     * @return The ID of the parent.
    **/
    my.jsfunc_getParent = function(tid)
    {
        return tags.parents[tid];
    }


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
        while((tid = tags.parents[tid]) != undefined)
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

        while((tid = tags.parents[tid]) != undefined)
            parents.push(tid);

        return parents.reverse();
    }


    /**
     * @return A sorted array with all the tag names.
    **/
    my.jsfunc_getAllTagNames = function()
    {
        var tnames = [];

        for(var tid in tags.tid_to_tname)
            tnames.push(tags.tid_to_tname[tid]);

        return tnames.sort();
    }


    /**
     * @return The level of a tag starting from the top level (top-level is level 0)
    **/
    my.jsfunc_getLevel = function(tid)
    {
        var level = 1;

        while((tid = tags.parents[tid]) != 0)
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
        var children       = tags.children[ptid];
        var insertionPoint = 0;

        if(children != undefined)
        {
            // There's at least one child, so we know that low <= high the first time
            var tname = tags.tid_to_tname[tid].toLowerCase(), low = 0, high = children.length-1;

            while(low <= high)
            {
                var middle     = Math.floor((low + high) / 2);
                var comparison = tname.localeCompare(tags.tid_to_tname[children[middle]].toLowerCase());

                if(comparison > 0) low  = middle + 1;
                else               high = middle - 1;
            }

            if(comparison > 0) var insertionPoint = middle+1;
            else               var insertionPoint = middle;

            children.splice(insertionPoint, 0, tid);
        }
        else
            tags.children[ptid] = [tid];

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
        var oldptid     = tags.parents[tid];
        var oldchildren = tags.children[oldptid];

        if(oldchildren.length == 1) delete tags.children[oldptid];
        else                        oldchildren.splice(oldchildren.indexOf(tid), 1);

        // Update the parent of tid
        tags.parents[tid] = ptid;

        // Add the new child to ptid
        return jsfunc_addToChildren(tid, ptid);
    }


    /**
     * Rename a tag.
     *
     * @param tid   The ID of the tag to be renamed.
     * @param tname The new name of the tag.
     *
     * @return The ID of the new sibling of the tag.
    **/
    my.jsfunc_rename = function(tid, tname)
    {
        delete tags.tname_to_tid[tags.tid_to_tname[tid].toLowerCase()];

        tags.tid_to_tname[tid]                 = tname;
        tags.tname_to_tid[tname.toLowerCase()] = tid;

        // The tag has been renamed, we now need to put it at the right place in its parent's children
        var ptid     = tags.parents[tid];
        var children = tags.children[ptid];

        children.splice(children.indexOf(tid), 1);

        return jsfunc_addToChildren(tid, ptid);
    }


    /**
     * Delete a tag, taking care of subtags.
     *
     * @param tid The ID of the tag.
    **/
    my.jsfunc_delete = function(tid)
    {
        // Remove the tag from its parent's children
        var ptid     = tags.parents[tid];
        var children = tags.children[ptid];

        if(children.length == 1) delete tags.children[ptid];
        else                     children.splice(children.indexOf(tid), 1);

        // Delete the tag and its subtags
        var alltags = [tid];

        while(alltags.length != 0)
        {
            tid      = alltags.shift();
            children = tags.children[tid];

            if(children != undefined)
                alltags = alltags.concat(children);

            delete tags.tname_to_tid[tags.tid_to_tname[tid].toLowerCase()];
            delete tags.tid_to_tname[tid];
            delete tags.children[tid];
            delete tags.parents[tid];
        }
    }


    /**
     * Create a new tag.
     *
     * @param ptid  The ID of the parent tag.
     * @param tname The name of the new tag.
     *
     * @return The ID of the new sibling after which the tag has been inserted, or -1 if it's the first child of the parent.
    **/
    my.jsfunc_create = function(ptid, tname)
    {
        var tid = tags.next_tid++;

        tags.parents[tid]                      = ptid;
        tags.tid_to_tname[tid]                 = tname;
        tags.tname_to_tid[tname.toLowerCase()] = tid;

        return {tid: tid, sibling: jsfunc_addToChildren(tid, ptid)};
    }

    return my;

}());
