<?php

    require_once $RBM_BASE_DIR . "/inc/db.php";
    require_once $RBM_BASE_DIR . "/inc/consts.php";


    /**
     * Create the data directory if needed and check file permissions.
     *
     * @return An error message if something bad occurred, NULL otherwise.
    **/
    function init_initDataDir()
    {
        global $CONSTS_DIR_DATA, $CONSTS_DIR_BOOKMARKS, $CONSTS_FILE_TAGS, $CONSTS_FILE_T2B;

        if(!is_writable($CONSTS_DIR_DATA))
        {
                 if(file_exists($CONSTS_DIR_DATA))  return sprintf(_("Directory '%s' is not writable"), $CONSTS_DIR_DATA);
            else if(!mkdir($CONSTS_DIR_DATA, 0755)) return sprintf(_("Could not create directory '%s'<br/>Please check file permissions"), $CONSTS_DIR_DATA);
        }

        if(file_exists($CONSTS_FILE_TAGS))
        {
            // Only check for correct permissions on the file that stores the tags
            // We assume that if permissions are correct for this file, they are correct as well for the other files
            if(!is_readable($CONSTS_FILE_TAGS) || !is_writable($CONSTS_FILE_TAGS))
                return sprintf(_("File '%s' is either not readable or not writable"), $CONSTS_FILE_TAGS);
        }
        else
        {
            // Create the bookmark directory
            mkdir($CONSTS_DIR_BOOKMARKS, 0755);

            // Create the data files
            db_saveT2B(1, array());
            db_saveTags(1, array(), array(), array(), array());
        }

        return NULL;
    }

?>
