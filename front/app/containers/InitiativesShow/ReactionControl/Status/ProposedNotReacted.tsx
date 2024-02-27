import React from 'react';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { StatusComponentProps } from '.';
import Status from './index2';

const ProposedNotReacted = (props: StatusComponentProps) => {
  return (
    <Status
      {...props}
      iconName="bullseye"
      statusExplanation={
        <FormattedMessage
          {...messages.proposedStatusExplanation}
          values={{
            votingThreshold: props.initiativeSettings.reacting_threshold,
            proposedStatusExplanationBold: (
              <b>
                <FormattedMessage {...messages.proposedStatusExplanationBold} />
              </b>
            ),
          }}
        />
      }
      showCountDown
      showVoteButtons
      showReadAnswerButton={false}
    />
  );
};

export default ProposedNotReacted;
