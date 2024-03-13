import React from 'react';

import { mockCommentDataAttributes1 } from 'api/comments/__mocks__/useComments';

import { screen, render } from 'utils/testUtils/rtl';

import CommentHeader from './CommentHeader';

describe('CommentHeader', () => {
  it("Shows 'unknown author' when user is deleted (authorId is null)", () => {
    render(
      <CommentHeader
        commentType="parent"
        commentAttributes={mockCommentDataAttributes1}
        authorId={null}
        userCanModerate={false}
      />
    );

    expect(screen.getByText('unknown author')).toBeInTheDocument();
  });
});
