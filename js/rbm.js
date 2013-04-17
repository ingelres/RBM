var rbm_consts = {
    EXPLORER_MAX_LVL:               5,
    EXPLORER_ANIM_LEN:            200,
    EXPLORER_MARGIN_LEFT_PER_LVL:  20,
}

var rbm_globals = {
    selectedTagId: -1,
}

function jsfunc_onExplorerExpander(expander, tid)
{
    // When the item has no child (neither expandable nor collapsable) the default behavior is to select the item to avoid a deadzone for clicks
         if(expander.hasClass("css-explorer-expand"))   jsfunc_explorerExpandTag(expander, tid, true);
    else if(expander.hasClass("css-explorer-collapse")) jsfunc_explorerCollapseTag(expander, tid, true);
    else                                                jsfunc_explorerSelectTag(tid);
}

function jsfunc_explorerExpandTag(expander, ptid, animate)
{
    var code       = "<div id='css-explorer-item-" + ptid + "-children' style='display: none'>";
    var children   = rbm_tid_children[ptid];
    var nbChildren = children.length;
    var marginLeft = (Math.min(libtags.jsfunc_getLevel(ptid)+1, rbm_consts.EXPLORER_MAX_LVL)-1) * rbm_consts.EXPLORER_MARGIN_LEFT_PER_LVL;

    for(var i=0; i<nbChildren; ++i)
    {
        var tid = children[i];

        code += "<div id='css-explorer-item-" + tid + "' class='css-explorer-item'><div class='css-explorer-handle'></div>";
        code += "<div id='css-explorer-item-" + tid + "-expander' onclick='jsfunc_onExplorerExpander($(this), " + tid + ")' style='margin-left:" + marginLeft + "px' ";

        if(rbm_tid_children[tid] == undefined) code += "class='css-explorer-expander'></div>";
        else                                   code += "class='css-explorer-expander css-explorer-expand'></div>";

        code += "<div onclick='jsfunc_explorerSelectTag(" + tid + ")''>" + rbm_tid_to_tname[tid] + "</div></div>";
    }

    if(animate) $(code + "</div>").insertAfter("#css-explorer-item-" + ptid).slideDown(rbm_consts.EXPLORER_ANIM_LEN);
    else        $(code + "</div>").insertAfter("#css-explorer-item-" + ptid).show();

    // We must do this outside of the above loop, for the items must be present in the DOM when calling the function
    for(var i=0; i<nbChildren; ++i)
        jsfunc_explorerEnableItemDND(children[i]);

    expander.removeClass("css-explorer-expand").addClass("css-explorer-collapse");
}

function jsfunc_explorerCollapseTag(expander, ptid, animate)
{
    // Destroy all draggable/droppable descendants (not only the direct children) before removing the container
    $("#css-explorer-item-" + ptid + "-children .css-explorer-item").draggable("destroy").droppable("destroy");

    if(animate) $("#css-explorer-item-" + ptid + "-children").slideUp(rbm_consts.EXPLORER_ANIM_LEN, function(){ $("#css-explorer-item-" + ptid + "-children").remove() });
    else        $("#css-explorer-item-" + ptid + "-children").remove();

    // Clear selection if it's a descendant of the item we're collapsing
    if(libtags.jsfunc_tidIsDescendant(rbm_globals.selectedTagId, ptid))
        jsfunc_explorerSelectTag(-1);

    expander.removeClass("css-explorer-collapse").addClass("css-explorer-expand");
}

function jsfunc_explorerExpandAll()
{
    // Loop until there's no more expandable element
    while($(".css-explorer-expand").trigger("click").length != 0);
}

function jsfunc_explorerCollapseAll()
{
    // Collapse all top-level tags
    var nbTopLvlItems = rbm_top_level_tid.length;

    for(var i=0; i<nbTopLvlItems; ++i)
        $("#css-explorer-item-" + rbm_top_level_tid[i] + "-expander.css-explorer-collapse").trigger("click");
}

function jsfunc_explorerReparent(tid, ptid)
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

        // Move the item
             if(newSibling == -1)                                                item.prependTo("#css-explorer-item-" + ptid + "-children");
        else if($("#css-explorer-item-" + newSibling + "-children").length != 0) item.insertAfter("#css-explorer-item-" + newSibling + "-children");
        else                                                                     item.insertAfter("#css-explorer-item-" + newSibling);

        // Move the children (if any)
        item.after($("#css-explorer-item-" + tid + "-children"));

        // Here comes the pain... We have to adjust all levels
        // Maybe we could find an easier way to manage levels...
        if(levelAfter != levelBefore)
        {
            $("#css-explorer-item-" + tid + "-expander").css("margin-left", (levelAfter-1) * rbm_consts.EXPLORER_MARGIN_LEFT_PER_LVL);

            // Now do it for all displayed children
            var levelDiff = levelAfter - levelBefore;

            $.each($(".css-explorer-expander", "#css-explorer-item-" + tid + "-children"), function(idx, elt){
                $(elt).css("margin-left", parseInt($(elt).css("margin-left")) + levelDiff * rbm_consts.EXPLORER_MARGIN_LEFT_PER_LVL);
            });
        }
    }
    else
    {
        expander.addClass("css-explorer-expand");

        // Remove the dragged element and all its descendants (if any)
        $(".css-explorer-item", "#css-explorer-item-" + tid + "-children").draggable("destroy").droppable("destroy");
        $("#css-explorer-item-" + tid + "-children").remove();
        $("#css-explorer-item-" + tid).draggable("destroy").droppable("destroy").remove();

        // Clear selection if needed
        if(tid == rbm_globals.selectedTagId || libtags.jsfunc_tidIsDescendant(rbm_globals.selectedTagId, tid))
            jsfunc_explorerSelectTag(-1);
    }
}

function jsfunc_explorerEnableItemDND(tid)
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
        drop: function(evt, ui){jsfunc_explorerReparent($(ui.draggable).data("tid"), tid)},
    });
}

function jsfunc_explorerSelectTag(tid)
{
    // Clicking on the selected item should do nothing
    if(tid != rbm_globals.selectedTagId)
    {
        $("#css-explorer-item-" + rbm_globals.selectedTagId).removeClass("css-explorer-item-selected", rbm_consts.EXPLORER_ANIM_LEN);

        if(tid == -1)
        {
            // TODO Should remove the things that depend on the selected tag (e.g., bookmarks)
        }
        else
        {
            $("#css-explorer-item-" + tid).addClass("css-explorer-item-selected", rbm_consts.EXPLORER_ANIM_LEN);

            // TODO Make an AJAX request to get the associated bookmarks
        }

        rbm_globals.selectedTagId = tid;
    }
}

function jsfunc_explorerScrollToTag(tname)
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
                jsfunc_explorerExpandTag(expander, ptid, i+1, true);
        }

        // TODO Scroll to the tag

        // Now that the hierarchy has been expanded, the item exists and can be selected
        jsfunc_explorerSelectTag(tid);
    }
}

$(document).ready(function(){

    var nbTopLvlItems = rbm_top_level_tid.length;

    for(var i=0; i<nbTopLvlItems; ++i)
        jsfunc_explorerEnableItemDND(rbm_top_level_tid[i]);

    // Make the search-by-tag box an autocomplete widget
    var searchByTag = $("#css-search-by-tag");

    searchByTag.autocomplete({source: libtags.jsfunc_getAllTagNames(), delay: 0});

    searchByTag.keyup(function(event){
        if(event.keyCode == 13){
            jsfunc_explorerScrollToTag($("#css-search-by-tag").autocomplete("close").val());
        }
    });

    // Default settings for AJAX requests
    $.ajaxSetup({
        url:   "ajax/ajax.php",
        type:  "GET",
        cache: false,
    });
});
