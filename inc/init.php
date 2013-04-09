<?php

    require_once "./inc/consts.php";

    /**
     * Create the data directory if needed and check file permissions.
     *
     * @return An error message if something bad occurred, NULL otherwise.
    **/
    function init_initDataDir()
    {
        if(!is_writable(Consts::DIR_DATA))
        {
                 if(file_exists(Consts::DIR_DATA))  return sprintf(_("Directory '%s' is not writable"), Consts::DIR_DATA);
            else if(!mkdir(Consts::DIR_DATA, 0755)) return sprintf(_("Could not create directory '%s', please check file permissions"), Consts::DIR_DATA);
        }

        // Only check for correct permissions on the file that store the tags
        // We assume that if permissions are correct for this file, they will be correct as well for the other files in the data directory
        if(file_exists(Consts::FILE_TAGS) && (!is_readable(Consts::FILE_TAGS) || !is_writable(Consts::FILE_TAGS)))
            return sprintf(_("File '%s' is either not readable or not writable"), realpath(Consts::FILE_TAGS));

        return NULL;
    }

?>
