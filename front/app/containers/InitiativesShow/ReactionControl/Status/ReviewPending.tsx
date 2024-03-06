import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import { StatusComponentProps } from '../StatusWrapper';

import Status from '.';

const ReviewPending = (props: StatusComponentProps) => {
  return (
    <Status
      {...props}
      iconName="clock"
      statusExplanation={
        <>
          <b>
            <FormattedMessage
              {...messages.reviewPendingStatusExplanationBold}
            />
          </b>{' '}
          <FormattedMessage
            {...messages.reviewPendingStatusExplanationSentenceTwo}
          />
          <Box mt="20px">
            <FormattedMessage
              {...messages.reviewPendingStatusExplanationSentenceThree}
            />
          </Box>
        </>
      }
      showCountDown={false}
      showProgressBar={false}
      showVoteButtons={false}
      showReadAnswerButton={false}
    />
  );
};

export default ReviewPending;
