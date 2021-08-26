import React from 'react';
import styled from 'styled-components';
import Link from 'utils/cl-router/Link';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

interface Props {
  linkTo: string;
  linkMessage: ReactIntl.FormattedMessage.MessageDescriptor;
  onClick: () => void;
}

const MenuItem = styled.li`
  padding: 20px 10px;
  font-size: ${fontSizes.base}px;
`;

const StyledLink = styled(Link)`
  color: ${colors.text};

  &:hover {
    color: ${darken(0.2, colors.text)};
  }
`;

const FullMobileNavMenuItem = ({
  linkTo,
  linkMessage,
  onClick,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  return (
    <MenuItem>
      <StyledLink onClick={onClick} to={linkTo}>
        {formatMessage(linkMessage)}
      </StyledLink>
    </MenuItem>
  );
};

export default injectIntl(FullMobileNavMenuItem);
