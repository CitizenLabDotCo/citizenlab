import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import { FormattedMessage } from 'utils/cl-intl';
import { getPeriodRemainingUntil } from 'utils/dateUtils';

import messages from '../messages';
import { StatusComponentProps } from '../StatusWrapper';

import Status from '.';

const Proposed = (props: StatusComponentProps) => {
  const { data: appConfiguration } = useAppConfiguration();
  const tenantTimezone =
    appConfiguration?.data.attributes.settings?.core.timezone;

  if (!tenantTimezone) return null;

  const daysLeft = getPeriodRemainingUntil(
    props.initiative.attributes.expires_at,
    tenantTimezone,
    'days'
  );

  return (
    <Status
      {...props}
      iconName={props.userReacted ? 'check-circle' : 'bullseye'}
      statusExplanation={
        props.userReacted ? (
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
              votingThreshold: props.initiativeSettings.reacting_threshold,
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
