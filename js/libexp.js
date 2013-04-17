var libexp = (function(){

    var MAX_ITEM_LVL        =   5;
    var ANIMATION_LEN       = 200;
    var MARGIN_LEFT_PER_LVL =  20;

    var my            = {};
    var selectedTagId = -1;

    // Initialization code
    $(function(){
        var nbTopLvlItems = rbm_top_level_tid.length;

        for(var i=0; i<nbTopLvlItems; ++i)
            jsfunc_makeDNDItem(rbm_top_level_tid[i]);
    });

    // A click on an expander expands, collapse, or selects the corresponding tag
    my.jsfunc_onExpanderClick = function(tid)
    {
        var expander = $("#css-explorer-item-" + tid + "-expander");

             if(expander.hasClass("css-explorer-expand"))   jsfunc_expandTag(expander, tid, true);
        else if(expander.hasClass("css-explorer-collapse")) jsfunc_collapseTag(expander, tid, true);
        else                                                my.jsfunc_selectTag(tid);
    }

    // Expand the given tag (It is assumed that the tag has some children and is currently collapsed)
    function jsfunc_expandTag(expander, ptid, animate)
    {
        var code       = "<div id='css-explorer-item-" + ptid + "-children' style='display: none'>";
        var children   = rbm_tid_children[ptid];
        var nbChildren = children.length;
        var marginLeft = (Math.min(libtags.jsfunc_getLevel(ptid)+1, MAX_ITEM_LVL)-1) * MARGIN_LEFT_PER_LVL;

        for(var i=0; i<nbChildren; ++i)
        {
            var tid = children[i];

            code += "<div id='css-explorer-item-" + tid + "' class='css-explorer-item'><div class='css-explorer-handle'></div>";
            code += "<div id='css-explorer-item-" + tid + "-expander' onclick='libexp.jsfunc_onExpanderClick(" + tid + ")' style='margin-left:" + marginLeft + "px' ";

            if(rbm_tid_children[tid] == undefined) code += "class='css-explorer-expander'></div>";
            else                                   code += "class='css-explorer-expander css-explorer-expand'></div>";

            code += "<div onclick='libexp.jsfunc_selectTag(" + tid + ")''>" + rbm_tid_to_tname[tid] + "</div></div>";
        }

        if(animate) $(code + "</div>").insertAfter("#css-explorer-item-" + ptid).slideDown(ANIMATION_LEN);
        else        $(code + "</div>").insertAfter("#css-explorer-item-" + ptid).show();

        // We must do this outside of the above loop, for the items must be present in the DOM when calling the function
        for(var i=0; i<nbChildren; ++i)
            jsfunc_makeDNDItem(children[i]);

        expander.removeClass("css-explorer-expand").addClass("css-explorer-collapse");
    }

    // Collapse the given tag (it is assumed that the tag is currently expanded)
    function jsfunc_collapseTag(expander, ptid, animate)
    {
        // Destroy all draggable/droppable descendants (not only the direct children) before removing the container
        $("#css-explorer-item-" + ptid + "-children").find(".css-explorer-item").draggable("destroy").droppable("destroy");

        if(animate) $("#css-explorer-item-" + ptid + "-children").slideUp(ANIMATION_LEN, function(){ $("#css-explorer-item-" + ptid + "-children").remove() });
        else        $("#css-explorer-item-" + ptid + "-children").remove();

        // Clear selection if it's a descendant of the item we're collapsing
        if(libtags.jsfunc_tidIsDescendant(selectedTagId, ptid))
            my.jsfunc_selectTag(-1);

        expander.removeClass("css-explorer-collapse").addClass("css-explorer-expand");
    }

    // Expand ALL tags with children (not just the top-level tags)
    my.jsfunc_expandAll = function()
    {
        while($(".css-explorer-expand").trigger("click").length != 0);
    }

    // Collapse all top-level tags (this is enough to collapse the whole tree, no matter how deep it is expanded)
    my.jsfunc_collapseAll = function()
    {
        var nbTopLvlItems = rbm_top_level_tid.length;

        for(var i=0; i<nbTopLvlItems; ++i)
            $("#css-explorer-item-" + rbm_top_level_tid[i] + "-expander.css-explorer-collapse").trigger("click");
    }

    // Make tid a child of ptid: Update the GUI as well as the internal structures
    my.jsfunc_reparent = function(tid, ptid)
    {
        // If that's the only child of its current parent, remove the expand/collapse icon of that parent
        var oldptid = rbm_tid_parents[tid];

        if(oldptid != undefined && rbm_tid_children[oldptid].length == 1)
            $("#css-explorer-item-" + oldptid + "-expander").removeClass("css-explorer-expand").removeClass("css-explorer-collapse");

        // Reparent the tag
        var levelBefore = libtags.jsfunc_getLevel(tid);
        var newSibling  = libtags.jsfunc_reparent(tid, ptid);

        // If the new parent is already expanded, just move things around in the DOM
        var expander = $("#css-explorer-item-" + ptid + "-expander");

        if(expander.hasClass("css-explorer-collapse"))
        {
            var item       = $("#css-explorer-item-" + tid).css("top", "");
            var levelAfter = libtags.jsfunc_getLevel(tid);

            // First move the item
                 if(newSibling == -1)                                                item.prependTo("#css-explorer-item-" + ptid + "-children");
            else if($("#css-explorer-item-" + newSibling + "-children").length != 0) item.insertAfter("#css-explorer-item-" + newSibling + "-children");
            else                                                                     item.insertAfter("#css-explorer-item-" + newSibling);

            // Then move the children (if any)
            item.after($("#css-explorer-item-" + tid + "-children"));

            // Here comes the pain... We have to adjust all levels
            if(levelAfter != levelBefore)
            {
                $("#css-explorer-item-" + tid + "-expander").css("margin-left", (levelAfter-1) * MARGIN_LEFT_PER_LVL);

                // Now do it for all displayed children
                var subItems   = $("#css-explorer-item-" + tid + "-children").find(".css-explorer-expander");
                var nbSubItems = subItems.length;
                var marginDiff = (levelAfter - levelBefore) * MARGIN_LEFT_PER_LVL;

                for(var i=0; i<nbSubItems; ++i)
                {
                    var subItem = $(subItems[i]);

                    subItem.css("margin-left", parseInt(subItem.css("margin-left")) + marginDiff);
                }
            }
        }
        else
        {
            expander.addClass("css-explorer-expand");

            // Remove the dragged element and all its descendants (if any)
            $("#css-explorer-item-" + tid + "-children").find(".css-explorer-item").draggable("destroy").droppable("destroy");
            $("#css-explorer-item-" + tid + "-children").remove();
            $("#css-explorer-item-" + tid).draggable("destroy").droppable("destroy").remove();

            // Clear selection if needed
            if(tid == selectedTagId || libtags.jsfunc_tidIsDescendant(selectedTagId, tid))
                my.jsfunc_selectTag(-1);
        }
    }

    // Make the given item a drag'n'drop item
    function jsfunc_makeDNDItem(tid)
    {
        var item = "#css-explorer-item-" + tid;

        $(item).draggable({
            axis: "y",
            zIndex: 100,
            opacity: 0.75,
            revert: "invalid",
            handle: ".css-explorer-handle",
            containment: "#css-explorer",
        }).data("tid", tid);

        $(item).droppable({
            tolerance: "pointer",
            hoverClass: "css-explorer-droppable",
            accept: function(drg){ return !libtags.jsfunc_tidIsDescendant(tid, drg.data("tid")) && rbm_tid_parents[drg.data("tid")] != tid},
            drop: function(evt, ui){libexp.jsfunc_reparent($(ui.draggable).data("tid"), tid)},
        });
    }

    // Select the given tag
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

    // Ensure the given tag is visible, expand its parent if needed, and select it
    my.jsfunc_scrollToTag = function(tname)
    {
        var tid = rbm_tname_to_tid[tname.toLowerCase()];

        if(tid != undefined)
        {
            // Go through the hierarchy of tags and open the collapsed ones
            var parents   = libtags.jsfunc_getParents(tid);
            var nbParents = parents.length;

            for(var i=0; i<nbParents; ++i)
            {
                var ptid     = parents[i];
                var expander = $("#css-explorer-item-" + ptid + "-expander");

                if(expander.hasClass("css-explorer-expand"))
                    jsfunc_expandTag(expander, ptid, i+1, true);
            }

            // TODO Scroll to the tag

            // Now that the hierarchy has been expanded, the item exists and can be selected
            my.jsfunc_selectTag(tid);
        }
    }

    return my;

}());
