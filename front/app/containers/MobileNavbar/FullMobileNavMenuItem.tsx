import React from 'react';
import styled from 'styled-components';
import Link from 'utils/cl-router/Link';
// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

interface Props {
  linkTo: string;
  linkMessage: ReactIntl.FormattedMessage.MessageDescriptor;
  onClick: () => void;
}

const MenuItem = styled.li``;
const StyledLink = styled(Link)``;

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
