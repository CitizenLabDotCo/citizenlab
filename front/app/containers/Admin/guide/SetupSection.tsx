import React from 'react';
import {
  SectionWrapper,
  SectionHeader,
  SectionTitle,
  SectionContent,
  renderArticle,
} from './';
import AdminGuideArticle from './AdminGuideArticle';

import { Icon } from '@citizenlab/cl2-component-library';
import { colors } from 'utils/styleUtils';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import Outlet from 'components/Outlet';

type SetupArticle = 'projects' | 'user_custom_fields';
const articles: SetupArticle[] = ['projects', 'user_custom_fields'];
type SetupMessages = {
  [key in SetupArticle]: ReactIntl.FormattedMessage.MessageDescriptor;
};

const SetupSection = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const handleClickExternalTrack = () => {
    trackEventByName(tracks.externalLink.name, {
      extra: { section: 'setup' },
    });
  };
  const getHandleClickInteralTrack = (article: SetupArticle) => () => {
    trackEventByName(tracks.internalLink.name, {
      extra: { article, section: 'setup' },
    });
  };

  return (
    <SectionWrapper>
      <SectionHeader>
        <SectionTitle color={colors.adminOrangeIcons}>
          <Icon name={'setup'} />
          <FormattedMessage tagName="h2" {...messages.setupSectionTitle} />
        </SectionTitle>
        <a
          href={formatMessage(messages.setupSectionLink)}
          target="_blank"
          onClick={handleClickExternalTrack}
          rel="noreferrer"
        >
          <FormattedMessage {...messages.readCompleteGuide} />
        </a>
      </SectionHeader>
      <SectionContent>
        {articles.map((article, i) => {
          const linkMessages: SetupMessages = {
            projects: messages.setupArticle1Link,
            user_custom_fields: messages.setupArticle2Link,
          };
          const titleMessages: SetupMessages = {
            projects: messages.setupArticle1Title,
            user_custom_fields: messages.setupArticle2Title,
          };
          const descriptionMessages: SetupMessages = {
            projects: messages.setupArticle1Description,
            user_custom_fields: messages.setupArticle2Description,
          };
          const linkMessage = linkMessages[article];
          const titleMessage = titleMessages[article];
          const descriptionMessage = descriptionMessages[article];
          const adminGuideArticle = (
            <AdminGuideArticle
              key={`setupArticle${i}`}
              linkMessage={linkMessage}
              titleMessage={titleMessage}
              trackLink={getHandleClickInteralTrack(article)}
              descriptionMessage={descriptionMessage}
            />
          );

          return renderArticle(article, i, adminGuideArticle);
        })}
        <Outlet id="app.containers.Admin.guide.SetupSection" />
      </SectionContent>
    </SectionWrapper>
  );
};

export default injectIntl(SetupSection);
