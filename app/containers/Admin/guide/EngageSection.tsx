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

type EngageArticle =
  | 'invitations_colleagues'
  | 'invitations_target_audience'
  | 'manual_emailing';
const articles: EngageArticle[] = [
  'invitations_colleagues',
  'invitations_target_audience',
  'manual_emailing',
];
type EngageMessages = {
  [key in EngageArticle]: ReactIntl.FormattedMessage.MessageDescriptor;
};

const EngageSection = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const handleClickExternalTrack = () => {
    trackEventByName(tracks.externalLink.name, {
      extra: { section: 'engage' },
    });
  };

  const handleClickInteralTrack = (article: EngageArticle) => () => {
    trackEventByName(tracks.internalLink.name, {
      extra: { article, section: 'engage' },
    });
  };

  return (
    <SectionWrapper>
      <SectionHeader>
        <SectionTitle color={colors.adminOrangeIcons}>
          <Icon name={'engage'} />
          <FormattedMessage tagName="h2" {...messages.engageSectionTitle} />
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
          const linkMessages: EngageMessages = {
            invitations_colleagues: messages.engageArticle1Link,
            invitations_target_audience: messages.engageArticle2Link,
            manual_emailing: messages.engageArticle3Link,
          };
          const titleMessages: EngageMessages = {
            invitations_colleagues: messages.engageArticle1Title,
            invitations_target_audience: messages.engageArticle2Title,
            manual_emailing: messages.engageArticle3Title,
          };
          const descriptionMessages: EngageMessages = {
            invitations_colleagues: messages.engageArticle1Description,
            invitations_target_audience: messages.engageArticle2Description,
            manual_emailing: messages.engageArticle3Description,
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

export default injectIntl(EngageSection);
