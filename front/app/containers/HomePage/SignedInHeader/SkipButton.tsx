import React from 'react';
import styled from 'styled-components';
import Button from 'components/UI/Button';
import { media, isRtl } from 'utils/styleUtils';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

const StyledButton = styled(Button)`
  margin-right: 10px;

  ${media.tablet`
    order: 2;
    margin-right: 0px;
  `}

  ${isRtl`
    margin-right: 0px;
    margin-left: 10px;
  `}
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
