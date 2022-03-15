import React from 'react';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import Link from 'utils/cl-router/Link';

// components
import { IconWrapper } from '.';
import { Icon } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';

const Article = styled(Link)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 0;
  h3 {
    color: ${colors.adminTextColor};
    font-weight: 500;
  }
  p {
    color: ${colors.adminSecondaryTextColor};
  }
  svg * {
    fill: ${colors.adminTextColor};
  }
  &:hover * {
    color: ${colors.clIconAccent};
    fill: ${colors.clIconAccent};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${colors.adminBorder};
  }
`;

interface Props {
  trackLink: () => void;
  linkMessage: string;
  titleMessage: ReactIntl.FormattedMessage.MessageDescriptor;
  descriptionMessage: ReactIntl.FormattedMessage.MessageDescriptor;
}

const AdminGuideArticle = ({
  trackLink,
  linkMessage,
  titleMessage,
  descriptionMessage,
}: Props) => {
  return (
    <Article to={linkMessage} onClick={trackLink}>
      <div>
        <FormattedMessage tagName="h3" {...titleMessage} />
        <FormattedMessage tagName="p" {...descriptionMessage} />
      </div>
      <IconWrapper>
        <Icon name="arrowLeft" />
      </IconWrapper>
    </Article>
  );
};

export default AdminGuideArticle;
