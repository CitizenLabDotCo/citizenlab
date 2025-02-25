import { getFieldNameFromPath } from 'utils/JSONFormUtils';

// TODO: Replace getKey with getFieldNameFromPath
const getKey = (scope: string) => {
  return getFieldNameFromPath(scope);
};

export default getKey;
