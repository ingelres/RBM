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
            child  = "<div id='css-explorer-item-" + tid + "' class='css-explorer-item css-explorer-level-" + childLvl + "'";
            child += " onclick='jsfunc_explorerSelectTag(" + tid + ")'><div class='css-explorer-handle'></div>";

            if(rbm_tid_children[tid] != undefined)
                child += "<div class='css-explorer-expand' onclick='jsfunc_explorerToggleTag(this, " + tid + ", " + childLvl + ")'></div>";

            $(container).append(child + "<div class='css-explorer-tag'>" + rbm_tid_to_tname[tid] + "</div></div>");

            // Enable item drag'n'drop now that the child has been added to the DOM
            jsfunc_explorerEnableItemDND(tid);
        });

        $(container).slideDown(rbm_consts.EXPLORER_ANIM_LEN);
    }
    else
    {
        var children = $(container + " .css-explorer-item");

        // Destroy all draggable/droppable children
        children.droppable("destroy");
        children.draggable("destroy");

        // Remove the container once the animation over
        $(container).slideUp(rbm_consts.EXPLORER_ANIM_LEN, function(){ this.remove() });
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
    $("#css-explorer-item-" + rbm_globals.explorerSelectedTag).removeClass("css-explorer-item-selected", rbm_consts.EXPLORER_ANIM_LEN);
    $("#css-explorer-item-" + tid).addClass("css-explorer-item-selected");

    rbm_globals.explorerSelectedTag = tid;
}

$(document).ready(function(){

    jsfunc_explorerEnableItemDND(0);
    jsfunc_explorerEnableItemDND(25);
    jsfunc_explorerEnableItemDND(59);

    // Default settings for AJAX requests
    $.ajaxSetup({
        url:   "ajax/ajax.php",
        type:  "GET",
        cache: false,
    });
});
