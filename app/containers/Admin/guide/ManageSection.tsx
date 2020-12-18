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

type ManageArticle = 'projects' | 'users';
const articles: ManageArticle[] = ['projects', 'users'];
type ManageMessages = {
  [key in ManageArticle]: ReactIntl.FormattedMessage.MessageDescriptor;
};

const ManageSection = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const handleClickExternalTrack = () => {
    trackEventByName(tracks.externalLink.name, {
      extra: { section: 'manage' },
    });
  };

  const handleClickInteralTrack = (article: ManageArticle) => () => {
    trackEventByName(tracks.internalLink.name, {
      extra: { article, section: 'manage' },
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
        {articles.map((article) => {
          const linkMessages: ManageMessages = {
            projects: messages.manageArticle1Link,
            users: messages.manageArticle2Link,
          };
          const titleMessages: ManageMessages = {
            projects: messages.manageArticle1Title,
            users: messages.manageArticle2Title,
          };
          const descriptionMessages: ManageMessages = {
            projects: messages.manageArticle1Description,
            users: messages.manageArticle2Description,
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

export default injectIntl(ManageSection);
