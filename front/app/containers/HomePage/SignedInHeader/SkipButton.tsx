import React from 'react';

import { media, isRtl, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

const StyledButton = styled(ButtonWithLink)`
  margin-right: 10px;

  ${media.tablet`
    order: 2;
    margin-right: 0px;
  `}

  ${isRtl`
    margin-right: 0px;
    margin-left: 10px;
  `}

  && button:focus-visible,
  && button.focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${colors.white}, 0 0 0 4px ${colors.black},
      0 0 0 6px ${colors.white};
  }
`;

interface Props {
  onClick: () => void;
  className?: string;
}

const SkipButton = ({ onClick, className }: Props) => {
  const { formatMessage } = useIntl();
  return (
    <StyledButton
      buttonStyle="primary-outlined"
      text={formatMessage(messages.doItLater)}
      onClick={onClick}
      borderColor="#fff"
      textColor="#fff"
      fontWeight="500"
      className={className}
    />
  );
};

export default SkipButton;
