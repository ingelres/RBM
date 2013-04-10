<?php

    require_once $RBM_BASE_DIR . "/inc/consts.php";

    /**
     * Create a new tag file.
     *
     * @param tagToUID   The array that maps a tag name to its UID.
     * @param UIDToTag   The array that maps a tag UID to its name.
     * @param nextTagUID The UID to be used the next time a tag is created.
    **/
    function db_saveTagFile($tagToUID, $UIDToTag, $nextTagUID)
    {
        global $CONSTS_FILE_TAGS;

        $handle = fopen($CONSTS_FILE_TAGS, "w");

        fprintf($handle, "<?php\n\$NEXT_TAG_UID=%u;\n\$TAG_TO_UID=%s;\n\$UID_TO_TAG=%s;\n?>\n", $nextTagUID, var_export($tagToUID, true), var_export($UIDToTag, true));
        fclose($handle);
    }

    /**
     * Save an array to a PHP file.
     *
     * @param array     The array to be saved.
     * @param arrayName The name of the array.
     * @param file      The name of the file.
    **/
    function db_saveArray($array, $arrayName, $filename)
    {
        $handle = fopen($filename, "w");

        fprintf($handle, "<?php\n\$%s=%s;\n?>\n", $arrayName, var_export($array, true));
        fclose($handle);
    }

    /**
     * Create a new Tag To Bookmark file.
     *
     * @param tagToBookmark The array that maps a tag UID to a number of bookmark UIDs.
    **/
    function db_saveTagToBookmarkFile($tagToBookmark)
    {
        global $CONSTS_FILE_TAG_TO_BOOKMARK;

        db_saveArray($tagToBookmark, "TAG_TO_BOOKMARK", $CONSTS_FILE_TAG_TO_BOOKMARK);
    }

    /**
     * Create a new Bookmark To Tag file.
     *
     * @param bookmarkToTag The array that maps a bookmark UID to a number of tag UIDs.
    **/
    function db_saveBookmarkToTagFile($bookmarkToTag)
    {
        global $CONSTS_FILE_BOOKMARK_TO_TAG;

        db_saveArray($bookmarkToTag, "BOOKMARK_TO_TAG", $CONSTS_FILE_BOOKMARK_TO_TAG);
    }

?>
