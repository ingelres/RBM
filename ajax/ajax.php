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
     * @param tagName Name of the tag to be added.
    **/
    function addTag()
    {
        global $CONSTS_FILE_TAGS;

        include $CONSTS_FILE_TAGS;

        $tagName = getStringParam("tagName");

        if(!array_key_exists($tagName, $TAG_TO_UID))
        {
            // The tag doesn't already exist
            // Create a mapping between the tag name and its UID
            $TAG_TO_UID[$tagName]      = $NEXT_TAG_UID;
            $UID_TO_TAG[$NEXT_TAG_UID] = $tagName;

            db_saveTagFile($TAG_TO_UID, $UID_TO_TAG, $NEXT_TAG_UID+1);
        }
    }


    /**
     * Delete a tag from the database.
     *
     * @param tagName Name of the tag to be deleted.
    **/
    function deleteTag()
    {
        global $CONSTS_FILE_TAGS, $CONSTS_FILE_TAG_TO_BOOKMARK, $CONSTS_FILE_BOOKMARK_TO_TAG;

        include $CONSTS_FILE_TAGS;
        include $CONSTS_FILE_TAG_TO_BOOKMARK;
        include $CONSTS_FILE_BOOKMARK_TO_TAG;

        $tagName = getStringParam("tagName");

        if(array_key_exists($tagName, $TAG_TO_UID))
        {
            $tagUID = $TAG_TO_UID[$tagName];

            // First remove all the associations to bookmarks, if any
            if(array_key_exists($tagUID, $TAG_TO_BOOKMARK))
            {
                foreach($TAG_TO_BOOKMARK[$tagUID] as $bookmarkUID => $foo)
                {
                    unset($BOOKMARK_TO_TAG[$bookmarkUID][$tagUID]);

                    // Completely remove the array if it's empty
                    if(count($BOOKMARK_TO_TAG[$bookmarkUID]) == 0)
                        unset($BOOKMARK_TO_TAG[$bookmarkUID]);
                }

                db_saveBookmarkToTagFile($BOOKMARK_TO_TAG);

                unset($TAG_TO_BOOKMARK[$tagUID]);
                db_saveTagToBookmarkFile($TAG_TO_BOOKMARK);
            }

            // Now we can remove the tag itself
            unset($UID_TO_TAG[$tagUID]);
            unset($TAG_TO_UID[$tagName]);

            db_saveTagFile($TAG_TO_UID, $UID_TO_TAG, $NEXT_TAG_UID);
        }
    }

?>
