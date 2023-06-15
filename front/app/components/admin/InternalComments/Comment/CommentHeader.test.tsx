import React from 'react';
import { screen, render } from 'utils/testUtils/rtl';
import CommentHeader from './CommentHeader';
import { mockCommentDataAttributes1 } from 'api/internal_comments/__mocks__/useComments';

describe('CommentHeader', () => {
  it("Shows 'unknown author' when user is deleted (authorId is null)", () => {
    render(
      <CommentHeader
        commentType="parent"
        commentAttributes={mockCommentDataAttributes1}
        authorId={null}
      />
    );

    expect(screen.getByText('unknown author')).toBeInTheDocument();
  });
});
