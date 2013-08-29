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

        // Expand the root tag (tid 0)
        expandTag(0, null);

        // Make it react as well to user's interactions
        makeDNDItem(0);
        $("#css-explorer-item-0").on("click", 0, my.onItemClicked);

        // Create the dialog box used to rename a tag
        $("#css-explorer-dialog-rename").dialog({
            modal:true,
            autoOpen:false,
            buttons:[{
                text: L10N.ok,
                click: function(){
                    var name   = $("#css-explorer-tag-new-name").val();
                    var errmsg = $("#css-explorer-dialog-rename-errmsg");
                    var dlg    = $(this);

                         if(name.length == 0)               errmsg.html(L10N.name_empty).css("visibility", "visible");
                    else if(dlg.data("action") == "rename") renameTag(dlg.dialog("close").data("tid"), name);
                    else                                    createTag(dlg.dialog("close").data("tid"), name);
                }},{
                text: L10N.cancel,
                click: function(){
                    $(this).dialog("close");
                }}
            ]
        });

        $("#css-explorer-tag-new-name").keyup(function(evt){
            if(evt.keyCode == 13){
                $("#css-explorer-dialog-rename").dialog('option', 'buttons')[0].click.apply($("#css-explorer-dialog-rename"));
            }
        });

        // Create the dialog box used to delete a tag
        $("#css-explorer-dialog-delete").dialog({
            modal:true,
            width: 400,
            autoOpen:false,
            buttons: [{
                text: L10N.delete,
                click: function(){
                    deleteTag($(this).dialog("close").data("tid"));
                }},{
                text: L10N.cancel,
                click: function(){
                    $(this).dialog("close");
                }}
            ],
        });

        // Hide the popup menu
        $("html").on("click", function(evt){
            $("#css-explorer-toolbox-popup").hide();
        });
    });


    /**
     * Handler for clicks on items. The action depends on the actual element clicked.
     *
     * @param evt The click event.
    **/
    my.onItemClicked = function(evt)
    {
        var tid    = evt.data;
        var target = $(evt.target);

        if(target.hasClass("css-explorer-expander"))
        {
            var expander = $("#css-explorer-expander-" + tid);

                 if(expander.hasClass("css-explorer-expand"))   expandTag(tid, expander);
            else if(expander.hasClass("css-explorer-collapse")) collapseTag(tid, expander);
            else                                                selectTag(tid);
        }
        else if(target.hasClass("css-explorer-toolbox"))
        {
            showToolbox(tid);

            // Click events eventually end up in the global handler that closes the popup menu
            // We don't want that to happen when we open the menu, otherwise it would be immediately closed
            evt.stopPropagation();
        }
        else if(!target.hasClass("css-explorer-handle"))
        {
            selectTag(tid);
        }
    }


    /**
     * Show a toolbox with a few options to manipulate a tag.
     *
     * @param tid The ID of the tag.
    **/
    function showToolbox(tid)
    {
        var popup = $("#css-explorer-toolbox-popup");

        // Special case for tag 0 (root)
        if(tid == 0)
        {
            $("#css-explorer-toolbox-delete").hide();
            $("#css-explorer-toolbox-rename").hide();
            $("#css-explorer-toolbox-create").html(L10N.create_tag);
        }
        else
        {
            $("#css-explorer-toolbox-delete").show();
            $("#css-explorer-toolbox-rename").show();
            $("#css-explorer-toolbox-create").html(L10N.create_subtag);
        }

        // Show the popup right below the corresponding item
        popup.show().position({my: "left top", at: "left bottom", of: $("#css-explorer-item-" + tid).find(".css-explorer-toolbox")});

        // We need to remove the previous handler first, otherwise they just keep being added one to another
        popup.off("click").on("click", function(evt){

            var target = $(evt.target);

            if(target.is("#css-explorer-toolbox-delete"))
            {
                if(libtags.hasSubTags(tid)) $("#css-explorer-dialog-delete-msg").html(L10N.confirm_delete_tag_subtags);
                else                               $("#css-explorer-dialog-delete-msg").html(L10N.confirm_delete_tag);

                $("#css-explorer-dialog-delete").data("tid", tid).dialog("open");
            }
            else
            {
                var dlg = $("#css-explorer-dialog-rename");

                $("#css-explorer-dialog-rename-errmsg").css("visibility", "hidden");

                if(target.is("#css-explorer-toolbox-create"))
                {
                    $("#css-explorer-tag-new-name").val("").attr("placeholder", L10N.newtag);
                    dlg.data("tid", tid).data("action", "create").dialog("option", "title", L10N.create_tag).dialog("open");
                }
                else
                {
                    $("#css-explorer-tag-new-name").val("").attr("placeholder", libtags.getName(tid));
                    dlg.data("tid", tid).data("action", "rename").dialog("option", "title", L10N.rename_tag).dialog("open");
                }
            }

            popup.hide();
        });
    }


    /**
     * Create the HTML item code for a given tag.
     *
     * @param tid The ID of the tag.
     *
     * @return The HTML code.
    **/
    function getItemCode(tid)
    {
        var marginLeft = (Math.min(libtags.getLevel(tid), MAX_ITEM_LVL)-1) * MARGIN_LEFT_PER_LVL;

        var code = "<div id='css-explorer-item-" + tid + "' class='css-explorer-item'>"
                        + "<div class='css-explorer-handle'></div>"
                        + "<div class='css-explorer-toolbox'></div>"
                        + "<div id='css-explorer-expander-" + tid + "' style='margin-left:" + marginLeft + "px' ";

        if(libtags.hasSubTags(tid)) code += "class='css-explorer-expander css-explorer-expand'></div>";
        else                               code += "class='css-explorer-expander'></div>";

        return code + "<div class='css-explorer-tag-name'>" + libtools.htmlspecialchars(libtags.getName(tid)) + "</div></div>";
    }


    /**
     * Expand a tag. It is assumed (i.e., not checked) that the tag actually has children and is currently collapsed.
     *
     * @param ptid     The ID of the tag.
     * @param expander The JQuery object holding the expander associated to the tag.
    **/
    function expandTag(ptid, expander)
    {
        // Create the code and insert it at once, this is faster than inserting many small bits of code
        var code       = "<div id='css-explorer-children-" + ptid + "' style='display: none'>";
        var children   = libtags.getSubTags(ptid);
        var nbChildren = children.length;

        for(var i=0; i<nbChildren; ++i)
            code += getItemCode(children[i]);

        // Skip the animation for the root tag
        if(ptid == 0) $(code + "</div>").insertAfter("#css-explorer-item-" + ptid).show();
        else          $(code + "</div>").insertAfter("#css-explorer-item-" + ptid).slideDown(ANIMATION_LEN);

        // We must do this outside of the above loop, for the items must be present in the DOM when calling these functions
        for(var i=0; i<nbChildren; ++i)
        {
            var tid = children[i];

            makeDNDItem(tid);
            $("#css-explorer-item-" + tid).on("click", tid, my.onItemClicked);
        }

        // Expand -> collapse (ignore for the root tag)
        if(ptid != 0)
            expander.removeClass("css-explorer-expand").addClass("css-explorer-collapse");
    }


    /**
     * Collapse a tag. It is assumed (i.e., not checked) that the tag actually has children and is currently expanded.
     *
     * @param ptid     The ID of the tag.
     * @param expander The JQuery object holding the expander associated to the tag.
    **/
    function collapseTag(ptid, expander)
    {
        // Destroy all draggable/droppable descendants (not only the direct children) before removing the container
        var children = $("#css-explorer-children-" + ptid);

        children.find(".css-explorer-item").draggable("destroy").droppable("destroy");
        children.slideUp(ANIMATION_LEN, function(){ $(this).remove() });

        // Clear selection if it's a descendant of the item we're collapsing
        if(libtags.tidIsDescendant(selectedTagId, ptid))
            selectTag(-1);

        // Collapse -> expand
        expander.removeClass("css-explorer-collapse").addClass("css-explorer-expand");
    }


    /**
     * Recursively expand all tags.
    **/
    my.expandAll = function()
    {
        while($(".css-explorer-expand").trigger("click").length != 0);
    }


    /**
     * Collapse all tags.
    **/
    my.collapseAll = function()
    {
        var topLvlItems   = libtags.getTopLevelTags();
        var nbTopLvlItems = topLvlItems.length;

        for(var i=0; i<nbTopLvlItems; ++i)
            $("#css-explorer-expander-" + topLvlItems[i] + ".css-explorer-collapse").trigger("click");
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
    my.reparent = function(tid, ptid)
    {
        // Update the current parent (if any) by removing the expand/collapse icon if it has no more child after the reparenting
        var oldptid = libtags.getParent(tid);

        if(oldptid != 0 && libtags.getSubTags(oldptid).length == 1)
            $("#css-explorer-expander-" + oldptid).removeClass("css-explorer-expand").removeClass("css-explorer-collapse");

        // Reparent the tag internally
        var lvlBefore  = libtags.getLevel(tid);
        var newSibling = libtags.reparent(tid, ptid);

        // Update the GUI
        // Assume tag 0 (root) is always expanded even though it doesn't have an expander
        var expander = $("#css-explorer-expander-" + ptid);

        if(ptid == 0 || expander.hasClass("css-explorer-collapse"))
        {
            // The new parent is already expanded, so we just move things around in the DOM
            var item     = $("#css-explorer-item-" + tid).css("top", "");
            var lvlAfter = libtags.getLevel(tid);

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
            if($("#css-explorer-item-" + selectedTagId).length == 0)
                selectTag(-1);
        }

        libajax.ajax({
            data: "action=reparentTag&tid=" + tid + "&ptid=" + ptid,
        });
    }


    /**
     * Enable drag'n'drop on a tag.
     *
     * @param tid The ID of the tag.
    **/
    function makeDNDItem(tid)
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
            accept: function(drg){ return !libtags.tidIsDescendant(tid, drg.data("tid")) && libtags.getParent(drg.data("tid")) != tid},
            drop: function(evt, ui){libexp.reparent($(ui.draggable).data("tid"), tid)},
        });
    }


    /**
     * Select a tag. The tag must exist in the DOM. This function will:
     *  - Reflect the fact that the tag is selected.
     *  - Load the associated bookmarks.
     *
     * @param tid The ID of the tag.
    **/
    function selectTag(tid)
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
     * Select a tag even if it doesn't exist yet in the DOM (as opposed to selectTag). This function will:
     *  - Open all the parents of the tag.
     *  - Scroll to the tag.
     *  - Select the tag.
     *
     * @param tname The name of the tag.
    **/
    my.showAndSelectTag = function(tname)
    {
        var tid = libtags.getIdFromName(tname);

        if(tid != undefined)
        {
            // Go through the parents of the tags and open the collapsed ones
            var parents   = libtags.getParents(tid);
            var nbParents = parents.length;

            for(var i=0; i<nbParents; ++i)
            {
                var ptid     = parents[i];
                var expander = $("#css-explorer-expander-" + ptid);

                if(expander.hasClass("css-explorer-expand"))
                    expandTag(ptid, expander);
            }

            // TODO Scroll to the tag

            // Now that the hierarchy has been expanded, the item exists and can be selected
            selectTag(tid);
        }
    }


    /**
    * Rename a tag.
    *
    * @param tid   The ID of the tag to be renamed.
    * @param tname The new name of the tag.
    **/
    function renameTag(tid, tname)
    {
        var item    = $("#css-explorer-item-" + tid);
        var sibling = libtags.rename(tid, tname);

        libsearch.updateSourceTags();
        item.find(".css-explorer-tag-name").html(tname);

             if(sibling == -1)                                      item.prependTo("#css-explorer-children-" + libtags.getParent(tid));
        else if($("#css-explorer-children-" + sibling).length != 0) item.insertAfter("#css-explorer-children-" + sibling);
        else                                                        item.insertAfter("#css-explorer-item-" + sibling);

        $("#css-explorer-children-" + tid).insertAfter(item);

        // Update server-side DB
        libajax.ajax({
            data: "action=renameTag&tid=" + encodeURIComponent(tid) + "&tname=" + encodeURIComponent(tname),
        });
    }


    /**
     * Delete a tag.
     *
     * @param tid The ID of the tag.
    **/
    function deleteTag(tid)
    {
        var ptid = libtags.getParent(tid);

        // Clear selection if it's a descendant of the item we're deleting
        if(selectedTagId == tid || libtags.tidIsDescendant(selectedTagId, tid))
            selectTag(-1);

        libtags.delete(tid);
        libsearch.updateSourceTags();

        $("#css-explorer-children-" + tid).slideUp(ANIMATION_LEN, function(){ $(this).remove() });
        $("#css-explorer-item-" + tid).slideUp(ANIMATION_LEN, function(){ $(this).remove() });

        if(!libtags.hasSubTags(ptid))
            $("#css-explorer-expander-" + ptid).removeClass("css-explorer-collapse");

        // Update server-side DB
        libajax.ajax({
            data: "action=deleteTag&tid=" + encodeURIComponent(tid),
        });
    }


    /**
     * Create a new tag.
     *
     * @param ptid  The ID of the parent tag.
     * @param tname The name of the new tag.
    **/
    function createTag(ptid, tname)
    {
        var tag = libtags.create(ptid, tname);

        if(ptid == 0 || $("#css-explorer-expander-" + ptid).hasClass("css-explorer-collapse"))
        {
            var item = $(getItemCode(tag.tid));

                 if(tag.sibling == -1)                                      item.prependTo("#css-explorer-children-" + ptid);
            else if($("#css-explorer-children-" + tag.sibling).length != 0) item.insertAfter("#css-explorer-children-" + tag.sibling);
            else                                                            item.insertAfter("#css-explorer-item-" + tag.sibling);

            makeDNDItem(tag.tid);
            $("#css-explorer-item-" + tag.tid).on("click", tag.tid, my.onItemClicked);
        }
        else
            $("#css-explorer-expander-" + ptid).addClass("css-explorer-expand");

        libsearch.updateSourceTags();
        libexp.showAndSelectTag(tname);

        // Update server-side DB
        libajax.ajax({
            data: "action=addTag&tname=" + encodeURIComponent(tname) + "&ptid=" + encodeURIComponent(ptid),
        });
    }

    return my;

}());
