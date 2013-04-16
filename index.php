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

        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
        <script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js"></script>
        <link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/themes/smoothness/jquery-ui.css" />

        <script>
            <?php include("./js/sample-data.js"); ?>
            <?php include("./js/libtags.js"); ?>
            <?php include("./js/rbm.js"); ?>
        </script>

        <style>
            <?php include("./css/rbm.css"); ?>
            <?php include("./css/jqueryui.css"); ?>
        </style>
    </head>

    <body>

        <button onclick="jsfunc_explorerExpandAll()">Expand All</button>
        <button onclick="jsfunc_explorerCollapseAll()">Collapse All</button>
        <input type="text" id="css-search-by-tag" onchange="jsfunc_explorerScrollToTag(this.value)" placeholder="<?=_("Type a tag name...")?>"/>

        <div id="css-explorer">
            <div id="css-explorer-item-25" class="css-explorer-item">
                <div class="css-explorer-handle"></div>
                <div id="css-explorer-item-25-expander" class="css-explorer-expander css-explorer-expand" onclick="jsfunc_onExplorerExpander($(this), 25)"></div>
                <div onclick="jsfunc_explorerSelectTag(25)">Code</div>
            </div>
            <div id="css-explorer-item-0" class="css-explorer-item">
                <div class="css-explorer-handle"></div>
                <div id="css-explorer-item-0-expander" class="css-explorer-expander css-explorer-expand" onclick="jsfunc_onExplorerExpander($(this), 0)"></div>
                <div onclick="jsfunc_explorerSelectTag(0)">Games</div>
            </div>
            <div id="css-explorer-item-59" class="css-explorer-item">
                <div class="css-explorer-handle"></div>
                <div id="css-explorer-item-59-expander" class="css-explorer-expander" onclick="jsfunc_onExplorerExpander($(this), 59)"></div>
                <div onclick="jsfunc_explorerSelectTag(59)">Tools</div>
            </div>
        </div>

        <div id="css-footer">
            <?php echo sprintf(_("Version %s"), $CONSTS_VERSION), " / ", sprintf(_("Page generated in %u ms"), (microtime(true) - $startTime) * 1000); ?>
        </div>

    </body>

</html>
