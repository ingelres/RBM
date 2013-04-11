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
     * Add a new tag to the database.
     *
     * @param name Name of the tag to be added.
    **/
    function addTag()
    {
        global $CONSTS_FILE_TAGS;

        include $CONSTS_FILE_TAGS;

        $tname = getStringParam("name");

        if(!array_key_exists($tname, $TNAME_TO_TID))
        {
            // The tag doesn't already exist
            // Create a mapping between the tag name and its id
            $TNAME_TO_TID[$tname]       = $NEXT_TAG_ID;
            $TID_TO_TNAME[$NEXT_TAG_ID] = $tname;

            db_saveTagFile($TNAME_TO_TID, $TID_TO_TNAME, $NEXT_TAG_ID+1);
        }
    }


    /**
     * Delete a tag from the database.
     *
     * @param id Id of the tag to be deleted.
    **/
    function deleteTag()
    {
        global $CONSTS_FILE_TAGS, $CONSTS_FILE_TID_TO_BID, $CONSTS_FILE_BID_TO_TID;

        include $CONSTS_FILE_TAGS;

        $tid = getStringParam("id");

        if(array_key_exists($tid, $TID_TO_TNAME))
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
            $tname = $TID_TO_TNAME[$tid];

            unset($TNAME_TO_TID[$tname]);
            unset($TID_TO_TNAME[$tid]);

            db_saveTagFile($TNAME_TO_TID, $TID_TO_TNAME, $NEXT_TAG_ID);
        }
    }

?>
