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
            <?php include("./js/rbm.js"); ?>
        </script>

        <style>
            <?php include("./css/rbm.css"); ?>
        </style>
    </head>

    <body>

        <button onClick="jsfunc_addTag()">Add Tag</button>
        <button onClick="jsfunc_deleteTag()">Delete Tag</button>

        <div id="css-footer">

            <?php echo sprintf(_("Page generated in %u ms"), (microtime(true) - $startTime) * 1000); ?>

        </div>

    </body>

</html>
