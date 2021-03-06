<?php

    // Base directory of the website
    $RBM_BASE_DIR = realpath(__DIR__ . "/..");

    require_once $RBM_BASE_DIR . "/inc/db.php";
    require_once $RBM_BASE_DIR . "/inc/consts.php";
    require_once $RBM_BASE_DIR . "/inc/params.php";


    $ALL_ACTIONS = array(
                            // Tags
                            "addTag"      => NULL,
                            "deleteTag"   => NULL,
                            "renameTag"   => NULL,
                            "reparentTag" => NULL,

                            // Bookmarks
                            "addBookmark"       => NULL,
                            "getBookmarksByTid" => NULL,

        );

    $action = getStringParam("action");

    if(array_key_exists($action, $ALL_ACTIONS))
        $action();


    /**
     * Check whether a tag is a descendant of another tag (not necessary a direct child).
     *
     * @param tid     Id of the tag.
     * @param ptid    Id of the potential parent tag.
     * @param parents Array of parents.
    **/
    function __isDescendant($tid, $ptid, $parents)
    {
        while(array_key_exists($tid, $parents))
        {
            $tid = $parents[$tid];

            if($tid == $ptid)
                return true;
        }

        return false;
    }


    /**
     * Add a tag to the list of children of another tag.
     *
     * @param tid         The tag ID.
     * @param ptid        The parent tag ID.
     * @param allChildren The array mapping tid to children.
     * @param tid2tname   The array mapping tid to tname.
    **/
    function __addToChildren($tid, $ptid, &$allChildren, $tid2tname)
    {
        if(array_key_exists($ptid, $allChildren))
        {
            $children = $allChildren[$ptid];

            // There's at least one child, so we know that low <= high the first time
            $low   = 0;
            $high  = count($children)-1;
            $tname = strtolower($tid2tname[$tid]);

            while($low <= $high)
            {
                $middle     = floor(($low + $high) / 2);
                $comparison = strcmp($tname, strtolower($tid2tname[$children[$middle]]));

                if($comparison > 0) $low  = $middle + 1;
                else                $high = $middle - 1;
            }

            if($comparison > 0) $insertionPoint = $middle+1;
            else                $insertionPoint = $middle;

            // Don't call array_splice on $children, otherwise $allChildren is never updated
            array_splice($allChildren[$ptid], $insertionPoint, 0, $tid);
        }
        else
            $allChildren[$ptid] = array($tid);
    }


    /**
     * Delete a specific tag from its parent's children.
     *
     * @param tid         Id of the tag to delete.
     * @param allParents  The array mapping tid to ptid.
     * @param allChildren The array mapping tid to children.
    **/
    function __deleteFromChildren($tid, $allParents, &$allChildren)
    {
        $ptid     = $allParents[$tid];
        $children = $allChildren[$ptid];
        $idx      = array_search($tid, $children);

        if($idx !== FALSE)
        {
            // User array_splice() to keep a valid indexing when there's more than one child
            if(count($children) == 1) unset($allChildren[$ptid]);
            else                      array_splice($allChildren[$ptid], $idx, 1);
        }
    }


    /**
     * Add a new tag to the database.
     *
     * @param ptid  ID of the parent tag.
     * @param tname Name of the tag to be added.
    **/
    function addTag()
    {
        global $CONSTS_FILE_TAGS;

        include $CONSTS_FILE_TAGS;

        $ptid  = getIntParam("ptid");
        $tname = getStringParam("tname");

        // Create the mappings
        $tags_tname2tid[$tname][]      = $tags_nexttid;
        $tags_parents[$tags_nexttid]   = $ptid;
        $tags_tid2tname[$tags_nexttid] = $tname;

        // Insert the new child in its parent's list
        __addToChildren($tags_nexttid, $ptid, $tags_children, $tags_tid2tname);

        // We're done
        db_saveTags($tags_nexttid+1, $tags_tname2tid, $tags_tid2tname, $tags_children, $tags_parents);
    }


    /**
     * Delete a tag from the database.
     *
     * @param tid Id of the tag to be deleted.
    **/
    function deleteTag()
    {
        global $CONSTS_FILE_TAGS;

        include $CONSTS_FILE_TAGS;

        $tid = getIntParam("tid");

        // Root tag (id 0) cannot be deleted
        if($tid != 0 && array_key_exists($tid, $tags_tid2tname))
        {
            __deleteFromChildren($tid, $tags_parents, $tags_children);

            // Delete the tag and its subtags
            $alltags = array($tid);

            while(count($alltags) != 0)
            {
                $tid = array_shift($alltags);

                if(array_key_exists($tid, $tags_children))
                    $alltags = array_merge($alltags, $tags_children[$tid]);

                $tname    = $tags_tid2tname[$tid];
                $homonyms = $tags_tname2tid[$tname];

                if(count($homonyms) == 1) unset($tags_tname2tid[$tname]);
                else                      array_splice($tags_tname2tid[$tname], array_search($tid, $homonyms), 1);

                unset($tags_tid2tname[$tid]);
                unset($tags_children[$tid]);
                unset($tags_parents[$tid]);
            }

            // We're done
            db_saveTags($tags_nexttid, $tags_tname2tid, $tags_tid2tname, $tags_children, $tags_parents);
        }
    }


    /**
     * Reparent a tag.
     *
     * @param tid  Id of the tag to reparent.
     * @param ptid Id of the new parent.
    **/
    function reparentTag()
    {
        global $CONSTS_FILE_TAGS;

        include $CONSTS_FILE_TAGS;

        $tid  = getIntParam("tid");
        $ptid = getIntParam("ptid");

        // Root tag (id 0) cannot be reparented
        if($tid != 0 && !__isDescendant($ptid, $tid, $tags_parents))
        {
            __deleteFromChildren($tid, $tags_parents, $tags_children);

            // Set the new parent of the tag
            $tags_parents[$tid] = $ptid;

            // Add the tag to the children of the new parent
            __addToChildren($tid, $ptid, $tags_children, $tags_tid2tname);

            // We're done
            db_saveTags($tags_nexttid, $tags_tname2tid, $tags_tid2tname, $tags_children, $tags_parents);
        }
    }


    /**
     * Rename a tag.
     *
     * @param tid   Id of the tage to rename.
     * @param tname The new name of the tag.
    **/
    function renameTag()
    {
        global $CONSTS_FILE_TAGS;

        include $CONSTS_FILE_TAGS;

        $tid   = getIntParam("tid");
        $tname = getStringParam("tname");

        $oldName  = $tags_tid2tname[$tid];
        $homonyms = $tags_tname2tid[$oldName];

        if(count($homonyms) == 1) unset($tags_tname2tid[$oldName]);
        else                      array_splice($tags_tname2tid[$oldName], array_search($tid, $homonyms), 1);

        $tags_tid2tname[$tid]     = $tname;
        $tags_tname2tid[$tname][] = $tid;

        // The tag has been renamed, we now need to put it at the right place in its parent's children
        __deleteFromChildren($tid, $tags_parents, $tags_children);
        __addToChildren($tid, $tags_parents[$tid], $tags_children, $tags_tid2tname);

        // We're done
        db_saveTags($tags_nexttid, $tags_tname2tid, $tags_tid2tname, $tags_children, $tags_parents);
    }


    /**
     * Add a new bookmark.
     *
     * @param url  URL of the bookmark.
     * @param name Name of the bookmark.
     * @param tags A comma-separated list of tags id (e.g., "23,10,103").
    **/
    function addBookmark()
    {
        global $CONSTS_FILE_T2B;

        $url  = getStringParam("url");
        $name = getStringParam("name");
        $tags = getStringParam("tags");

        // Associate the bookmark to the correct tags
        include $CONSTS_FILE_T2B;

        $bid  = $nextbid++;
        $tags = explode(",", $tags);

        foreach($tags as $tid)
            $t2b[(int)$tid][] = $bid;

        db_saveT2B($nextbid, $t2b);

        // Create the bookmark file
        db_saveBookmark($bid, $url, $name, $tags);
    }


    /**
     * Get the list of bookmarks associated to a list of tags id.
     *
     * @param tags A comma-separated list of tags id (e.g., "23,10,103").
     *
     * @return A JSON array with the bookmarks' data.
    **/
    function getBookmarksByTid()
    {
        global $CONSTS_FILE_T2B;

        $tags      = explode(",", getStringParam("tags"));
        $bookmarks = array();

        include $CONSTS_FILE_T2B;

        foreach($tags as $tid)
            if(array_key_exists($tid, $t2b))
                foreach($t2b[$tid] as $bid)
                    $bookmarks[$tid][] = db_loadBookmark($bid);

        echo json_encode($bookmarks);
    }

?>
