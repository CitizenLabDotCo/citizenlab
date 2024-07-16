import React from 'react';

import { IconTooltip } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import { StatusComponentProps } from '../StatusWrapper';

import Status from '.';

const ThresholdReached = (props: StatusComponentProps) => {
  const theme = useTheme();

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
          <IconTooltip
            icon="info-outline"
            iconColor={theme.colors.tenantText}
            theme="light"
            placement="bottom"
            content={
              <T
                value={props.initiativeSettings.threshold_reached_message}
                supportHtml
              />
            }
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
