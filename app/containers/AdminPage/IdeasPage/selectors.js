// import { createSelector } from 'reselect';

const selectIdeasIds = (state) => state.getIn(['ideasPage', 'ideas', 'ids']);
const selectIdeasLoading = (state) => state.getIn(['ideasPage', 'ideas', 'loading']);
const selectIdeasLoadError = (state) => state.getIn(['ideasPage', 'ideas', 'error']);
const selectIdeasLoaded = (state) => state.getIn(['ideasPage', 'ideas', 'loaded']);
const selectFirstPageNumber = (state) => state.getIn(['ideasPage', 'firstPageNumber']);
const selectFirstPageItemCount = (state) => state.getIn(['ideasPage', 'firstPageItemCount']);
const selectPrevPageNumber = (state) => state.getIn(['ideasPage', 'prevPageNumber']);
const selectPrevPageItemCount = (state) => state.getIn(['ideasPage', 'prevPageItemCount']);
const selectCurrentPageNumber = (state) => state.getIn(['ideasPage', 'currentPageNumber']);
const selectCurrentPageItemCount = (state) => state.getIn(['ideasPage', 'currentPageItemCount']);
const selectNextPageNumber = (state) => state.getIn(['ideasPage', 'nextPageNumber']);
const selectNextPageItemCount = (state) => state.getIn(['ideasPage', 'nextPageItemCount']);
const selectLastPageNumber = (state) => state.getIn(['ideasPage', 'lastPageNumber']);
const selectLastPageItemCount = (state) => state.getIn(['ideasPage', 'lastPageItemCount']);
const selectPageCount = (state) => state.getIn(['ideasPage', 'pageCount']);

export {
  selectIdeasIds,
  selectIdeasLoading,
  selectIdeasLoadError,
  selectIdeasLoaded,
  selectFirstPageNumber,
  selectFirstPageItemCount,
  selectPrevPageNumber,
  selectPrevPageItemCount,
  selectCurrentPageNumber,
  selectCurrentPageItemCount,
  selectNextPageNumber,
  selectNextPageItemCount,
  selectLastPageNumber,
  selectLastPageItemCount,
  selectPageCount,
};
