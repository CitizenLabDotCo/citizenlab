import React from 'react';
import { colors } from '@citizenlab/cl2-component-library';
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { StatusComponentProps } from '.';
import Status from './index2';

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
      barColor={colors.success}
      showVoteButtons
      showReadAnswerButton
    />
  );
};

export default Answered;
