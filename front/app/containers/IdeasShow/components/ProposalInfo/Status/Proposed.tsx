import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';
import { getPeriodRemainingUntil } from 'utils/dateUtils';

import { StatusComponentProps } from '../';
import messages from '../messages';

import Status from '.';

const Proposed = (props: StatusComponentProps) => {
  const daysLeft = props.idea.attributes.expires_at
    ? getPeriodRemainingUntil(props.idea.attributes.expires_at)
    : undefined;

  const userReacted = props.idea?.relationships?.user_reaction?.data?.id;
  return (
    <Status
      {...props}
      iconName={userReacted ? 'check-circle' : 'bullseye'}
      statusExplanation={
        userReacted ? (
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
        ) : (
          <FormattedMessage
            {...messages.proposedStatusExplanation}
            values={{
              votingThreshold: props.idea.attributes.reacting_threshold,
              proposedStatusExplanationBold: (
                <b>
                  <FormattedMessage
                    {...messages.proposedStatusExplanationBold}
                  />
                </b>
              ),
            }}
          />
        )
      }
      showCountDown
      showProgressBar
      showVoteButtons
      showReadAnswerButton={false}
    />
  );
};

export default Proposed;
