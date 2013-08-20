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
        global $CONSTS_DIR_DATA, $CONSTS_FILE_TAGS, $CONSTS_FILE_TID_TO_BID, $CONSTS_FILE_BID_TO_TID;

        if(!is_writable($CONSTS_DIR_DATA))
        {
                 if(file_exists($CONSTS_DIR_DATA))  return sprintf(_("Directory '%s' is not writable"), $CONSTS_DIR_DATA);
            else if(!mkdir($CONSTS_DIR_DATA, 0755)) return sprintf(_("Could not create directory '%s', please check file permissions"), $CONSTS_DIR_DATA);
        }

        if(file_exists($CONSTS_FILE_TAGS))
        {
            // Only check for correct permissions on the file that store the list of tags
            // We assume that if permissions are correct for this file, they are correct as well for the other files
            if(!is_readable($CONSTS_FILE_TAGS) || !is_writable($CONSTS_FILE_TAGS))
                return sprintf(_("File '%s' is either not readable or not writable"), $CONSTS_FILE_TAGS);
        }
        else
        {
            // Create all the data files
            db_saveTidToBidFile(array());
            db_saveBidToTidFile(array());
            db_saveTagFile(1, array(), array(), array(), array());
        }

        return NULL;
    }

?>
