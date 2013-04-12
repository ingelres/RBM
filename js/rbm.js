function jsfunc_explorerToggleTag(expander, ptid, lvl)
{
    if($(expander).hasClass("css-explorer-expand"))
    {
        // Don't go deeper than level 5
        var childLvl = Math.min(lvl+1, 5);

        // All children go into a specific div container to make it easy to remove them later on
        // It's hidden at first so that we can show it with an animation
        var container = "<div id='css-explorer-item-children-" + ptid + "' style='display: none'>";

        $.each(rbm_tid_children[ptid], function(idx, tid){
            container += "<div id='css-explorer-item-" + tid + "' class='css-explorer-item css-explorer-level-" + childLvl + "'";
            container += " onclick='jsfunc_explorerSelectTag(" + tid + ")'>";

            if(rbm_tid_children[tid] != undefined)
                container += "<div class='css-explorer-expand' onclick='jsfunc_explorerToggleTag(this, " + tid + ", " + childLvl + ")'></div>";

            container += "<div class='css-explorer-tag'>" + rbm_tid_to_tname[tid] + "</div></div>";
        });

        $(container + "</div>").insertAfter("#css-explorer-item-" + ptid).slideDown(200);
    }
    else
    {
        $("#css-explorer-item-children-" + ptid).slideUp(200, function(){ this.remove() });
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
}

$(document).ready(jsfunc_onReady);
