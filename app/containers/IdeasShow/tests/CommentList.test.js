import React from 'react';
import Comments from '../CommentList';
import { mountWithIntl } from '../../../utils/intlTest';

describe('<CommentList />', () => {
  it('it should render the right number of comments', () => {
    const jestFn = jest.fn();
    const comment = {
      attributes: {
        body_multiloc: {
          en: 'anything',
        },
      },
      relationships: {
        parent: {},
      },
    };

    const comments = [];
    let i = 0;
    while (i < 3) {
      comments.push(comment);
      i += 1;
    }

    const idea = {};
    const commentContent = 'anything';
    const locale = 'en';

    const wrapper = mountWithIntl(<Comments
      comments={comments}
      storeCommentDraftCopy={jestFn}
      storeCommentError={null}
      submittingComment={false}
      resetEditorContent={false}
      idea={idea}
      commentContent={commentContent}
      userId={null}
      locale={locale}
      parentId={null}
      publishCommentClick={jestFn}
      isNotTest={false}
    />);

    // TODO: fix this test (after refactoring comments as a tree)
    expect(wrapper.find('Comment').length).toEqual(i);
  });
});
