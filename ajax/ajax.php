<?php

    // Base directory of the website
    $RBM_BASE_DIR = realpath(__DIR__ . "/..");

    require_once $RBM_BASE_DIR . "/inc/db.php";
    require_once $RBM_BASE_DIR . "/inc/params.php";


    $ALL_ACTIONS = array(
            "addTag"      => NULL,
            "deleteTag"   => NULL,
            "reparentTag" => NULL,
        );

    $action = getStringParam("action");

    if(array_key_exists($action, $ALL_ACTIONS))
        $action();


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
        $tname = htmlspecialchars(getStringParam("tname"));

        // Make sure the tag doesn't already exist
        if(!array_key_exists($tname, $tags_tname2tid))
        {
            // Create the mappings
            $tags_parents[$tags_nexttid]        = $ptid;
            $tags_tid2tname[$tags_nexttid]      = $tname;
            $tags_tname2tid[strtolower($tname)] = $tags_nexttid;

            // Insert the new child in its parent's list
            __addToChildren($tags_nexttid, $ptid, $tags_children, $tags_tid2tname);

            // We're done
            db_saveTagFile($tags_nexttid+1, $tags_tname2tid, $tags_tid2tname, $tags_children, $tags_parents);
        }
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
            // Remove the tag from its parent's children
            // Dont use unset(), otherwise indexing is not correct
            $ptid     = $tags_parents[$tid];
            $children = $tags_children[$ptid];

            if(count($children) == 1) unset($tags_children[$ptid]);
            else                      array_splice($tags_children[$ptid], array_search($tid, $children), 1);

            // Delete the tag and its subtags
            $alltags = array($tid);

            while(count($alltags) != 0)
            {
                $tid = array_shift($alltags);

                if(array_key_exists($tid, $tags_children))
                    $alltags = array_merge($alltags, $tags_children[$tid]);

                unset($tags_tname2tid[strtolower($tags_tid2tname[$tid])]);
                unset($tags_tid2tname[$tid]);
                unset($tags_children[$tid]);
                unset($tags_parents[$tid]);
            }

            // We're done
            db_saveTagFile($tags_nexttid, $tags_tname2tid, $tags_tid2tname, $tags_children, $tags_parents);
        }
    }


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
            // Delete the tag from its parent's children
            // Dont use unset(), otherwise indexing is not correct
            $oldptid     = $tags_parents[$tid];
            $oldchildren = $tags_children[$oldptid];

            if(count($oldchildren) == 1) unset($tags_children[$oldptid]);
            else                         array_splice($tags_children[$ptid], array_search($tid, $children), 1);

            // Set the new parent of the tag
            $tags_parents[$tid] = $ptid;

            // Add the tag to the children of the new parent
            __addToChildren($tid, $ptid, $tags_children, $tags_tid2tname);

            // We're done
            db_saveTagFile($tags_nexttid, $tags_tname2tid, $tags_tid2tname, $tags_children, $tags_parents);
        }
    }

?>
