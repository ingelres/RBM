<?php

    $startTime = microtime(true);

    // Base directory of the website
    $RBM_BASE_DIR = __DIR__;

    require_once $RBM_BASE_DIR . "/inc/init.php";
    require_once $RBM_BASE_DIR . "/inc/consts.php";

    // Debug mode
    if($CONSTS_DEBUG_MODE)
    {
        ini_set('display_errors', 1);
        ini_set('error_reporting', E_ALL);
    }

    // Init our data directory
    $error = init_initDataDir();

    if(!is_null($error))
    {
        // FIXME Do something smarter to display errors (there may be other ones later on)
        echo $error;
    }

?>

<!DOCTYPE html>
<html>

    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>RBM</title>

        <link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/themes/smoothness/jquery-ui.css" />
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
        <script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js"></script>

        <script>
            <?php include("./js/sample-data.js"); include("./js/libtags.js"); include("./js/libexp.js"); include("./js/rbm.js"); ?>
        </script>

        <style>
            <?php include("./css/rbm.css"); include("./css/jqueryui.css"); ?>
        </style>
    </head>

    <body>

        <button onclick="libexp.jsfunc_expandAll()">Expand All</button>
        <button onclick="libexp.jsfunc_collapseAll()">Collapse All</button>
        <input type="text" id="css-search-by-tag" onchange="libexp.jsfunc_showAndSelectTag(this.value)" placeholder="<?=_("Type a tag name...")?>"/>

        <div id="css-explorer">
            <div id="css-explorer-item-25" class="css-explorer-item">
                <div class="css-explorer-handle"></div>
                <div id="css-explorer-expander-25" class="css-explorer-expander css-explorer-expand" onclick="libexp.jsfunc_onExpanderClick(25)"></div>
                <div onclick="libexp.jsfunc_selectTag(25)">Code</div>
            </div>
            <div id="css-explorer-item-0" class="css-explorer-item">
                <div class="css-explorer-handle"></div>
                <div id="css-explorer-expander-0" class="css-explorer-expander css-explorer-expand" onclick="libexp.jsfunc_onExpanderClick(0)"></div>
                <div onclick="libexp.jsfunc_selectTag(0)">Games</div>
            </div>
            <div id="css-explorer-item-59" class="css-explorer-item">
                <div class="css-explorer-handle"></div>
                <div id="css-explorer-expander-59" class="css-explorer-expander" onclick="libexp.jsfunc_onExpanderClick(59)"></div>
                <div onclick="libexp.jsfunc_selectTag(59)">Tools</div>
            </div>
        </div>

        <div id="css-footer">
            <?php echo sprintf(_("Version %s"), $CONSTS_VERSION), " / ", sprintf(_("Page generated in %u ms"), (microtime(true) - $startTime) * 1000); ?>
        </div>

    </body>

</html>
