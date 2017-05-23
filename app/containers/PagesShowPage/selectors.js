import { createSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';
import { fromJS } from 'immutable';

const selectPagesShowPage = (state) => state.get('pagesShowPage');

const makeSelectPage = () => createSelector(
  selectPagesShowPage,
  selectResourcesDomain(),
  (pageState, resources) => {
    const id = pageState.get('page', fromJS(null));
    const pages = resources.get('pages', fromJS({}));
    return pages && pages.get(id);
  }
);

export default selectPagesShowPage;
export {
  makeSelectPage,
};
