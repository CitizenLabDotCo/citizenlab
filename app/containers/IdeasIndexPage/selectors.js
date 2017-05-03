
/**
* Direct selector to the ideasIndexPage state domain
*/

const selectIdeasIndexPageDomain = (...types) => (state) => {
  let data = state.get('ideasIndexPage');
  types.map((type) => (data = data.get(type)));
  return data;
};

export default selectIdeasIndexPageDomain;

