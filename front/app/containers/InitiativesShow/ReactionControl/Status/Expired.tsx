import React from 'react';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import { StatusComponentProps } from '../StatusWrapper';

import Status from '.';

const Expired = (props: StatusComponentProps) => {
  return (
    <Status
      {...props}
      iconName="clock"
      statusExplanation={
        <FormattedMessage
          {...messages.expiredStatusExplanation}
          values={{
            expiredStatusExplanationBold: (
              <b>
                <FormattedMessage
                  {...messages.expiredStatusExplanationBold}
                  values={{
                    votingThreshold:
                      props.initiativeSettings.reacting_threshold,
                  }}
                />
              </b>
            ),
          }}
        />
      }
      barColor="linear-gradient(270deg, #84939E 0%, #C8D0D6 100%)"
      showCountDown
      showProgressBar
      showVoteButtons={false}
      showReadAnswerButton={false}
    />
  );
};

export default Expired;
