import React from 'react';
import { useTheme } from 'styled-components';
import { IconTooltip, colors } from '@citizenlab/cl2-component-library';

// i18n
import T from 'components/T';
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// Types
import { StatusComponentProps } from '.';
import StatusShared from './StatusShared';

const ThresholdReached = (props: StatusComponentProps) => {
  const theme = useTheme();

  return (
    <StatusShared
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
      barColor={colors.success}
      showCountDown
      showVoteButtons
      showReadAnswerButton={false}
      cancelReactionDisabled
    />
  );
};

export default ThresholdReached;
