type Names = {
  first: NamesKind,
  middle: NamesKind,
  last: NamesKind
};

type NamesKind = {
  [key: string]: string
};

function createNameRegExp(names: NamesKind): RegExp {
  if (!Object.keys(names).length) return null; // i.e. if there are no names of that kind
  const keys = Object.keys(names);
  const singleRegExps = keys.map((i) => `\\b${i}\\b`);
  const combinedRegExps = singleRegExps.join('|');
  return new RegExp(combinedRegExps, 'gi');
}

// Will not be hardcoded as shown right now, will be loaded from extension settings
export const names: Names = {
  first: {
    jack: 'jackie',
    isabella: 'aaron',
  },
  middle: {},
  last: {
    smith: 'miller',
  },
};

export const deadnames = {
  first: createNameRegExp(names.first),
  middle: createNameRegExp(names.middle),
  last: createNameRegExp(names.last),
};
