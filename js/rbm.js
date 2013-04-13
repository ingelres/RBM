function jsfunc_explorerToggleTag(expander, ptid, lvl)
{
    var container = "css-explorer-item-" + ptid + "-children";

    if($(expander).hasClass("css-explorer-expand"))
    {
        // Don't go deeper than level 5
        var childLvl = Math.min(lvl+1, 5);

        // All children go into a specific container to make it easy to remove them later on
        // It's hidden at first so that we can show it with an animation
        $("<div id='" + container + "' style='display: none'></div>").insertAfter("#css-explorer-item-" + ptid);

        $.each(rbm_tid_children[ptid], function(idx, tid){
            child  = "<div id='css-explorer-item-" + tid + "' class='css-explorer-item css-explorer-level-" + childLvl + "'";
            child += " onclick='jsfunc_explorerSelectTag(" + tid + ")'><div class='css-explorer-handle'></div>";

            if(rbm_tid_children[tid] != undefined)
                child += "<div class='css-explorer-expand' onclick='jsfunc_explorerToggleTag(this, " + tid + ", " + childLvl + ")'></div>";

            $("#" + container).append(child + "<div class='css-explorer-tag'>" + rbm_tid_to_tname[tid] + "</div></div>");

            // Enable drag'n'drop now that the child has been added to the DOM
            jsfunc_explorerEnableDragAndDrop(tid);
        });

        $("#" + container).slideDown(200);
    }
    else
    {
        $("#" + container + " .css-explorer-item").droppable("destroy");
        $("#" + container + " .css-explorer-item").draggable("destroy");

        $("#" + container).slideUp(200, function(){ this.remove() });
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
    // Loop until there's no more expandable elements
    while(true)
    {
        var expandable = $(".css-explorer-expand");

        if(expandable.length == 0) break;
        else                       expandable.trigger("click");
    }
}

function jsfunc_explorerEnableDragAndDrop(tid)
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

var mExplorerSelectedTag = -1;

function jsfunc_explorerSelectTag(tid)
{
    $("#css-explorer-item-" + mExplorerSelectedTag).removeClass("css-explorer-item-selected");
    $("#css-explorer-item-" + tid).addClass("css-explorer-item-selected");

    mExplorerSelectedTag = tid;
}

function jsfunc_onReady()
{
    // JQuery default settings for AJAX requests
    $.ajaxSetup({
        url:   "ajax/ajax.php",
        type:  "GET",
        cache: false,
    });

    jsfunc_explorerEnableDragAndDrop(0);
    jsfunc_explorerEnableDragAndDrop(25);
    jsfunc_explorerEnableDragAndDrop(59);
}

$(document).ready(jsfunc_onReady);
