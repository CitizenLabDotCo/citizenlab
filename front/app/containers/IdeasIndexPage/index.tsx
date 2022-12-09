import React, { memo } from 'react';

// components
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';
import CityLogoSection from 'components/CityLogoSection';
import IdeasIndexMeta from './IdeaIndexMeta';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, fontSizes, colors, isRtl } from 'utils/styleUtils';

const Container = styled.main`
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: ${colors.background};

  ${media.tablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
  `}
`;

const StyledContentContainer = styled(ContentContainer)`
  flex: 1 1 auto;
  padding-top: 60px;
  padding-bottom: 100px;

  ${media.phone`
    padding-top: 30px;
  `}
`;

const PageTitle = styled.h1`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.xxxxl}px;
  line-height: normal;
  font-weight: 500;
  text-align: center;
  padding: 0;
  margin: 0;
  margin-bottom: 35px;

  ${media.tablet`
    text-align: left;
    margin-bottom: 20px;
  `}

  ${media.phone`
    font-size: ${fontSizes.xxxl}px;
  `}

 ${isRtl`
  ${media.tablet`
    text-align: right;
  `}
 `}
`;

export default memo(() => (
  <>
    <IdeasIndexMeta />
    <Container>
      <StyledContentContainer maxWidth="100%">
        <PageTitle>
          <FormattedMessage {...messages.inputsPageTitle} />
        </PageTitle>
        <IdeaCards
          type="load-more"
          allowProjectsFilter={true}
          projectPublicationStatus="published"
          showViewToggle={false}
          showFiltersSidebar={true}
          invisibleTitleMessage={messages.a11y_IdeasListTitle}
        />
      </StyledContentContainer>
      <CityLogoSection />
    </Container>
  </>
));
