function jsfunc_tidIsDescendant(tid, ptid)
{
    while((tid = rbm_tid_parents[tid]) != undefined)
    {
        if(tid == ptid)
            return true;
    }

    return false;
}

function jsfunc_getHierarchy(tid)
{
    var hierarchy = [];

    while((tid = rbm_tid_parents[tid]) != undefined)
        hierarchy.push(tid);

    return hierarchy.reverse();
}
