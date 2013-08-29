var libtags = (function() {

    var my = {};


    /**
     * Delete a specific tid from the array associated to a given key in an object.
     *
     * For example:
     *    OBJECT : {
     *        KEY_1: [tid1, tid2, tid3],
     *        KEY_2: [tid1, tid2, tid3],
     *    }
     *
     * Calling deleteTidFromObjectArray(OBJECT, KEY_2, tid1) will result in:
     *
     *    OBJECT : {
     *        KEY_1: [tid1, tid2, tid3],
     *        KEY_2: [tid2, tid3],
     *    }
     *
     * If tid is the only element in the array associated to the key, the key is completely unset.
     *
     * @param object The object holding the mapping key -> array.
     * @param key    The key.
     * @param tid    The tid to delete.
    **/
    function deleteTidFromObjectArray(object, key, tid)
    {
        var array = object[key];
        var index = array.indexOf(tid);

        if(index != -1)
        {
            if(array.length == 1) delete object[key];
            else                  array.splice(index, 1);
        }
    }


    /**
    * Add a tag to the children of another tag, keeping the list of children sorted by their name.
    *
    * @param tid  The ID of the tag.
    * @param ptid The ID of the new parent.
    *
    * @return The ID of the new sibling after which the tag has been inserted, or -1 if it's the first child of the list.
    **/
    function addToChildren(tid, ptid)
    {
        var children    = tags.children[ptid];
        var insertPoint = 0;

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

            if(comparison > 0) var insertPoint = middle+1;
            else               var insertPoint = middle;

            children.splice(insertPoint, 0, tid);
        }
        else
            tags.children[ptid] = [tid];

        if(insertPoint == 0) return -1;
        else                 return children[insertPoint-1];
    }


    /**
     * @return An array containing the top-level tags (children of the root tag).
    **/
    my.getTopLevelTags = function()
    {
        return tags.children[0];
    }


    /**
     * Return an array of all the tid matching a given name.
     *
     * @param tname The tag name.
     *
     * @return An array of tid.
    **/
    my.getIdFromName = function(tname)
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
    my.getName = function(tid)
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
    my.hasSubTags = function(tid)
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
    my.getSubTags = function(tid)
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
    my.getParent = function(tid)
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
    my.tidIsDescendant = function(tid, ptid)
    {
        while((tid = tags.parents[tid]) != undefined)
        {
            if(tid == ptid)
                return true;
        }

        return false;
    }


    /**
     * Return all the parents of a tag from the top level (including the root tag).
     *
     * @param tid The ID of the tag.
     *
     * @return The array of the parents ID.
    **/
    my.getParents = function(tid)
    {
        var parents = [];

        while((tid = tags.parents[tid]) != undefined)
            parents.push(tid);

        return parents.reverse();
    }


    /**
     * @return A sorted array with all the tag names.
    **/
    my.getAllTagNames = function()
    {
        var tnames = [];

        for(var tid in tags.tid_to_tname)
            tnames.push(tags.tid_to_tname[tid]);

        return tnames.sort();
    }


    /**
     * @return The level of a tag starting from the top level (root tag has level 0)
    **/
    my.getLevel = function(tid)
    {
        var level = 1;

        while((tid = tags.parents[tid]) != 0)
            ++level;

        return level;
    }


    /**
     * Reparent a tag.
     *
     * @param tid  The ID of the tag to reparent.
     * @param ptid The ID of the new parent.
     *
     * @return The ID of the new sibling after which the tag has been inserted, or -1 if it's the first child of the new parent.
    **/
    my.reparent = function(tid, ptid)
    {
        // Delete tid from its parent's children
        deleteTidFromObjectArray(tags.children, tags.parents[tid], tid);

        // Update the parent of tid
        tags.parents[tid] = ptid;

        // Add the new child to ptid
        return addToChildren(tid, ptid);
    }


    /**
     * Delete a tag, taking care of subtags.
     *
     * @param tid The ID of the tag.
    **/
    my.delete = function(tid)
    {
        // Remove the tag from its parent's children
        deleteTidFromObjectArray(tags.children, tags.parents[tid], tid);

        // Delete the tag and its subtags
        var alltags = [tid];

        while(alltags.length != 0)
        {
            tid      = alltags.shift();
            children = tags.children[tid];

            if(children != undefined)
                alltags = alltags.concat(children);

            deleteTidFromObjectArray(tags.tname_to_tid, tags.tid_to_tname[tid].toLowerCase(), tid);

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
    my.create = function(ptid, tname)
    {
        var tid = tags.next_tid++;

        tags.parents[tid]                      = ptid;
        tags.tid_to_tname[tid]                 = tname;

        if(tags.tname_to_tid[tname.toLowerCase()] == undefined) tags.tname_to_tid[tname.toLowerCase()] = [tid];
        else                                                    tags.tname_to_tid[tname.toLowerCase()].push(tid);

        return {tid: tid, sibling: addToChildren(tid, ptid)};
    }


    /**
    * Rename a tag.
    *
    * @param tid   The ID of the tag to be renamed.
    * @param tname The new name of the tag.
    *
    * @return The ID of the new sibling of the tag.
    **/
    my.rename = function(tid, tname)
    {
        deleteTidFromObjectArray(tags.tname_to_tid, tags.tid_to_tname[tid].toLowerCase(), tid);

        tags.tid_to_tname[tid] = tname;

        if(tags.tname_to_tid[tname.toLowerCase()] == undefined) tags.tname_to_tid[tname.toLowerCase()] = [tid];
        else                                                    tags.tname_to_tid[tname.toLowerCase()].push(tid);

        // The tag has been renamed, we now need to put it at the right place in its parent's children
        var ptid = tags.parents[tid];

        deleteTidFromObjectArray(tags.children, ptid, tid);

        return addToChildren(tid, ptid);
    }

    return my;

}());
