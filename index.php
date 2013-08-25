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
    $error = init_initDataDir();

    if(!is_null($error))
    {
        // FIXME Do something smarter to display errors (there may be other ones later on)
        echo $error;
    }

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

                echo db_exportTagToJSON();

                include("./inc/l10n.php");
                include("./js/libtools.js");
                include("./js/libsysmsg.js");
                include("./js/libajax.js");
                include("./js/libtags.js");
                include("./js/libsearch.js");
                include("./js/libexp.js");
                include("./js/rbm.js");

            ?>
        </script>

        <style>
            <?php include("./css/rbm.css"); include("./css/jqueryui.css"); ?>
        </style>
    </head>

    <body>

        <button onclick="libexp.jsfunc_expandAll()">Expand All</button>
        <button onclick="libexp.jsfunc_collapseAll()">Collapse All</button>
        <input type="text" id="css-search-by-tag" placeholder="<?=_("Type a tag name...")?>"/>

        <div id="css-explorer">
            <!-- Root tag, the top-level tags are created dynamically by the JS code -->
            <div id="css-explorer-item-0" class="css-explorer-item">
                <div class="css-explorer-placeholder"></div>
                <div class="css-explorer-toolbox"></div>
                <div class="css-explorer-tag-name">Root</div>
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
            <div id="css-explorer-dialog-rename-errmsg" class="css-dialog-errmsg">Error</div>
        </div>

        <!-- The dialog box for confirmation when deleting a tag -->
        <div id="css-explorer-dialog-delete" title="<?=_("Delete tag")?>">
            <div id="css-explorer-dialog-delete-msg"></div>
        </div>

    </body>

</html>
