import React from 'react';
import { colors, Box, Icon } from '@citizenlab/cl2-component-library';
import { StatusWrapper, StatusExplanation } from './SharedStyles';
import T from 'components/T';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { StatusComponentProps } from './Status';

const ReviewPending = ({ initiativeStatus }: StatusComponentProps) => {
  return (
    <Box>
      <Box mb="16px">
        <StatusWrapper>
          <T value={initiativeStatus.attributes.title_multiloc} />
        </StatusWrapper>
      </Box>
      <Icon
        ariaHidden
        name="clock"
        fill={colors.coolGrey600}
        width="30px"
        height="30px"
        mb="20px"
      />
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
