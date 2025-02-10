const getKey = (scope: string) => {
  const split = scope.split('/');
  return split[split.length - 1];
};

export default getKey;
