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


    /**
     * Compare two string ignore the case.
     *
     * @param str1 The first string.
     * @param str2 The second string.
     *
     * @return The result of the lowercase comparison (-1, 0, or 1).
    **/
    my.lowercaseStrCmp = function(str1, str2)
    {
        return str1.toLowerCase().localeCompare(str2.toLowerCase());
    }


    return my;

}());
