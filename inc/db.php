<?php

    require_once $RBM_BASE_DIR . "/inc/consts.php";


    /**
     * Create a new tag file.
     *
     * @param nextTid   The id to be used the next time a tag is created.
     * @param tname2tid Mapping name -> id.
     * @param tid2tname Mapping id -> name.
     * @param children  Mapping id -> children.
     * @param parents   Mapping id -> ptid.
    **/
    function db_saveTagFile($nextTid, $tname2tid, $tid2tname, $children, $parents)
    {
        global $CONSTS_FILE_TAGS;

        $handle = fopen($CONSTS_FILE_TAGS, "w");

        fprintf($handle, "<?php\n \$tags_nexttid=%u;\n \$tags_tname2tid=%s;\n \$tags_tid2tname=%s;\n \$tags_children=%s;\n \$tags_parents=%s;\n ?>\n",
                    $nextTid, var_export($tname2tid, true), var_export($tid2tname, true), var_export($children, true), var_export($parents, true));

        fclose($handle);
    }


    /**
     * Export tags to a JSON structure.
     *
     * @return A string containing the JSON structure.
    **/
    function db_exportTagToJSON()
    {
        global $CONSTS_FILE_TAGS;

        include $CONSTS_FILE_TAGS;

        return "var tags = {"
                    . "next_tid: "     . $tags_nexttid                . ","
                    . "tid_to_tname: " . json_encode($tags_tid2tname) . ","
                    . "tname_to_tid: " . json_encode($tags_tname2tid) . ","
                    . "parents:      " . json_encode($tags_parents)   . ","
                    . "children:     " . json_encode($tags_children)  . ","
                . "};";
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
