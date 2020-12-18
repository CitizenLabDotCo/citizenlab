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

const DecideSection = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const handleClickExternalTrack = () => {
    trackEventByName(tracks.externalLink.name, {
      extra: { section: 'decide' },
    });
  };

  const handleClickInteralTrack = (article: 'ideas' | 'dashboard') => () => {
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
          <Article
            to={formatMessage(
              {
                ideas: messages.decideArticle1Link,
                dashboard: messages.decideArticle2Link,
              }[article]
            )}
            key={article}
            onClick={handleClickInteralTrack(article)}
          >
            <div>
              <FormattedMessage
                tagName="h3"
                {...{
                  ideas: messages.decideArticle1Title,
                  dashboard: messages.decideArticle2Title,
                }[article]}
              />
              <FormattedMessage
                tagName="p"
                {...{
                  ideas: messages.decideArticle1Description,
                  dashboard: messages.decideArticle2Description,
                }[article]}
              />
            </div>
            <IconWrapper>
              <Icon name="arrowLeft" />
            </IconWrapper>
          </Article>;
        })}
      </SectionContent>
    </SectionWrapper>
  );
};

export default injectIntl(DecideSection);
