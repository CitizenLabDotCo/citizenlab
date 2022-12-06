import React, { memo } from 'react';
// stylings
import styled from 'styled-components';
import { isBoolean } from 'lodash-es';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
// resource hooks
import useLocale from 'hooks/useLocale';
// utils
import { isNilOrError } from 'utils/helperUtils';
import OfficialFeedbackFeed from './OfficialFeedbackFeed';
// components
import OfficialFeedbackForm from './OfficialFeedbackForm';

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
