var libtools = (function(){

    var my = {};

    my.jsfunc_htmlspecialchars = function(str)
    {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    return my;

}());
