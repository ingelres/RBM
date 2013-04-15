var rbm_consts = {
    EXPLORER_MAX_LVL:    5,
    EXPLORER_ANIM_LEN: 200,
}

var rbm_globals = {
    selectedTagId: -1,
}

function jsfunc_explorerToggleTag(ptid, lvl)
{
    var itemName = "css-explorer-item-" + ptid;
    var expander = $("#" + itemName + "-expander");

    if(expander.hasClass("css-explorer-expand"))
    {
        var childLvl = Math.min(lvl+1, rbm_consts.EXPLORER_MAX_LVL);
        var children = "<div id='" + itemName + "-children' style='display: none'>";

        $.each(rbm_tid_children[ptid], function(idx, tid){

            children += "<div id='css-explorer-item-" + tid + "' class='css-explorer-item'>";
            children += "<div class='css-explorer-handle'></div>";
            children += "<div id='css-explorer-item-" + tid + "-expander' class='css-explorer-expander-level-" + childLvl;

            if(rbm_tid_children[tid] == undefined)
            {
                // When an item has no child, use the selectTag code to avoid a dead zone (clicking on the expander placeholder would have no effect otherwise)
                children += "' onclick='jsfunc_explorerSelectTag(" + tid + ")'>";
            }
            else
                children += " css-explorer-expand' onclick='jsfunc_explorerToggleTag(" + tid + ", " + childLvl + ")'>";

            children += "</div><div onclick='jsfunc_explorerSelectTag(" + tid + ")''>" + rbm_tid_to_tname[tid] + "</div></div>";
        });

        $(children).insertAfter("#" + itemName).slideDown(rbm_consts.EXPLORER_ANIM_LEN);

        // We must do this outside of the above loop, for the items must be present in the DOM when calling the function
        $.each(rbm_tid_children[ptid], function(idx, tid){
            jsfunc_explorerEnableItemDND(tid);
        });
    }
    else
    {
        // Destroy all draggable/droppable descendants (not only the direct children)
        $("#" + itemName + "-children .css-explorer-item").draggable("destroy").droppable("destroy");

        // Remove the container once the animation over
        $("#" + itemName + "-children").slideUp(rbm_consts.EXPLORER_ANIM_LEN, function(){ this.remove() });

        // Clear selection if it's a descendant of the item we're collapsing
        if(libtags.jsfunc_tidIsDescendant(rbm_globals.selectedTagId, ptid))
            jsfunc_explorerSelectTag(-1);
    }

    // Expand <-> Collapse
    expander.toggleClass("css-explorer-expand css-explorer-collapse");
}

function jsfunc_explorerCollapseAll()
{
    // Collapse all tags at level 1: That's sufficient to collapse everything no matter how deep the tree is opened
    $(".css-explorer-expander-level-1.css-explorer-collapse").trigger("click");
}

function jsfunc_explorerExpandAll()
{
    // Loop until there's no more expandable element
    while($(".css-explorer-expand").trigger("click").length != 0);
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
    });

    $(item).droppable({
        tolerance: "pointer",
        hoverClass: "css-explorer-droppable",
        accept: function(elt){ return $(item).parents("#" + elt.attr("id") + "-children").length == 0 },
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
    var tid = rbm_tname_to_tid[tname];

    if(tid != undefined)
    {
        // Go through the hierarchy of tags and open the collapsed ones
        $.each(libtags.jsfunc_getParents(tid), function(idx, val){
            if($("#css-explorer-item-" + val + "-expander").hasClass("css-explorer-expand"))
                jsfunc_explorerToggleTag(val, idx+1);
        });

        // TODO Scroll to the tag

        // Now that the hierarchy has been expanded, the item exists and can be selected
        jsfunc_explorerSelectTag(tid);
    }
}

$(document).ready(function(){

    $.each(rbm_top_level_tid, function(idx, val){
        jsfunc_explorerEnableItemDND(val);
    });

/*
    $("#css-search-by-tag").autocomplete({source: Object.keys(rbm_tname_to_tid)});
*/

    // Default settings for AJAX requests
    $.ajaxSetup({
        url:   "ajax/ajax.php",
        type:  "GET",
        cache: false,
    });
});
