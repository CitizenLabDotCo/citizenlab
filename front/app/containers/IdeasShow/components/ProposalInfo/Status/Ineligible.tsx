import React from 'react';

import { FormattedMessage } from 'utils/cl-intl';

import { StatusComponentProps } from '../';
import messages from '../messages';

import Status from '.';

const Ineligible = (props: StatusComponentProps) => {
  return (
    <Status
      {...props}
      iconName="halt"
      statusExplanation={
        <FormattedMessage
          {...messages.ineligibleStatusExplanation}
          values={{
            ineligibleStatusExplanationBold: (
              <b>
                <FormattedMessage
                  {...messages.ineligibleStatusExplanationBold}
                />
              </b>
            ),
          }}
        >
          {(text) => <>{text}</>}
        </FormattedMessage>
      }
      showCountDown={false}
      showProgressBar={false}
      showVoteButtons={false}
      showReadAnswerButton
    />
  );
};

export default Ineligible;
