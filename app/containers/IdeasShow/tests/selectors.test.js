import { fromJS } from 'immutable';
import { makeSelectComments } from '../selectors';
import { generateResourcesCommentValue } from './__shared.test';

describe('commentsSelector', () => {
  it('should select comments based on id-comments map', () => {
    const commentsSelector = makeSelectComments();
    const commentIds = [
      '0ac086c7-2444-42f9-9014-d2ef67846bfe',
      '95da75a6-8268-4302-bddf-80959695aef6',
    ];

    const ideasShowState = {
      // page name nested for proper conversion by fromJS
      ideasShow: {
        comments: commentIds,
      },
    };

    const resourcesState = {
      global: {
        resources: {
          comments: { },
        },
      },
    };
    resourcesState.global.resources.comments[commentIds[0]] = generateResourcesCommentValue(commentIds[0]);
    resourcesState.global.resources.comments[commentIds[1]] = generateResourcesCommentValue(commentIds[1]);
    // TODO: fix this test (resources results undefined in selector when run from within the test)
    expect(commentsSelector(fromJS(ideasShowState), fromJS(resourcesState))).toEqual(resourcesState);
  });
});
