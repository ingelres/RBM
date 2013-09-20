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
                    $nextTid, var_export($parents, true), var_export($children, true), var_export($tname2tid, true), var_export($tid2tname, true)
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
     * @param nextBid The id to be used the next time a bookmark is created.
     * @param t2b     The array that maps a tag id to a number of bookmark id.
    **/
    function db_saveT2B($nextBid, $t2b)
    {
        global $CONSTS_FILE_T2B;

        $handle = fopen($CONSTS_FILE_T2B, "w");

        fprintf($handle, "<?php\n"
                                . "\$nextbid=%u; \n"
                                . "\$t2b=%s;     \n"
                            . "?>\n",
                    $nextBid, var_export($t2b, true)
        );

        fclose($handle);
    }


    /**
     * Save a bookmark.
     *
     * @param bid  Bookmark id.
     * @param url  Bookmark URL.
     * @param name Bookmark name.
     * @param tags An array of tag id.
    **/
    function db_saveBookmark($bid, $url, $name, $tags)
    {
        global $CONSTS_DIR_BOOKMARKS, $CONSTS_BOOKMARKS_PER_DIR;

        $subdir = $CONSTS_DIR_BOOKMARKS . "/" . (string)(int)($bid / $CONSTS_BOOKMARKS_PER_DIR);

        if(!file_exists($subdir))
            mkdir($subdir);

        $bookmark["url"]  = $url;
        $bookmark["name"] = $name;
        $bookmark["tags"] = $tags;

        $handle = fopen($subdir . "/" . (string)$bid, "w");

        fprintf($handle, "<?php\n"
                                . "\$b=%s; \n"
                            . "?>\n",
                    var_export($bookmark, true)
        );

        fclose($handle);
    }


    /**
     * Load the given bookmark.
     *
     * @param bid The bookmark id.
     *
     * @return The bookmark.
    **/
    function db_loadBookmark($bid)
    {
        global $CONSTS_DIR_BOOKMARKS, $CONSTS_BOOKMARKS_PER_DIR;

        include $CONSTS_DIR_BOOKMARKS . "/" . (string) (int) ($bid / $CONSTS_BOOKMARKS_PER_DIR) . "/" . (string) $bid;

        return $b;
    }

?>
