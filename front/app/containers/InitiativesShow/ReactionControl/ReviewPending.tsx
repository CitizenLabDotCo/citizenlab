import React from 'react';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

import { IInitiativeStatusData } from 'api/initiative_statuses/types';

import { Box, Icon } from '@citizenlab/cl2-component-library';
import { StatusWrapper, StatusExplanation } from './SharedStyles';

import T from 'components/T';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const StatusIcon = styled(Icon)`
  path {
    fill: ${colors.coolGrey600};
  }
  width: 30px;
  height: 30px;
  margin-bottom: 20px;
`;

interface Props {
  initiativeStatus: IInitiativeStatusData;
}

const ReviewPending = ({ initiativeStatus }: Props) => {
  return (
    <Box>
      <Box mb="16px">
        <StatusWrapper>
          <T value={initiativeStatus.attributes.title_multiloc} />
        </StatusWrapper>
      </Box>
      <StatusIcon ariaHidden name="clock" />
      <StatusExplanation>
        <b>
          <FormattedMessage {...messages.reviewPendingStatusExplanationBold} />
        </b>{' '}
        <FormattedMessage
          {...messages.reviewPendingStatusExplanationSentenceTwo}
        />
        <Box mt="20px">
          <FormattedMessage
            {...messages.reviewPendingStatusExplanationSentenceThree}
          />
        </Box>
      </StatusExplanation>
    </Box>
  );
};

export default ReviewPending;
