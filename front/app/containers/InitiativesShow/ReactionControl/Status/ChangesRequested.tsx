import React from 'react';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import { StatusComponentProps } from '../StatusWrapper';

import Status from '.';

const ChangesRequested = (props: StatusComponentProps) => {
  return (
    <Status
      {...props}
      iconName="halt"
      statusExplanation={
        <>
          <b>
            <FormattedMessage
              {...messages.changesRequestedStatusExplanationBold}
            />
          </b>{' '}
          <FormattedMessage
            {...messages.changesRequestedStatusExplanationSentenceTwo}
          />
        </>
      }
      showCountDown={false}
      showProgressBar={false}
      showVoteButtons={false}
      showReadAnswerButton
    />
  );
};

export default ChangesRequested;
