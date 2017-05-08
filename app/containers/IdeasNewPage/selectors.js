import { createSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';

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

const makeSelectTopics = () => createSelector(
  selectSubmitIdea,
  selectResourcesDomain(),
  (submitIdeaState, resources) => {
    const ids = submitIdeaState.getIn(['topics', 'ids']);
    const topics = resources.get('topics');
    if (topics) console.log(topics.toJS());
    console.log(`
      select topics for ${ids}
    `, topics);
    return (ids
      ? ids.map((id) => topics[id])
      : []);
  }
);

const makeSelectAreas = () => createSelector(
  selectSubmitIdea,
  selectResourcesDomain(),
  (submitIdeaState, resources) => {
    const ids = submitIdeaState.getIn(['areas', 'ids']);
    const areas = resources.get('areas');
    console.log('areas', areas);
    return ids.map((id) => areas[id]);
  }
);

const makeSelectLoadTopicsError = () => createSelector(
  selectSubmitIdea,
  (submitIdeaState) => submitIdeaState.getIn(['topics', 'error'])
);

const makeSelectLoadingTopics = () => createSelector(
  selectSubmitIdea,
  (submitIdeaState) => submitIdeaState.getIn(['topics', 'loading'])
);

const makeSelectLoadingAreas = () => createSelector(
  selectSubmitIdea,
  (submitIdeaState) => submitIdeaState.getIn(['areas', 'loading'])
);

const makeSelectLoadAreasError = () => createSelector(
  selectSubmitIdea,
  (submitIdeaState) => submitIdeaState.getIn(['topics', 'error'])
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
  makeSelectTopics,
  makeSelectLoadTopicsError,
  makeSelectAreas,
  makeSelectLoadAreasError,
  makeSelectLoadingTopics,
  makeSelectLoadingAreas,
};
