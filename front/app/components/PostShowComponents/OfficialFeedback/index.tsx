import React, { memo } from 'react';

import styled from 'styled-components';

import OfficialFeedbackFeed from './OfficialFeedbackFeed';
import OfficialFeedbackForm from './OfficialFeedbackForm';

interface Props {
  postId: string;
  permissionToPost: boolean | undefined;
  a11y_pronounceLatestOfficialFeedbackPost?: boolean;
  className?: string;
  variant?: 'default' | 'bo';
}

const Container = styled.div``;

const OfficialFeedback = memo<Props>(
  ({
    postId,
    permissionToPost,
    a11y_pronounceLatestOfficialFeedbackPost,
    className,
    variant,
  }) => {
    if (typeof permissionToPost === 'boolean') {
      return (
        <Container className={className || ''}>
          {permissionToPost && (
            <OfficialFeedbackForm
              formType="new"
              postId={postId}
              variant={variant}
            />
          )}

          <OfficialFeedbackFeed
            postId={postId}
            editingAllowed={permissionToPost}
            variant={variant}
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
