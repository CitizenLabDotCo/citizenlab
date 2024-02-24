import React from 'react';
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { StatusComponentProps } from '.';
import Status from './index2';

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
    />
  );
};

export default Expired;
