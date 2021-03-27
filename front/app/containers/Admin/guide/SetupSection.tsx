import React from 'react';
import {
  SectionWrapper,
  SectionHeader,
  SectionTitle,
  SectionContent,
  renderArticle,
} from './';
import AdminGuideArticle from './AdminGuideArticle';

import { Icon } from 'cl2-component-library';
import { colors } from 'utils/styleUtils';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

type SetupArticle = 'projects' | 'user_custom_fields' | 'widgets';
const articles: SetupArticle[] = ['projects', 'user_custom_fields', 'widgets'];
type SetupMessages = {
  [key in SetupArticle]: ReactIntl.FormattedMessage.MessageDescriptor;
};

const SetupSection = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const handleClickExternalTrack = () => {
    trackEventByName(tracks.externalLink.name, {
      extra: { section: 'setup' },
    });
  };

  return (
    <SectionWrapper>
      <SectionHeader>
        <SectionTitle color={colors.adminOrangeIcons}>
          <Icon name={'setup'} />
          <FormattedMessage tagName="h2" {...messages.setupSectionTitle} />
        </SectionTitle>
        {/*tslint:disable-next-line*/}
        <a
          href={formatMessage(messages.setupSectionLink)}
          target="_blank"
          onClick={handleClickExternalTrack}
        >
          <FormattedMessage {...messages.readCompleteGuide} />
        </a>
      </SectionHeader>
      <SectionContent>
        {articles.map((article, i) => {
          const linkMessages: SetupMessages = {
            projects: messages.setupArticle1Link,
            user_custom_fields: messages.setupArticle2Link,
            widgets: messages.setupArticle3Link,
          };
          const titleMessages: SetupMessages = {
            projects: messages.setupArticle1Title,
            user_custom_fields: messages.setupArticle2Title,
            widgets: messages.setupArticle3Title,
          };
          const descriptionMessages: SetupMessages = {
            projects: messages.setupArticle1Description,
            user_custom_fields: messages.setupArticle2Description,
            widgets: messages.setupArticle3Description,
          };
          const linkMessage = linkMessages[article];
          const titleMessage = titleMessages[article];
          const descriptionMessage = descriptionMessages[article];
          const adminGuideArticle = (
            <AdminGuideArticle
              key={`setupArticle${i}`}
              article={article}
              section="setup"
              linkMessage={linkMessage}
              titleMessage={titleMessage}
              descriptionMessage={descriptionMessage}
            />
          );

          return renderArticle(article, i, adminGuideArticle);
        })}
      </SectionContent>
    </SectionWrapper>
  );
};

export default injectIntl(SetupSection);
