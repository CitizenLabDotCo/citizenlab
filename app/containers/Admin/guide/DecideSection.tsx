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
        {articles.map((article, i) => {
          const linkMessages: DecideMessages = {
            ideas: messages.decideArticle1Link,
            dashboard: messages.decideArticle2Link,
          };
          const titleMessages: DecideMessages = {
            ideas: messages.manageInputs,
            dashboard: messages.decideArticle2Title,
          };
          const descriptionMessages: DecideMessages = {
            ideas: messages.decideArticle1Description2,
            dashboard: messages.decideArticle2Description,
          };
          const linkMessage = linkMessages[article];
          const titleMessage = titleMessages[article];
          const descriptionMessage = descriptionMessages[article];
          const adminGuideArticle = (
            <AdminGuideArticle
              key={`decideArticle${i}`}
              article={article}
              section="decide"
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

export default injectIntl(DecideSection);
