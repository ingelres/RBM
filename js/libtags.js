function jsfunc_tidIsDescendant(tid, ptid)
{
    while(true)
    {
        parentTid = rbm_tid_parents[tid];

             if(parentTid == ptid)      return true;
        else if(parentTid == undefined) return false;
        else                            tid = parentTid;
    }
}
