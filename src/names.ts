import { Names } from './types';
import { flatten } from './helpers';

function createNameRegExp(names: Names): RegExp {
  const namesObj = flatten(names);
  if (!Object.keys(namesObj).length) return null; // i.e. if there are no names
  const keys = Object.keys(namesObj);
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

export const deadnames = createNameRegExp(names);
