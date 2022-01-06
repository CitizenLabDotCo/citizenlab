// Requirements : multiloc fields must en with _multiloc, you can't nest multilocs.

import { isString } from 'lodash-es';

export function getFieldNameFromPath(val: string) {
  const pathChuncks = val.split('.');
  if (pathChuncks.length <= 1) {
    return val;
  } else {
    return (
      pathChuncks.find((chunck) => chunck.endsWith('_multiloc')) ||
      pathChuncks[pathChuncks.length - 1]
    );
  }
}

export const getLabel = (uischema, schema, path) =>
  isString(uischema?.label)
    ? uischema.label
    : isString(schema?.title)
    ? schema.title
    : getFieldNameFromPath(path);
