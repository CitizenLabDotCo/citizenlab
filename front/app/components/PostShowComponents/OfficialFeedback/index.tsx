import React, { memo } from 'react';

// components
import OfficialFeedbackForm from './OfficialFeedbackForm';
import OfficialFeedbackFeed from './OfficialFeedbackFeed';

// stylings
import styled from 'styled-components';

interface Props {
  postId: string;
  postType: 'idea' | 'initiative';
  permissionToPost: boolean | undefined;
  a11y_pronounceLatestOfficialFeedbackPost?: boolean;
  className?: string;
}

const Container = styled.div``;

const OfficialFeedback = memo<Props>(
  ({
    postId,
    postType,
    permissionToPost,
    a11y_pronounceLatestOfficialFeedbackPost,
    className,
  }) => {
    if (typeof permissionToPost === 'boolean') {
      return (
        <Container className={className || ''}>
          {permissionToPost && (
            <OfficialFeedbackForm
              formType="new"
              postId={postId}
              postType={postType}
            />
          )}

          <OfficialFeedbackFeed
            postId={postId}
            postType={postType}
            editingAllowed={permissionToPost}
            a11y_pronounceLatestOfficialFeedbackPost={
              a11y_pronounceLatestOfficialFeedbackPost
            }
          />
        </Container>
      );
    }

    return null;
  }
);

export default OfficialFeedback;
