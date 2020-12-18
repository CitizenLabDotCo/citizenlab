import React from 'react';
import {
  SectionWrapper,
  SectionHeader,
  SectionTitle,
  SectionContent,
  Article,
  IconWrapper,
} from './';
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

  const handleClickInteralTrack = (article: SetupArticle) => () => {
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
        {articles.map((article) => {
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

          return (
            <Article
              to={formatMessage(linkMessages[article])}
              key={article}
              onClick={handleClickInteralTrack(article)}
            >
              <div>
                <FormattedMessage tagName="h3" {...titleMessages[article]} />
                <FormattedMessage
                  tagName="p"
                  {...descriptionMessages[article]}
                />
              </div>
              <IconWrapper>
                <Icon name="arrowLeft" />
              </IconWrapper>
            </Article>
          );
        })}
      </SectionContent>
    </SectionWrapper>
  );
};

export default injectIntl(SetupSection);
