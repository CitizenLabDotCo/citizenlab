import React from 'react';
import {
  SectionWrapper,
  SectionHeader,
  SectionTitle,
  SectionContent,
  TManageArticle,
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

//

const articles: TManageArticle[] = ['projects', 'users'];
type ManageMessages = {
  [key in TManageArticle]: ReactIntl.FormattedMessage.MessageDescriptor;
};

const ManageSection = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const handleClickExternalTrack = () => {
    trackEventByName(tracks.externalLink.name, {
      extra: { section: 'manage' },
    });
  };

  return (
    <SectionWrapper>
      <SectionHeader>
        <SectionTitle color={colors.adminOrangeIcons}>
          <Icon name={'manage'} />
          <FormattedMessage tagName="h2" {...messages.manageSectionTitle} />
        </SectionTitle>
        {/*tslint:disable-next-line*/}
        <a
          href={formatMessage(messages.manageSectionLink)}
          target="_blank"
          onClick={handleClickExternalTrack}
        >
          <FormattedMessage {...messages.readCompleteGuide} />
        </a>
      </SectionHeader>
      <SectionContent>
        {articles.map((article, i) => {
          const linkMessages: ManageMessages = {
            projects: messages.manageArticle1Link,
            users: messages.manageArticle2Link,
          };
          const titleMessages: ManageMessages = {
            projects: messages.manageArticle1Title,
            users: messages.manageArticle2Title,
          };
          const descriptionMessages: ManageMessages = {
            projects: messages.giveFeedback,
            users: messages.manageArticle2Description,
          };
          const linkMessage = linkMessages[article];
          const titleMessage = titleMessages[article];
          const descriptionMessage = descriptionMessages[article];
          const adminGuideArticle = (
            <AdminGuideArticle
              key={`manageArticle${i}`}
              article={article}
              section="manage"
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

export default injectIntl(ManageSection);
