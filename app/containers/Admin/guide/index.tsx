// libraries
import React from 'react';
import { Helmet } from 'react-helmet';

// i18n
import messages from './messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// components
import PageWrapper from 'components/admin/PageWrapper';
import Icon, { IconNames } from 'components/UI/Icon';
import Link from 'utils/cl-router/Link';
import FeatureFlag from 'components/FeatureFlag';
import { PageTitle } from 'components/admin/Section';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const Meta = styled.div`
  display: none;
`;

const Container = styled.div``;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  margin: 0;
  margin-bottom: 30px;
`;

const SectionWrapper = styled(PageWrapper)`
  margin-bottom: 20px;
  padding: 0;

  &:last-child {
    margin-bottom: 60px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  padding: 20px 40px;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${colors.adminBorder};
  & a {
    color: ${colors.adminSecondaryTextColor};
    text-decoration: underline;
  }
  & a:hover {
    color: ${colors.clIconAccent};
    text-decoration: underline;
  }
`;

const SectionTitle: any = styled.div`
  display: flex;
  align-items: center;
  h2 {
    color: ${props => props.color};
    font-size: ${fontSizes.base}px;
    text-transform: uppercase;
    margin: 0;
    margin-left: 25px;
  }
`;

const SectionContent = styled.div`
  padding: 20px 40px;
`;

const Article = styled(Link)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 0;
  h3 {
    color: ${colors.adminTextColor};
    font-weight: 500;
  }
  p {
    color: ${colors.adminSecondaryTextColor};
  }
  svg * {
    fill: ${colors.adminTextColor};
  }
  &:hover * {
    color: ${colors.clIconAccent};
    fill: ${colors.clIconAccent};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${colors.adminBorder};
  }
`;

const IconWrapper = styled.div`
  margin-left: 100px;
  flex: 0 0 auto;
  width: 16px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

type section = {
  key: IconNames,
  articles: string[],
  color: string
};

const content: section[] = [
  {
    key: 'setup',
    articles: ['projects', 'user_custom_fields', 'widgets'],
    color: colors.clIconAccent,
  },
  {
    key: 'engage',
    articles: ['invitations', 'invitations', 'manual_emailing'],
    color: colors.adminOrangeIcons
  },
  {
    key: 'manage',
    articles: ['projects', 'users'],
    color: colors.clGreen
  },
  {
    key: 'decide',
    articles: ['ideas', 'dashboard'],
    color: colors.clRed
  },
];

const trackExternal = (section: string) => () => trackEventByName(tracks.externalLink.name, { extra: { section } });
const trackInternal = (section: string, article: number) => () => trackEventByName(tracks.internalLink.name, { extra: { section, article } });

export const Onboarding = (props: InjectedIntlProps) => {
  const { formatMessage } = props.intl;

  const renderFlags = (section: string, index: number, article: string) => {
    if (article === 'widgets' || article === 'user_custom_fields' || article === 'manual_emailing') {
      return (
        <FeatureFlag name={article} key={index}>
          {renderArticle(section, index)}
        </FeatureFlag>
      );
    } else {
      return renderArticle(section, index);
    }
  };

  const renderArticle = (section: string, i: number) => (
    <Article to={formatMessage(messages[`${section}Article${i}Link`])} key={i} onClick={trackInternal(section, i)}>
      <div>
        <FormattedMessage tagName="h3" {...messages[`${section}Article${i}Title`]} />
        <FormattedMessage tagName="p" {...messages[`${section}Article${i}Description`]} />
      </div>
      <IconWrapper><Icon name="arrowLeft" /></IconWrapper>
    </Article>
  );

  const renderArticles = (section: string, articles: string[]) => {
    return articles.map((article, index) => renderFlags(section, index + 1, article));
  };

  const renderSection = ({ key, articles, color }: section) => (
    <SectionWrapper key={key}>
      <SectionHeader>
        <SectionTitle color={color}>
          <Icon name={key} />
          <FormattedMessage tagName="h2" {...messages[`${key}SectionTitle`]} />
        </SectionTitle>
        {/*tslint:disable-next-line*/}
        <a href={formatMessage(messages[`${key}SectionLink`])} target="_blank" onClick={trackExternal(key)}>
          <FormattedMessage {...messages.readCompleteGuide} />
        </a>
      </SectionHeader>
      <SectionContent>
        {renderArticles(key, articles)}
      </SectionContent>
    </SectionWrapper>
  );

  return (
    <>
    <Meta>
      <Helmet>
        <title>{formatMessage(messages.HTMLTitle)}</title>
        <meta name="description" content={formatMessage(messages.HTMLDescription)} />
      </Helmet>
    </Meta>

    <Container>
      <HeaderContainer>
        <PageTitle>{formatMessage(messages.title)}</PageTitle>
      </HeaderContainer>

      {content.map(section => renderSection(section))}
    </Container>
    </>
  );
};

export default injectIntl(Onboarding);
