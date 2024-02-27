import React from 'react';
import Button from 'components/UI/Button';
import { colors } from '@citizenlab/cl2-component-library';
import messages from '../messages';
import { useIntl } from 'utils/cl-intl';

interface Props {
  onClick?: () => void;
}

const ReadMoreButton = ({ onClick }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Button
      size="s"
      textColor={colors.coolGrey700}
      mr="8px"
      m="0px"
      p="0px"
      buttonStyle="text"
      onClick={onClick}
    >
      <u>{formatMessage(messages.readMore)}</u>
    </Button>
  );
};

export default ReadMoreButton;
