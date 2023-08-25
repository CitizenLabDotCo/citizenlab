import React from 'react';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styles
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// hooks
import useInitiativeReviewRequired from 'hooks/useInitiativeReviewRequired';

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

  return (
    <Container>
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
    </Container>
  );
};

export default TipsContent;
