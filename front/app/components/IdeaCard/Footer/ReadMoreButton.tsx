import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  onClick?: () => void;
}

const ReadMoreButton = ({ onClick }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <ButtonWithLink
      size="s"
      textColor={colors.coolGrey700}
      mr="8px"
      m="0px"
      p="0px"
      buttonStyle="text"
      onClick={onClick}
    >
      <u>{formatMessage(messages.readMore)}</u>
    </ButtonWithLink>
  );
};

export default ReadMoreButton;
