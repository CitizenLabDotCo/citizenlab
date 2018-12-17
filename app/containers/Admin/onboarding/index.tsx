// libraries
import React from 'react';
import Helmet from 'react-helmet';

// i18n
import messages from './messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// components
import PageWrapper from 'components/admin/PageWrapper';
import Icon, { IconNames } from 'components/UI/Icon';
import Link from 'utils/cl-router/Link';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  h1 {
    text-align: center;
    font-weight: 300;
    margin-bottom: 45px;
  }
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
  articles: number,
  color: string
};

const content: section[] = [
  {
    key: 'setup',
    articles: 3,
    color: colors.clIconAccent
  },
  {
    key: 'engage',
    articles: 3,
    color: colors.adminOrangeIcons
  },
  {
    key: 'manage',
    articles: 2,
    color: colors.clGreen
  },
  {
    key: 'decide',
    articles: 2,
    color: colors.clRed
  },
];

export const Onboarding = (props: InjectedIntlProps) => {
  const { formatMessage } = props.intl;

  const renderArticle = (section: string, i: number) => (
    <Article to={formatMessage(messages[`${section}Article${i}Link`])} key={i}>
      <div>
        <FormattedMessage tagName="h3" {...messages[`${section}Article${i}Title`]} />
        <FormattedMessage tagName="p" {...messages[`${section}Article${i}Description`]} />
      </div>
      <IconWrapper><Icon name="arrowLeft" /></IconWrapper>
    </Article>
  );
  const renderArticles = (section: string, articles: number) => {
    let i = 1;
    const res: JSX.Element[] = [];
    for (; i <= articles; i = i + 1) {
      res.push(renderArticle(section, i));
    }
    return res;
  };
  const renderSection = ({ key, articles, color }: section) => (
    <SectionWrapper key={key}>
      <SectionHeader>
        <SectionTitle color={color}>
          <Icon name={key} />
          <FormattedMessage tagName="h2" {...messages[`${key}SectionTitle`]} />
        </SectionTitle>
        {/*tslint:disable-next-line*/}
        <a href={formatMessage(messages[`${key}SectionLink`])} target="_blank">
          <FormattedMessage {...messages.readCompleteGuide} />
        </a>
      </SectionHeader>
      <SectionContent>
        {renderArticles(key, articles)}
      </SectionContent>
    </SectionWrapper>
  );

  return (
    <Container>
      <Helmet>
        <title>{formatMessage(messages.HTMLTitle)}</title>
        <meta name="description" content={formatMessage(messages.HTMLDescription)} />
      </Helmet>
      <FormattedMessage tagName="h1" {...messages.title} />
      {content.map(section => renderSection(section))}
    </Container>
  );
};

export default injectIntl(Onboarding);
