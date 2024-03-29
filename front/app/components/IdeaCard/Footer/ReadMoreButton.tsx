import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';

import Button from 'components/UI/Button';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

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
