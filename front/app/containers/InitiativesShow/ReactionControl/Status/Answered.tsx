import React from 'react';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import { StatusComponentProps } from '../StatusWrapper';

import Status from '.';

const Answered = (props: StatusComponentProps) => {
  return (
    <Status
      {...props}
      iconName="email-check"
      statusExplanation={
        <FormattedMessage
          {...messages.answeredStatusExplanation}
          values={{
            answeredStatusExplanationBold: (
              <b>
                <FormattedMessage {...messages.answeredStatusExplanationBold} />
              </b>
            ),
          }}
        />
      }
      showCountDown
      showProgressBar
      showVoteButtons
      showReadAnswerButton
    />
  );
};

export default Answered;
