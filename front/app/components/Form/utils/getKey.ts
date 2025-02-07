import { ExtendedUISchema } from '../typings';

const getKey = (element: ExtendedUISchema) => {
  const split = element.scope.split('/');
  return split[split.length - 1];
};

export default getKey;
