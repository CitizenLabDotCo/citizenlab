import React from 'react';

// components
import ContentContainer from 'components/ContentContainer';
import ProjectCards from 'components/ProjectCards';
import Footer from 'components/Footer';
import ProjectsIndexMeta from './ProjectsIndexMeta';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';

const Container = styled.div`
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: ${colors.background};

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}
`;

const StyledContentContainer = styled(ContentContainer)`
  flex: 1 1 auto;
  padding-top: 60px;
  padding-bottom: 100px;

  ${media.smallerThanMinTablet`
    padding-top: 30px;
  `}
`;

const PageTitle = styled.span`
  & h1 {
    color: ${colors.text};
    font-size: ${fontSizes.xxxxl}px;
    line-height: normal;
    font-weight: 500;
  }
  text-align: center;
  margin: 0;
  padding: 0;
  margin-bottom: 35px;

  ${media.smallerThanMaxTablet`
    text-align: left;
    margin-bottom: 20px;
  `}

  ${media.smallerThanMinTablet`
    font-size: ${fontSizes.xxxl}px;
  `}
`;

export default React.memo(() => (
  <>
    <ProjectsIndexMeta />
    <Container>
      <StyledContentContainer mode="page">
        <PageTitle>
          <FormattedMessage tagName="h1" {...messages.pageTitle} />
        </PageTitle>
        <ProjectCards
          pageSize={50}
          publicationStatuses={['published', 'archived']}
          sort="new"
          showTitle={false}
          showPublicationStatusFilter={true}
          layout="threecolumns"
        />
      </StyledContentContainer>
      <Footer />
    </Container>
  </>
));
