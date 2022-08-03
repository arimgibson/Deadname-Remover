/*
https://stackoverflow.com/questions/33036487/one-liner-to-flatten-nested-object
I know there is probably an easy way to do this because I know the structure of the
incoming data, but ;this method is tried and true while being compact
*/
/* eslint-disable-next-line import/prefer-default-export */
export function flatten(yourObject) {
  return Object.assign({}, ...(function _flatten(o) { return [].concat(...Object.keys(o).map((k) => (typeof o[k] === 'object' ? _flatten(o[k]) : ({ [k]: o[k] })))); }(yourObject))); // eslint-disable-line @typescript-eslint/naming-convention
}
