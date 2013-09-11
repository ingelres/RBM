<?php

    $startTime = microtime(true);

    // Base directory of the website
    $RBM_BASE_DIR = __DIR__;

    require_once $RBM_BASE_DIR . "/inc/db.php";
    require_once $RBM_BASE_DIR . "/inc/init.php";
    require_once $RBM_BASE_DIR . "/inc/consts.php";

    // Debug mode
    if($CONSTS_DEBUG_MODE)
    {
        ini_set("display_errors", 1);
        ini_set("error_reporting", E_ALL);
    }

    // Init our data directory
    $initErr = init_initDataDir();

    // Additional HTTP headers
    header("Content-Type: text/html; charset=UTF-8");

?>

<!DOCTYPE html>
<html>

    <head>
        <title>RBM</title>

        <link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/themes/smoothness/jquery-ui.css" />
        <script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
        <script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js"></script>

        <script type="text/javascript">

            <?php

                include("./inc/l10n.php");
                include("./js/libajax.js");
                include("./js/libtools.js");
                include("./js/libsysmsg.js");

                // Pass any initialization error to the JS code
                if(is_null($initErr))
                {
                    echo "var INIT_ERR = null;";

                    echo db_exportTagToJSON();

                    include("./js/libtags.js");
                    include("./js/libsearch.js");
                    include("./js/libexp.js");
                }
                else
                    echo "var INIT_ERR = \"$initErr\";";

                include("./js/rbm.js");

            ?>
        </script>

        <style>
            <?php include("./css/rbm.css"); include("./css/jqueryui.css"); ?>
        </style>
    </head>

    <body>

        <button onclick="libexp.expandAll()">Expand All</button>
        <button onclick="libexp.collapseAll()">Collapse All</button>
        <input type="text" id="css-search-by-tag" placeholder="<?=_("Type a tag name...")?>"/>

        <div id="css-content">

            <!-- Tag explorer: Only the root tag is statically created -->
            <div id="css-explorer">
                <div id="css-explorer-item-0" class="css-explorer-item">
                    <div class="css-explorer-toolbox"></div>
                    <div class="css-explorer-tag-name css-explorer-root"><?=_("List of Tags")?></div>
                </div>
            </div>

            <!-- List of bookmarks -->
            <div id="css-bookmarks">
                Bookmarks
            </div>

        </div>

        <div id="css-footer">
            <?php echo sprintf(_("Version %s"), $CONSTS_VERSION), " / ", sprintf(_("Page generated in %u ms"), (microtime(true) - $startTime) * 1000); ?>
        </div>

        <!-- The tag toolbox popup -->
        <ul id="css-explorer-toolbox-popup" class="popup-menu">
            <li id="css-explorer-toolbox-create"></li>
            <li id="css-explorer-toolbox-rename"><?=_("Rename Tag")?></li>
            <li id="css-explorer-toolbox-delete"><?=_("Delete Tag")?></li>
        </ul>

        <!-- The dialog box for renaming a tag -->
        <div id="css-explorer-dialog-rename">
            <?=_("Tag name:")?><br />
            <input type="text" id="css-explorer-tag-new-name" /><br />
        </div>

        <!-- The dialog box for confirmation when deleting a tag -->
        <div id="css-explorer-dialog-delete" title="<?=_("Delete tag")?>">
            <div id="css-explorer-dialog-delete-msg"></div>
        </div>

    </body>

</html>
