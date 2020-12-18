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

type DecideArticle = 'ideas' | 'dashboard';
const articles: DecideArticle[] = ['ideas', 'dashboard'];
type DecideMessages = {
  [key in DecideArticle]: ReactIntl.FormattedMessage.MessageDescriptor;
};

const DecideSection = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const handleClickExternalTrack = () => {
    trackEventByName(tracks.externalLink.name, {
      extra: { section: 'decide' },
    });
  };

  const handleClickInteralTrack = (article: DecideArticle) => () => {
    trackEventByName(tracks.internalLink.name, {
      extra: { article, section: 'decide' },
    });
  };

  return (
    <SectionWrapper>
      <SectionHeader>
        <SectionTitle color={colors.clRed}>
          <Icon name={'decide'} />
          <FormattedMessage tagName="h2" {...messages.decideSectionTitle} />
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
          const linkMessages: DecideMessages = {
            ideas: messages.decideArticle1Link,
            dashboard: messages.decideArticle2Link,
          };
          const titleMessages: DecideMessages = {
            ideas: messages.decideArticle1Title,
            dashboard: messages.decideArticle2Title,
          };
          const descriptionMessages: DecideMessages = {
            ideas: messages.decideArticle1Description,
            dashboard: messages.decideArticle2Description,
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

export default injectIntl(DecideSection);
