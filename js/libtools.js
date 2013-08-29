var libtools = (function(){

    var my = {};

    /**
     * Escape special HTML characters (similar to PHP htmlspecialchars()).
     *
     * @param str The string to be escaped.
     *
     * @return The escaped string.
    **/
    my.htmlspecialchars = function(str)
    {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    return my;

}());
