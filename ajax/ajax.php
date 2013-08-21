<?php

    // Base directory of the website
    $RBM_BASE_DIR = realpath(__DIR__ . "/..");

    require_once $RBM_BASE_DIR . "/inc/db.php";
    require_once $RBM_BASE_DIR . "/inc/params.php";


    $ALL_ACTIONS = array(
            "addTag"    => NULL,
            "deleteTag" => NULL,
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

            while(low <= high)
            {
                $middle     = floor(($low + $high) / 2);
                $comparison = strcmp($tname, strtolower($tid2tname[$children[$middle]]));

                if(comparison > 0) $low  = $middle + 1;
                else               $high = $middle - 1;
            }

            if(comparison > 0) $insertionPoint = $middle+1;
            else               $insertionPoint = $middle;

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
        if(!array_key_exists($tname, $db_tname2tid))
        {
            // Create the mapping name <-> id
            $db_tname2tid[$tname]      = $db_nextTid;
            $db_tid2tname[$db_nextTid] = $tname;

            // Create the mapping tid -> ptid
            $db_parents[$db_nextTid] = $ptid;

            // Insert the new child in its parent's list
            __addToChildren($db_nextTid, $ptid, $db_children, $db_tid2tname);

            // We're done
            db_saveTagFile($db_nextTid+1, $db_tname2tid, $db_tid2tname, $db_children, $db_parents);
        }
    }


    /**
     * Delete a tag from the database.
     *
     * @param tid Id of the tag to be deleted.
    **/
    function deleteTag()
    {

        // FIXME Make sure we don't delete tag 0

        /*
        global $CONSTS_FILE_TAGS, $CONSTS_FILE_TID_TO_BID, $CONSTS_FILE_BID_TO_TID;

        include $CONSTS_FILE_TAGS;

        $tid = getIntParam("tid");

        if(array_key_exists($tid, $db_tid2tname))
        {
            include $CONSTS_FILE_TID_TO_BID;

            // First remove all the associations to bookmarks, if any
            if(array_key_exists($tid, $TID_TO_BID))
            {
                include $CONSTS_FILE_BID_TO_TID;

                foreach($TID_TO_BID[$tid] as $bid => $foo)
                {
                    if(count($BID_TO_TID[$bid]) == 1) unset($BID_TO_TID[$bid]);
                    else                              unset($BID_TO_TID[$bid][$tid]);
                }

                db_saveBIdToTidFile($BID_TO_TID);

                unset($TID_TO_BID[$tid]);
                db_saveTidToBidFile($TID_TO_BID);
            }

            // Now we can remove the tag itself
            $tname = $db_tid2tname[$tid];

            unset($db_tname2tid[$tname]);
            unset($db_tid2tname[$tid]);

            db_saveTagFile($db_nextTid, $db_tname2tid, $db_tid2tname);
        }
         */
    }

?>
