import React from 'react';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styles
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// hooks
import useInitiativeReviewRequired from 'hooks/useInitiativeReviewRequired';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useLocalize from 'hooks/useLocalize';

const Container = styled.div`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  line-height: 20px;
  padding: 20px;
`;

const TipsList = styled.ul`
  padding: 0;
`;

const Tip = styled.li`
  margin-bottom: 20px;
`;

const TipsContent = () => {
  const initiativeReviewRequired = useInitiativeReviewRequired();
  const { data: appConfiguration } = useAppConfiguration();
  const localize = useLocalize();

  if (!appConfiguration) return null;

  const initiativeSettings =
    appConfiguration.data.attributes.settings.initiatives;

  return (
    <Container>
      {initiativeSettings?.use_custom_posting_tips ? (
        <div
          dangerouslySetInnerHTML={{
            __html: localize(initiativeSettings?.posting_tips),
          }}
        />
      ) : (
        <TipsList>
          <Tip>
            <FormattedMessage {...messages.elaborate} />
          </Tip>
          <Tip>
            <FormattedMessage {...messages.meaningfulTitle} />
          </Tip>
          <Tip>
            <FormattedMessage {...messages.visualise} />
          </Tip>
          <Tip>
            <FormattedMessage {...messages.relevantAttachments} />
          </Tip>
          <Tip>
            <FormattedMessage {...messages.makeSureReadyToBePublic} />{' '}
            {initiativeReviewRequired ? (
              <FormattedMessage {...messages.notEditableOnceReviewed} />
            ) : (
              <FormattedMessage {...messages.notEditableOnceVoted} />
            )}
          </Tip>
          <Tip>
            <FormattedMessage {...messages.shareSocialMedia} />
          </Tip>
        </TipsList>
      )}
    </Container>
  );
};

export default TipsContent;
