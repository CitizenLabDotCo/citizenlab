import { Button } from '@citizenlab/cl2-component-library';
import React from 'react';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

interface Props {
  onClick: () => void;
}

const ReadAnswerButton = ({ onClick }: Props) => {
  return (
    <Button
      icon="survey-long-answer-2"
      iconSize="20px"
      buttonStyle="secondary"
      onClick={onClick}
    >
      <FormattedMessage {...messages.readAnswer} />
    </Button>
  );
};

export default ReadAnswerButton;
