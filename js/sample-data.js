var rbm_tid_to_tname = {
     0: 'Games',
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
}

var rbm_tname_to_tid = {
    'Games':          0,
    'DS':            11,
    'PS3':           12,
    'Dark Souls':    13,
    'Borderlands 2': 24,
    'Code':          25,
    'C':             36,
    'C++':           47,
    'JavaScript':    48,
    'Python':        58,
    'Tools':         59,
}

var rbm_top_level_tid = Array(0, 25, 59);

var rbm_tid_children = {
     0: Array(11, 12),
    12: Array(24, 13),
    25: Array(36, 47, 48, 58),
}

var rbm_tid_parents = {
    11: 0,
    12: 0,
    13: 12,
    24: 12,
    36: 25,
    47: 25,
    48: 25,
    58: 25,
}
