var rbm_consts = {
    EXPLORER_MAX_LVL:    5,
    EXPLORER_ANIM_LEN: 200,
}

var rbm_globals = {
    explorerSelectedTag: -1,
}

function jsfunc_explorerToggleTag(ptid, lvl)
{
    var item        = "css-explorer-item-" + ptid;
    var expander    = "#" + item + " > .css-explorer-expander";
    var container   = item + "-children";
    var containerId = "#" + container;

    if($(expander).hasClass("css-explorer-expand"))
    {
        var childLvl = Math.min(lvl+1, rbm_consts.EXPLORER_MAX_LVL);

        // The container with the children is hidden at first so that we can show it with an animation
        $("<div id='" + container + "' style='display: none'></div>").insertAfter("#css-explorer-item-" + ptid);

        $.each(rbm_tid_children[ptid], function(idx, tid){

            child = "<div id='css-explorer-item-" + tid + "' class='css-explorer-item css-explorer-level-" + childLvl + "'>"
                + "<div class='css-explorer-handle'></div><div class='css-explorer-expander";

            fnSelectTag = "jsfunc_explorerSelectTag(" + tid + ")";

            if(rbm_tid_children[tid] == undefined)
            {
                // When an item has no child, use the selectTag code to avoid a dead zone (clicking on the expander placeholder would have no effect otherwise)
                child += "' onclick='" + fnSelectTag + "'>";
            }
            else
                child += " css-explorer-expand' onclick='jsfunc_explorerToggleTag(" + tid + ", " + childLvl + ")'>";

            $(containerId).append(child + "</div><div class='css-explorer-tag' onclick='" + fnSelectTag + "'>" + rbm_tid_to_tname[tid] + "</div></div>");

            // Enable item drag'n'drop now that the child has been added to the DOM
            jsfunc_explorerEnableItemDND(tid);
        });

        $(containerId).slideDown(rbm_consts.EXPLORER_ANIM_LEN);
    }
    else
    {
        var allDescendants = $(containerId + " .css-explorer-item");

        // Destroy all draggable/droppable descendants (not only the direct children)
        allDescendants.droppable("destroy");
        allDescendants.draggable("destroy");

        // Remove the container once the animation over
        $(containerId).slideUp(rbm_consts.EXPLORER_ANIM_LEN, function(){ this.remove() });

        // Clear selection if it's a descendant of the item we're collapsing
        if(jsfunc_tidIsDescendant(rbm_globals.explorerSelectedTag, ptid))
            jsfunc_explorerSelectTag(-1);
    }

    // Expand <-> Collapse
    $(expander).toggleClass("css-explorer-expand css-explorer-collapse");
}

function jsfunc_explorerCollapseAll()
{
    // Collapse all tags at level 1: That's sufficient to collapse everything no matter how deep the tree is opened
    $(".css-explorer-level-1 > .css-explorer-collapse").trigger("click");
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
    if(tid != rbm_globals.explorerSelectedTag)
    {
        $("#css-explorer-item-" + rbm_globals.explorerSelectedTag).removeClass("css-explorer-item-selected", rbm_consts.EXPLORER_ANIM_LEN);

        if(tid == -1)
        {
            // TODO Should remove the things that depend on the selected tag (e.g., bookmarks)
        }
        else
        {
            $("#css-explorer-item-" + tid).addClass("css-explorer-item-selected", rbm_consts.EXPLORER_ANIM_LEN);

            // TODO Make an AJAX request to get the associated bookmarks
        }

        rbm_globals.explorerSelectedTag = tid;
    }
}

function jsfunc_explorerScrollToTag(tname)
{
    var tid = rbm_tname_to_tid[tname];

    if(tid != undefined)
    {
        // Go through the hierarchy of tags and open the collapsed ones
        $.each(jsfunc_getHierarchy(tid), function(idx, val){
            if($("#css-explorer-item-" + val + " > .css-explorer-expand").length != 0)
                jsfunc_explorerToggleTag(val, idx+1);
        });

        // TODO Scroll to the tag

        // Now that the hierarchy has been expanded, the item exists and can be selected
        jsfunc_explorerSelectTag(tid);
    }
}

$(document).ready(function(){

    jsfunc_explorerEnableItemDND(0);
    jsfunc_explorerEnableItemDND(25);
    jsfunc_explorerEnableItemDND(59);

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
