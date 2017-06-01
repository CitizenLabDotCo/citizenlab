import { fromJS } from 'immutable';
// import { SET_SETTINGS } from './constants';

const initialState = fromJS({
  settings: null,
});

function SettingsPageReducer(state = initialState, action) {
  switch (action.type) {
    /*
    case SET_SETTINGS: {
      const ids = action.payload.users.data.map((user) => user.id);

      return state
        .set('users', fromJS(ids))
        .set('prevPageNumber', prevPageNumber)
        .set('prevPageItemCount', prevPageItemCount)
        .set('currentPageNumber', currentPageNumber)
        .set('currentPageItemCount', currentPageItemCount)
        .set('nextPageNumber', nextPageNumber)
        .set('nextPageItemCount', nextPageItemCount)
        .set('loading', false)
        .set('loadingError', false);
    }
    */
    default:
      return state;
  }
}

export default SettingsPageReducer;
