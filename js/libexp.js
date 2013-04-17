var libexp = (function(){

    var MAX_ITEM_LVL        =   5;
    var ANIMATION_LEN       = 200;
    var MARGIN_LEFT_PER_LVL =  20;

    var my            = {};
    var selectedTagId = -1;


    /**
     * Initialization code.
    **/
    $(function(){
        var nbTopLvlItems = rbm_top_level_tid.length;

        for(var i=0; i<nbTopLvlItems; ++i)
            jsfunc_makeDNDItem(rbm_top_level_tid[i]);
    });


    /**
     * Handler for clicks on expander elements. It will:
     *  - Expand the tag if it has children and is currently collapsed.
     *  - Collapse the tag if it has children and is currently expanded.
     *  - Select the tag if it has no children (this avoids a deadzone over expanders).
     *
     * @param tid The ID of the tag the expander is associated with.
    **/
    my.jsfunc_onExpanderClick = function(tid)
    {
        var expander = $("#css-explorer-expander-" + tid);

             if(expander.hasClass("css-explorer-expand"))   jsfunc_expandTag(tid, expander);
        else if(expander.hasClass("css-explorer-collapse")) jsfunc_collapseTag(tid, expander);
        else                                                my.jsfunc_selectTag(tid);
    }


    /**
     * Expand a tag. It is assumed (i.e., not checked) that the tag actually has children and is currently collapsed.
     *
     * @param ptid     The ID of the tag.
     * @param expander The JQuery object holding the expander associated to the tag.
    **/
    function jsfunc_expandTag(ptid, expander)
    {
        var code       = "<div id='css-explorer-children-" + ptid + "' style='display: none'>";
        var children   = rbm_tid_children[ptid];
        var nbChildren = children.length;
        var marginLeft = (Math.min(libtags.jsfunc_getLevel(ptid)+1, MAX_ITEM_LVL)-1) * MARGIN_LEFT_PER_LVL;

        // Create the code and insert it at once, this is faster than inserting many small bits of code
        for(var i=0; i<nbChildren; ++i)
        {
            var tid = children[i];

            code += "<div id='css-explorer-item-" + tid + "' class='css-explorer-item'>";
            code += "<div class='css-explorer-handle'></div>";
            code += "<div id='css-explorer-expander-" + tid + "' onclick='libexp.jsfunc_onExpanderClick(" + tid + ")' style='margin-left:" + marginLeft + "px' ";

            if(rbm_tid_children[tid] == undefined) code += "class='css-explorer-expander'></div>";
            else                                   code += "class='css-explorer-expander css-explorer-expand'></div>";

            code += "<div onclick='libexp.jsfunc_selectTag(" + tid + ")'>" + rbm_tid_to_tname[tid] + "</div></div>";
        }

        $(code + "</div>").insertAfter("#css-explorer-item-" + ptid).slideDown(ANIMATION_LEN);

        // We must do this outside of the above loop, for the items must be present in the DOM when calling the function
        for(var i=0; i<nbChildren; ++i)
            jsfunc_makeDNDItem(children[i]);

        // Expand -> collapse
        expander.removeClass("css-explorer-expand").addClass("css-explorer-collapse");
    }


    /**
     * Collapse a tag. It is assumed (i.e., not checked) that the tag actually has children and is currently expanded.
     *
     * @param ptid     The ID of the tag.
     * @param expander The JQuery object holding the expander associated to the tag.
    **/
    function jsfunc_collapseTag(ptid, expander)
    {
        // Destroy all draggable/droppable descendants (not only the direct children) before removing the container
        var children = $("#css-explorer-children-" + ptid);

        children.find(".css-explorer-item").draggable("destroy").droppable("destroy");
        children.slideUp(ANIMATION_LEN, function(){ $(this).remove() });

        // Clear selection if it's a descendant of the item we're collapsing
        if(libtags.jsfunc_tidIsDescendant(selectedTagId, ptid))
            my.jsfunc_selectTag(-1);

        // Collapse -> expand
        expander.removeClass("css-explorer-collapse").addClass("css-explorer-expand");
    }


    /**
     * Recursively expand all tags.
    **/
    my.jsfunc_expandAll = function()
    {
        while($(".css-explorer-expand").trigger("click").length != 0);
    }


    /**
     * Collapse all tags.
    **/
    my.jsfunc_collapseAll = function()
    {
        var nbTopLvlItems = rbm_top_level_tid.length;

        for(var i=0; i<nbTopLvlItems; ++i)
            $("#css-explorer-expander-" + rbm_top_level_tid[i] + ".css-explorer-collapse").trigger("click");
    }


    /**
     * Reparent a tag. This function will:
     *  - Update the GUI to reflect the change.
     *  - Update internal JavaScript structures.
     *  - Make AJAX request to update server-side structures.
     *
     * @param tid  The ID of the tag to reparent.
     * @param ptid The ID of the new parent.
    **/
    my.jsfunc_reparent = function(tid, ptid)
    {
        // Update the current parent (if any) by removing the expand/collapse icon if it has no more child after the reparenting
        var oldptid = rbm_tid_parents[tid];

        if(oldptid != undefined && rbm_tid_children[oldptid].length == 1)
            $("#css-explorer-expander-" + oldptid).removeClass("css-explorer-expand").removeClass("css-explorer-collapse");

        // Reparent the tag internally
        var lvlBefore  = libtags.jsfunc_getLevel(tid);
        var newSibling = libtags.jsfunc_reparent(tid, ptid);

        // Update the GUI
        var expander = $("#css-explorer-expander-" + ptid);

        if(expander.hasClass("css-explorer-collapse"))
        {
            // The new parent is already expanded, so we just move things around in the DOM
            var item     = $("#css-explorer-item-" + tid).css("top", "");
            var lvlAfter = libtags.jsfunc_getLevel(tid);

                 if(newSibling == -1)                                      item.prependTo("#css-explorer-children-" + ptid);
            else if($("#css-explorer-children-" + newSibling).length != 0) item.insertAfter("#css-explorer-children-" + newSibling);
            else                                                           item.insertAfter("#css-explorer-item-" + newSibling);

            item.after($("#css-explorer-children-" + tid));

            // Here comes the pain... We have to adjust all levels to reflect the new hierarchy
            if(lvlAfter != lvlBefore)
            {
                $("#css-explorer-expander-" + tid).css("margin-left", (lvlAfter-1) * MARGIN_LEFT_PER_LVL);

                // Now do it for all displayed children
                var subItems   = $("#css-explorer-children-" + tid).find(".css-explorer-expander");
                var nbSubItems = subItems.length;
                var marginDiff = (lvlAfter - lvlBefore) * MARGIN_LEFT_PER_LVL;

                for(var i=0; i<nbSubItems; ++i)
                {
                    var subItem = $(subItems[i]);

                    subItem.css("margin-left", parseInt(subItem.css("margin-left")) + marginDiff);
                }
            }
        }
        else
        {
            // The new parent is collapsed (or has no children at all), so we remove the item and its children from the DOM
            expander.addClass("css-explorer-expand");

            $("#css-explorer-children-" + tid).find(".css-explorer-item").draggable("destroy").droppable("destroy");
            $("#css-explorer-children-" + tid).remove();
            $("#css-explorer-item-" + tid).draggable("destroy").droppable("destroy").remove();

            // Clear selection if needed
            if(tid == selectedTagId || libtags.jsfunc_tidIsDescendant(selectedTagId, tid))
                my.jsfunc_selectTag(-1);
        }
    }


    /**
     * Enable drag'n'drop on a tag.
     *
     * @param tid The ID of the tag.
    **/
    function jsfunc_makeDNDItem(tid)
    {
        var item = $("#css-explorer-item-" + tid);

        item.data("tid", tid);

        item.draggable({
            axis: "y",
            zIndex: 100,
            opacity: 0.75,
            revert: "invalid",
            handle: ".css-explorer-handle",
            containment: "#css-explorer",
        });

        item.droppable({
            tolerance: "pointer",
            hoverClass: "css-explorer-droppable",
            accept: function(drg){ return !libtags.jsfunc_tidIsDescendant(tid, drg.data("tid")) && rbm_tid_parents[drg.data("tid")] != tid},
            drop: function(evt, ui){libexp.jsfunc_reparent($(ui.draggable).data("tid"), tid)},
        });
    }


    /**
     * Select a tag. The tag must exist in the DOM. This function will:
     *  - Reflect the fact that the tag is selected.
     *  - Load the associated bookmarks.
     *
     * @param tid The ID of the tag.
    **/
    my.jsfunc_selectTag = function(tid)
    {
        // Clicking on the selected item should do nothing
        if(tid != selectedTagId)
        {
            $("#css-explorer-item-" + selectedTagId).removeClass("css-explorer-item-selected", ANIMATION_LEN);

            if(tid == -1)
            {
                // TODO Should remove the things that depend on the selected tag (e.g., bookmarks)
            }
            else
            {
                $("#css-explorer-item-" + tid).addClass("css-explorer-item-selected", ANIMATION_LEN);

                // TODO Make an AJAX request to get the associated bookmarks
            }

            selectedTagId = tid;
        }
    }


    /**
     * Select a tag even if it doesn't exist yet in the DOM (as opposed to jsfunc_selectTag). This function will:
     *  - Open all the parents of the tag.
     *  - Scroll to the tag.
     *  - Select the tag.
     *
     * @param tname The name of the tag.
    **/
    my.jsfunc_showAndSelectTag = function(tname)
    {
        var tid = rbm_tname_to_tid[tname.toLowerCase()];

        if(tid != undefined)
        {
            // Go through the parents of the tags and open the collapsed ones
            var parents   = libtags.jsfunc_getParents(tid);
            var nbParents = parents.length;

            for(var i=0; i<nbParents; ++i)
            {
                var ptid     = parents[i];
                var expander = $("#css-explorer-expander-" + ptid);

                if(expander.hasClass("css-explorer-expand"))
                    jsfunc_expandTag(ptid, expander);
            }

            // TODO Scroll to the tag

            // Now that the hierarchy has been expanded, the item exists and can be selected
            my.jsfunc_selectTag(tid);
        }
    }

    return my;

}());
