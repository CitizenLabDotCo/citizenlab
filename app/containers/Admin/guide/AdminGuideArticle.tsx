import React from 'react';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import Link from 'utils/cl-router/Link';

// components
import { IconWrapper, TAdminGuideArticle, TAdminGuideSection } from '.';
import { Icon } from 'cl2-component-library';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

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
  article: TAdminGuideArticle;
  section: TAdminGuideSection;
  linkMessage: ReactIntl.FormattedMessage.MessageDescriptor;
  titleMessage: ReactIntl.FormattedMessage.MessageDescriptor;
  descriptionMessage: ReactIntl.FormattedMessage.MessageDescriptor;
}

const AdminGuideArticle = ({
  intl: { formatMessage },
  article,
  section,
  linkMessage,
  titleMessage,
  descriptionMessage,
}: Props & InjectedIntlProps) => {
  const handleClickInteralTrack = () => {
    trackEventByName(tracks.internalLink.name, {
      extra: { section, article },
    });
  };
  return (
    <Article to={formatMessage(linkMessage)} onClick={handleClickInteralTrack}>
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

export default injectIntl(AdminGuideArticle);
