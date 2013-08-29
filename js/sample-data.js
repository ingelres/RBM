var tags = {

    next_tid: 100,

    tid_to_tname : {
         5: 'Games',
        11: 'DS',
        12: 'PS3',
        13: 'Dark Souls',
        24: 'Borderlands 2',
        25: 'Code',
        36: 'C',
        47: 'C++',
        48: 'JavaScript',
        58: 'Python',
        59: 'Tools',
    },

    tname_to_tid : {
        'games':          5,
        'ds':            11,
        'ps3':           12,
        'dark souls':    13,
        'borderlands 2': 24,
        'code':          25,
        'c':             36,
        'c++':           47,
        'javascript':    48,
        'python':        58,
        'tools':         59,
    },

    children : {
         0: [25, 5, 59],
         5: [11, 12],
        12: [24, 13],
        25: [36, 47, 48, 58],
    },

    parents : {
         5:  0,
        11:  5,
        12:  5,
        13: 12,
        24: 12,
        25:  0,
        36: 25,
        47: 25,
        48: 25,
        58: 25,
        59:  0,
    },
};
