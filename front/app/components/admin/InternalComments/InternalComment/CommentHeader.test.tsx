import React from 'react';

import { mockCommentDataAttributes1 } from 'api/internal_comments/__mocks__/useInternalComments';

import { screen, render } from 'utils/testUtils/rtl';

import InternalCommentHeader from './InternalCommentHeader';

describe('CommentHeader', () => {
  it("Shows 'unknown author' when user is deleted (authorId is null)", () => {
    render(
      <InternalCommentHeader
        commentType="parent"
        commentAttributes={mockCommentDataAttributes1}
        authorId={null}
      />
    );

    expect(screen.getByText('unknown author')).toBeInTheDocument();
  });
});
