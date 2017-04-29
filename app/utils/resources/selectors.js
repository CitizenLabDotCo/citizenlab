
const selectResourcesDomain = (...types) => (state) => {
  let data = state.get('resources');
  types.map((type) => (data = data.get(type)));
  return data;
};

export {
  selectResourcesDomain,
};
