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

const makeSelectSubmitting = () => createSelector(
  selectSubmitIdea,
  (submitIdeaState) => submitIdeaState.getIn(['draft', 'submitting'])
);

const makeSelectSubmitError = () => createSelector(
  selectSubmitIdea,
  (submitIdeaState) => submitIdeaState.getIn(['draft', 'submitError'])
);

const makeSelectSubmitted = () => createSelector(
  selectSubmitIdea,
  (submitIdeaState) => submitIdeaState.getIn(['draft', 'submitted'])
);

const makeSelectLongTitleError = () => createSelector(
  selectSubmitIdea,
  (submitIdeaState) => submitIdeaState.getIn(['draft', 'longTitleError'])
);

const makeSelectShortTitleError = () => createSelector(
  selectSubmitIdea,
  (submitIdeaState) => submitIdeaState.getIn(['draft', 'shortTitleError'])
);

const makeSelectTitleLength = () => createSelector(
  selectSubmitIdea,
  (submitIdeaState) => submitIdeaState.getIn(['draft', 'titleLength'])
);

const makeSelectAttachments = () => createSelector(
  selectSubmitIdea,
  (submitIdeaState) => submitIdeaState.getIn(['draft', 'attachments'])
);

const makeSelectStoreAttachmentError = () => createSelector(
  selectSubmitIdea,
  (submitIdeaState) => submitIdeaState.getIn(['draft', 'storeAttachmentError'])
);

const makeSelectImages = () => createSelector(
  selectSubmitIdea,
  (submitIdeaState) => submitIdeaState.getIn(['draft', 'images'])
);

const makeSelectStoreImageError = () => createSelector(
  selectSubmitIdea,
  (submitIdeaState) => submitIdeaState.getIn(['draft', 'storeImageError'])
);

const makeSelectTitle = () => createSelector(
  selectSubmitIdea,
  (submitIdeaState) => submitIdeaState.getIn(['draft', 'title'])
);

export {
  makeSelectLoading,
  makeSelectLoadError,
  makeSelectStoreError,
  makeSelectContent,
  makeSelectStored,
  makeSelectSubmitting,
  makeSelectSubmitError,
  makeSelectSubmitted,
  makeSelectLongTitleError,
  makeSelectShortTitleError,
  makeSelectTitleLength,
  makeSelectAttachments,
  makeSelectStoreAttachmentError,
  makeSelectImages,
  makeSelectStoreImageError,
  makeSelectTitle,
};
