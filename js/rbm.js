var rbm_consts = {
    EXPLORER_MAX_LVL:    5,
    EXPLORER_ANIM_LEN: 200,
}

var rbm_globals = {
    selectedTagId: -1,
}

function jsfunc_onExplorerExpander(expander, tid, lvl)
{
    // When the item has no child (neither expandable nor collapsable) the default behavior is to select the item to avoid a deadzone for clicks
         if(expander.hasClass("css-explorer-expand"))   jsfunc_explorerExpandTag(expander, tid, lvl, true);
    else if(expander.hasClass("css-explorer-collapse")) jsfunc_explorerCollapseTag(expander, tid, lvl, true);
    else                                                jsfunc_explorerSelectTag(tid);
}

function jsfunc_explorerExpandTag(expander, ptid, lvl, animate)
{
    var childLvl = Math.min(lvl+1, rbm_consts.EXPLORER_MAX_LVL);
    var children = "<div id='css-explorer-item-" + ptid + "-children' style='display: none'>";

    $.each(rbm_tid_children[ptid], function(idx, tid){

        children += "<div id='css-explorer-item-" + tid + "' class='css-explorer-item'><div class='css-explorer-handle'></div>";
        children += "<div id='css-explorer-item-" + tid + "-expander' onclick='jsfunc_onExplorerExpander($(this), " + tid + ", " + childLvl + ")' ";

        if(rbm_tid_children[tid] == undefined) children += "class='css-explorer-expander-level-" + childLvl + "'></div>";
        else                                   children += "class='css-explorer-expander-level-" + childLvl + " css-explorer-expand'></div>";

        children += "<div onclick='jsfunc_explorerSelectTag(" + tid + ")''>" + rbm_tid_to_tname[tid] + "</div></div>";
    });

    if(animate) $(children + "</div>").insertAfter("#css-explorer-item-" + ptid).slideDown(rbm_consts.EXPLORER_ANIM_LEN);
    else        $(children + "</div>").insertAfter("#css-explorer-item-" + ptid).show();

    // We must do this outside of the above loop, for the items must be present in the DOM when calling the function
    $.each(rbm_tid_children[ptid], function(idx, tid){
        jsfunc_explorerEnableItemDND(tid, childLvl);
    });

    expander.removeClass("css-explorer-expand").addClass("css-explorer-collapse");
}

function jsfunc_explorerCollapseTag(expander, ptid, lvl, animate)
{
    // Destroy all draggable/droppable descendants (not only the direct children) before removing the container
    $("#css-explorer-item-" + ptid + "-children .css-explorer-item").draggable("destroy").droppable("destroy");

    if(animate) $("#css-explorer-item-" + ptid + "-children").slideUp(rbm_consts.EXPLORER_ANIM_LEN, function(){ this.remove() });
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
    // Collapse all tags at level 1: That's sufficient to collapse everything no matter how deep the tree is opened
    $(".css-explorer-expander-level-1.css-explorer-collapse").trigger("click");
}

function jsfunc_explorerReparent(tid, ptid)
{
    // Remove the dragged element and all its descendants (if any)
    $("#css-explorer-item-" + tid + "-children .css-explorer-item").draggable("destroy").droppable("destroy");
    $("#css-explorer-item-" + tid + "-children").remove();
    $("#css-explorer-item-" + tid).draggable("destroy").droppable("destroy").remove();

    // If that's the only child of its current parent, remove the expand/collapse icon
    var oldptid = rbm_tid_parents[tid];

    if(oldptid != undefined && rbm_tid_children[oldptid].length == 1)
        $("#css-explorer-item-" + oldptid + "-expander").removeClass("css-explorer-expand").removeClass("css-explorer-collapse");

    // Reparent the tag
    libtags.jsfunc_reparent(tid, ptid);

    // If the new parent already had children and is expanded, the easiest is to close it and reopen it immediately
    var expander = $("#css-explorer-item-" + ptid + "-expander");

    if(expander.hasClass("css-explorer-collapse"))
    {
        var level         = libtags.jsfunc_getLevel(ptid);
        var oldSelectedId = rbm_globals.selectedTagId;

        jsfunc_explorerCollapseTag(expander, ptid, level, false);
        jsfunc_explorerExpandTag(expander, ptid, level, false);

        if(oldSelectedId == tid)
        {
            rbm_globals.selectedTagId = oldSelectedId;
            $("#css-explorer-item-" + tid).addClass("css-explorer-item-selected");
        }
    }
    else
    {
        expander.addClass("css-explorer-expand");

        if(rbm_globals.selectedTagId == tid)
            jsfunc_explorerSelectTag(-1);
    }
}

function jsfunc_explorerEnableItemDND(tid, level)
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
        $.each(libtags.jsfunc_getParents(tid), function(idx, val){
            var expander = $("#css-explorer-item-" + val + "-expander");

            if(expander.hasClass("css-explorer-expand"))
                jsfunc_explorerExpandTag(expander, val, idx+1, true);
        });

        // TODO Scroll to the tag

        // Now that the hierarchy has been expanded, the item exists and can be selected
        jsfunc_explorerSelectTag(tid);
    }
}

$(document).ready(function(){

    $.each(rbm_top_level_tid, function(idx, val){
        jsfunc_explorerEnableItemDND(val, 1);
    });

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
