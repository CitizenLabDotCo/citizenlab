import React from 'react';

import { FormattedMessage } from 'utils/cl-intl';

import { StatusComponentProps } from '../';
import messages from '../messages';

import Status from '.';

const ThresholdReached = (props: StatusComponentProps) => {
  return (
    <Status
      {...props}
      iconName="email-check"
      statusExplanation={
        <>
          <FormattedMessage
            {...messages.thresholdReachedStatusExplanation}
            values={{
              thresholdReachedStatusExplanationBold: (
                <b>
                  <FormattedMessage
                    {...messages.thresholdReachedStatusExplanationBold}
                  />
                </b>
              ),
            }}
          />
        </>
      }
      showCountDown
      showProgressBar
      showVoteButtons
      showReadAnswerButton={false}
      cancelReactionDisabled
    />
  );
};

export default ThresholdReached;
