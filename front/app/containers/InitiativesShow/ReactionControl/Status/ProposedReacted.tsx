import React from 'react';
import { Text } from '@citizenlab/cl2-component-library';
import { getPeriodRemainingUntil } from 'utils/dateUtils';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { StatusComponentProps } from '.';
import Status from './index2';

const ProposedReacted = (props: StatusComponentProps) => {
  const daysLeft = getPeriodRemainingUntil(
    props.initiative.attributes.expires_at
  );

  return (
    <Status
      {...props}
      iconName="check-circle"
      statusExplanation={
        <Text m="0">
          <b>
            <FormattedMessage {...messages.votedTitle} />
          </b>{' '}
          <FormattedMessage
            {...messages.votedText}
            values={{
              x: daysLeft,
              xDays: (
                <b>
                  <FormattedMessage
                    {...messages.xDays}
                    values={{ x: daysLeft }}
                  />
                </b>
              ),
            }}
          />
        </Text>
      }
      showCountDown
      showVoteButtons
      showReadAnswerButton={false}
    />
  );
};

export default ProposedReacted;
