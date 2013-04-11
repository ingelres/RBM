<?php

    require_once $RBM_BASE_DIR . "/inc/consts.php";

    /**
     * Create a new tag file.
     *
     * @param tname2tid The array that maps a tag name to its UID.
     * @param tid2tname The array that maps a tag id to its name.
     * @param nextTagId The id to be used the next time a tag is created.
    **/
    function db_saveTagFile($tname2tid, $tid2tname, $nextTagId)
    {
        global $CONSTS_FILE_TAGS;

        $handle = fopen($CONSTS_FILE_TAGS, "w");

        fprintf($handle, "<?php\n\$NEXT_TAG_ID=%u;\n\$TNAME_TO_TID=%s;\n\$TID_TO_TNAME=%s;\n?>\n", $nextTagId, var_export($tname2tid, true), var_export($tid2tname, true));
        fclose($handle);
    }

    /**
     * Save an array to a PHP file.
     *
     * @param array The array to be saved.
     * @param name  The name of the array.
     * @param file  The name of the file.
    **/
    function db_saveArray($name, $array, $filename)
    {
        $handle = fopen($filename, "w");

        fprintf($handle, "<?php\n\$%s=%s;\n?>\n", $name, var_export($array, true));
        fclose($handle);
    }

    /**
     * Create a new tid to bid file.
     *
     * @param tid2bid The array that maps a tag id to a number of bookmark id.
    **/
    function db_saveTidToBidFile($tid2bid)
    {
        global $CONSTS_FILE_TID_TO_BID;

        db_saveArray("TID_TO_BID", $tid2bid, $CONSTS_FILE_TID_TO_BID);
    }

    /**
     * Create a new bid to tid file.
     *
     * @param bid2tid The array that maps a bookmark id to a number of tag id.
    **/
    function db_saveBidToTidFile($bid2tid)
    {
        global $CONSTS_FILE_BID_TO_TID;

        db_saveArray("BID_TO_TID", $bid2tid, $CONSTS_FILE_BID_TO_TID);
    }

?>
