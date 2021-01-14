// libraries
import React from 'react';
import { Helmet } from 'react-helmet';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// components
import PageWrapper from 'components/admin/PageWrapper';
import Link from 'utils/cl-router/Link';
import FeatureFlag from 'components/FeatureFlag';
import { PageTitle } from 'components/admin/Section';
import SetupSection from './SetupSection';
import EngageSection from './EngageSection';
import ManageSection from './ManageSection';
import DecideSection from './DecideSection';

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

export const SectionWrapper = styled(PageWrapper)`
  margin-bottom: 20px;
  padding: 0;

  &:last-child {
    margin-bottom: 60px;
  }
`;

export const SectionHeader = styled.div`
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

export const SectionTitle: any = styled.div`
  display: flex;
  align-items: center;
  h2 {
    color: ${(props) => props.color};
    font-size: ${fontSizes.base}px;
    text-transform: uppercase;
    margin: 0;
    margin-left: 25px;
  }
`;

export const SectionContent = styled.div`
  padding: 20px 40px;
`;

export const Article = styled(Link)`
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

export const IconWrapper = styled.div`
  margin-left: 100px;
  flex: 0 0 auto;
  width: 16px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export type TAdminGuideSection = 'setup' | 'engage' | 'manage' | 'decide';
export type TSetupArticle = 'projects' | 'user_custom_fields' | 'widgets';
export type TEngageArticle =
  | 'invitations_colleagues'
  | 'invitations_target_audience'
  | 'manual_emailing';
export type TManageArticle = 'projects' | 'users';
export type TDecideArticle = 'ideas' | 'dashboard';
export type TAdminGuideArticle =
  | TSetupArticle
  | TEngageArticle
  | TManageArticle
  | TDecideArticle;

export const renderArticle = (
  article: TAdminGuideArticle,
  index: number,
  articleComponent: JSX.Element
) => {
  if (
    article === 'widgets' ||
    article === 'user_custom_fields' ||
    article === 'manual_emailing'
  ) {
    return (
      <FeatureFlag name={article} key={index}>
        {articleComponent}
      </FeatureFlag>
    );
  } else {
    return articleComponent;
  }
};

export const AdminGuide = (props: InjectedIntlProps) => {
  const { formatMessage } = props.intl;

  return (
    <>
      <Meta>
        <Helmet>
          <title>{formatMessage(messages.HTMLTitle)}</title>
          <meta
            name="description"
            content={formatMessage(messages.HTMLDescription)}
          />
        </Helmet>
      </Meta>

      <Container>
        <HeaderContainer>
          <PageTitle>{formatMessage(messages.title)}</PageTitle>
        </HeaderContainer>
        <SetupSection />
        <EngageSection />
        <ManageSection />
        <DecideSection />
      </Container>
    </>
  );
};

export default injectIntl(AdminGuide);
