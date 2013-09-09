<?php

    function getIntParam($name, $default = null)
    {
        if(isset($_GET[$name]) && is_numeric($_GET[$name]))
            return intval($_GET[$name]);

        if($default != null)
            return $default;

        die('Invalid parameters');
    }

    function getStringParam($name, $default = null)
    {
        if(isset($_GET[$name]))
            return $_GET[$name];

        if($default != null)
            return $default;

        die('Invalid parameters');
    }

?>
