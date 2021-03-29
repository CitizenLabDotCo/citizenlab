import React from 'react';
import {
  SectionWrapper,
  SectionHeader,
  SectionTitle,
  SectionContent,
  TEngageArticle,
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

const articles: TEngageArticle[] = [
  'invitations_colleagues',
  'invitations_target_audience',
  'manual_emailing',
];
type EngageMessages = {
  [key in TEngageArticle]: ReactIntl.FormattedMessage.MessageDescriptor;
};

const EngageSection = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const handleClickExternalTrack = () => {
    trackEventByName(tracks.externalLink.name, {
      extra: { section: 'engage' },
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
        {articles.map((article, i) => {
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
          const linkMessage = linkMessages[article];
          const titleMessage = titleMessages[article];
          const descriptionMessage = descriptionMessages[article];
          const adminGuideArticle = (
            <AdminGuideArticle
              key={`engageArticle${i}`}
              article={article}
              section="engage"
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

export default injectIntl(EngageSection);
