import React from 'react';
import styled, { useTheme } from 'styled-components';
import Button from 'components/UI/Button';
import { media } from 'utils/styleUtils';

const StyledButton = styled(Button)`
  ${media.tablet`
  order: 1;
  margin-right: 10px;
`}

  ${media.phone`
  margin-bottom: 10px;
  margin-right: 0px;
`}
`;

interface Props {
  onClick?: () => void;
  linkTo?: string;
  className?: string;
  text: string;
}

const AcceptButton = ({ onClick, linkTo, className, text }: Props) => {
  const theme = useTheme();

  return (
    <StyledButton
      text={text}
      buttonStyle="primary-inverse"
      onClick={onClick}
      linkTo={linkTo}
      textColor={theme.colors.tenantPrimary}
      textHoverColor={theme.colors.tenantPrimary}
      fontWeight="500"
      className={className}
    />
  );
};

export default AcceptButton;
