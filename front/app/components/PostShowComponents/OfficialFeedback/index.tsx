import React, { memo } from 'react';
import { isBoolean } from 'lodash-es';

// resource hooks
import useLocale from 'hooks/useLocale';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

// components
import OfficialFeedbackForm from './OfficialFeedbackForm';
import OfficialFeedbackFeed from './OfficialFeedbackFeed';

// utils
import { isNilOrError } from 'utils/helperUtils';

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
    const locale = useLocale();
    const tenantLocales = useAppConfigurationLocales();

    if (
      isBoolean(permissionToPost) &&
      !isNilOrError(locale) &&
      !isNilOrError(tenantLocales)
    ) {
      return (
        <Container className={className || ''}>
          {permissionToPost && (
            <OfficialFeedbackForm
              locale={locale}
              tenantLocales={tenantLocales}
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
