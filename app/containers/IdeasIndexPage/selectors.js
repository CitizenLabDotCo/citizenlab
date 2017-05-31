
/**
* Direct selector to the ideasIndexPage state domain
*/

const selectIdeasIndexPageDomain = (...types) => (state) => state.getIn(['ideasIndex', ...types]);

export default selectIdeasIndexPageDomain;

