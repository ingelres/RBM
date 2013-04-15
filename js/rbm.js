var rbm_consts = {
    EXPLORER_MAX_LVL:    5,
    EXPLORER_ANIM_LEN: 200,
}

var rbm_globals = {
    explorerSelectedTag: -1,
}

function jsfunc_explorerToggleTag(expander, ptid, lvl)
{
    var name      = "css-explorer-item-" + ptid + "-children";
    var container = "#" + name;

    if($(expander).hasClass("css-explorer-expand"))
    {
        var childLvl = Math.min(lvl+1, rbm_consts.EXPLORER_MAX_LVL);

        // All children go into a specific container to make it easy to remove them later on
        // It's hidden at first so that we can show it with an animation
        $("<div id='" + name + "' style='display: none'></div>").insertAfter("#css-explorer-item-" + ptid);

        $.each(rbm_tid_children[ptid], function(idx, tid){

            fnSelectTag = "jsfunc_explorerSelectTag(" + tid + ")";

            child = "<div id='css-explorer-item-" + tid + "' class='css-explorer-item css-explorer-level-" + childLvl + "'>"
                        + "<div class='css-explorer-handle'></div><div class='css-explorer-expander";

            if(rbm_tid_children[tid] != undefined)
            {
                // Add code to expand/collapse this item
                child += " css-explorer-expand' onclick='jsfunc_explorerToggleTag(this, " + tid + ", " + childLvl + ")'>";
            }
            else
            {
                // This item has no child, so we replace the expand/collapse code by the selectTag code
                // This avoids a dead zone (i.e., clicking on the expander placeholder would have no effect otherwise)
                child += "' onclick='" + fnSelectTag + "'>";
            }

            $(container).append(child + "</div><div class='css-explorer-tag' onclick='" + fnSelectTag + "'>" + rbm_tid_to_tname[tid] + "</div></div>");

            // Enable item drag'n'drop now that the child has been added to the DOM
            jsfunc_explorerEnableItemDND(tid);
        });

        $(container).slideDown(rbm_consts.EXPLORER_ANIM_LEN);
    }
    else
    {
        var descendants = $(container + " .css-explorer-item");

        // Destroy all draggable/droppable descendants (not only the direct children)
        descendants.droppable("destroy");
        descendants.draggable("destroy");

        // Remove the container once the animation over
        $(container).slideUp(rbm_consts.EXPLORER_ANIM_LEN, function(){ this.remove() });

        // Clear selection if it's a descendant of the item we're collapsing
        if(rbm_globals.explorerSelectedTag != -1 && jsfunc_tidIsDescendant(rbm_globals.explorerSelectedTag, ptid))
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
            $("#css-explorer-item-" + tid).addClass("css-explorer-item-selected");

            // TODO Make an AJAX request to get the associated bookmarks
        }

        rbm_globals.explorerSelectedTag = tid;
    }
}

function jsfunc_explorerShowTag(tname)
{
    var tid = rbm_tname_to_tid[tname];

    if(tid != undefined)
    {
        // Go through the hierarchy of tags and open the collapsed ones
        $.each(jsfunc_getHierarchy(tid), function(idx, val){
            var expander = "#css-explorer-item-" + val + " > .css-explorer-expand";

            if($(expander).length != 0)
                jsfunc_explorerToggleTag(expander, val, idx+1);
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
