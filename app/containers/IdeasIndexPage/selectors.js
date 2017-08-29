
/**
* Direct selector to the ideasIndexPage state domain
*/

const selectIdeasIndexPageDomain = (...types) => (state) => state.getIn(['ideasIndexPage', ...types]);

export default selectIdeasIndexPageDomain;

