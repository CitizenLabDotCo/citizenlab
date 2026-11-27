import React, { lazy, memo, Suspense } from 'react';

import styled from 'styled-components';

import { loadOfficialFeedbackForm } from './moderatorParts';
import OfficialFeedbackFeed from './OfficialFeedbackFeed';

const OfficialFeedbackForm = lazy(loadOfficialFeedbackForm);

interface Props {
  postId: string;
  permissionToPost: boolean | undefined;
  a11y_pronounceLatestOfficialFeedbackPost?: boolean;
  className?: string;
  variant?: 'default' | 'panel';
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
      const feed = (
        <OfficialFeedbackFeed
          postId={postId}
          editingAllowed={permissionToPost}
          variant={variant}
          a11y_pronounceLatestOfficialFeedbackPost={
            a11y_pronounceLatestOfficialFeedbackPost
          }
        />
      );

      return (
        <Container className={className || ''}>
          {/* The back-office panel shows what was published above the form. */}
          {variant === 'panel' && feed}
          {permissionToPost && (
            <Suspense fallback={null}>
              <OfficialFeedbackForm
                formType="new"
                postId={postId}
                variant={variant}
              />
            </Suspense>
          )}

          {variant !== 'panel' && feed}
        </Container>
      );
    }

    return null;
  }
);

export default OfficialFeedback;
