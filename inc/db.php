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
    function db_saveTags($nextTid, $tname2tid, $tid2tname, $children, $parents)
    {
        global $CONSTS_FILE_TAGS;

        $handle = fopen($CONSTS_FILE_TAGS, "w");

        fprintf($handle, "<?php\n"
                                . "\$tags_nexttid=%u;  \n"
                                . "\$tags_parents=%s;  \n"
                                . "\$tags_children=%s; \n"
                                . "\$tags_tname2tid=%s;\n"
                                . "\$tags_tid2tname=%s;\n"
                            . "?>\n",
                    $nextTid, var_export($tname2tid, true), var_export($tid2tname, true), var_export($children, true), var_export($parents, true)
        );

        fclose($handle);
    }


    /**
     * Export tags to a JSON structure.
     *
     * @return A string containing the JSON structure.
    **/
    function db_exportTagsToJSON()
    {
        global $CONSTS_FILE_TAGS;

        include $CONSTS_FILE_TAGS;

        return "var tags = {"
                    . "next_tid: " . $tags_nexttid                . ","
                    . "id2name:  " . json_encode($tags_tid2tname) . ","
                    . "name2id:  " . json_encode($tags_tname2tid) . ","
                    . "parents:  " . json_encode($tags_parents)   . ","
                    . "children: " . json_encode($tags_children)  . ","
                . "};";
    }


    /**
     * Create a new tid to bid file.
     *
     * @param tid2bid The array that maps a tag id to a number of bookmark id.
    **/
    function db_saveT2B($t2b)
    {
        global $CONSTS_FILE_T2B;

        $handle = fopen($CONSTS_FILE_T2B, "w");

        fprintf($handle, "<?php\n"
                                . "\$T2B=%s;\n"
                            . "?>\n",
                    var_export($t2b, true)
        );

        fclose($handle);
    }

?>
