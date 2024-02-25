import React from 'react';
import { colors } from '@citizenlab/cl2-component-library';
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { StatusComponentProps } from '.';
import StatusShared from './StatusShared';

const Answered = (props: StatusComponentProps) => {
  return (
    <StatusShared
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
      showCountDown
      showVoteButtons
      showReadAnswerButton
    />
  );
};

export default Answered;
