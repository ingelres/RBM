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

        <script>
            <?php include("./js/sample-data.js"); ?>
            <?php include("./js/rbm.js"); ?>
        </script>

        <style>
            <?php include("./css/rbm.css"); ?>
        </style>
    </head>

    <body>

        <button onclick="jsfunc_explorerExpandAll()">Expand All</button>
        <button onclick="jsfunc_explorerCollapseAll()">Collapse All</button>

        <div id="css-explorer">
            <div id="css-explorer-item-25" class="css-explorer-item css-explorer-level-1" onclick="jsfunc_explorerSelectTag(25)">
                <div class="css-explorer-expand" onclick="jsfunc_explorerToggleTag(this, 25, 1)"></div>
                <div class="css-explorer-tag">Code</div>
            </div>
            <div id="css-explorer-item-0" class="css-explorer-item css-explorer-level-1" onclick="jsfunc_explorerSelectTag(0)">
                <div class="css-explorer-expand" onclick="jsfunc_explorerToggleTag(this, 0, 1)"></div>
                <div class="css-explorer-tag">Game</div>
            </div>
            <div id="css-explorer-item-59" class="css-explorer-item css-explorer-level-1" onclick="jsfunc_explorerSelectTag(59)">
                <div class="css-explorer-tag">Tools</div>
            </div>
        </div>

        <div id="css-footer">
            <?php echo sprintf(_("Version %s"), $CONSTS_VERSION), " / ", sprintf(_("Page generated in %u ms"), (microtime(true) - $startTime) * 1000); ?>
        </div>

    </body>

</html>
