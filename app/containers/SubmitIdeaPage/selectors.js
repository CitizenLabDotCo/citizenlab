import { createSelector } from 'reselect';

const selectSubmitIdea = (state) => state.get('submitIdea');

const makeSelectLoading = () => createSelector(
  selectSubmitIdea,
  (submitIdeaState) => submitIdeaState.getIn(['draft', 'loading'])
);

const makeSelectLoadError = () => createSelector(
  selectSubmitIdea,
  (submitIdeaState) => submitIdeaState.getIn(['draft', 'loadError'])
);

const makeSelectStoreError = () => createSelector(
  selectSubmitIdea,
  (submitIdeaState) => submitIdeaState.getIn(['draft', 'storeError'])
);

const makeSelectContent = () => createSelector(
  selectSubmitIdea,
  (submitIdeaState) => submitIdeaState.getIn(['draft', 'content'])
);

const makeSelectStored = () => createSelector(
  selectSubmitIdea,
  (submitIdeaState) => submitIdeaState.getIn(['draft', 'stored'])
);

export {
  makeSelectLoading,
  makeSelectLoadError,
  makeSelectStoreError,
  makeSelectContent,
  makeSelectStored,
};
