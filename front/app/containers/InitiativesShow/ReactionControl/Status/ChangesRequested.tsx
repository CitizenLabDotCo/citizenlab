import React from 'react';
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';
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
      showVoteButtons={false}
      showReadAnswerButton={false}
    />
  );
};

export default ChangesRequested;
