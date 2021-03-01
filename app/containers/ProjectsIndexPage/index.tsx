import React from 'react';

// components
import ContentContainer from 'components/ContentContainer';
import ProjectAndFolderCards from 'components/ProjectAndFolderCards';
import CityLogoSection from 'components/CityLogoSection';
import ProjectsIndexMeta from './ProjectsIndexMeta';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';

const Container = styled.main`
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: ${colors.background};

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
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

const PageTitle = styled.h1`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.xxxxl}px;
  line-height: normal;
  font-weight: 500;
  text-align: center;
  padding: 0;
  margin: 0;
  margin-bottom: 0px;

  ${media.smallerThanMaxTablet`
    text-align: left;
    margin-bottom: 0px;
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
          <FormattedMessage {...messages.pageTitle} />
        </PageTitle>
        <ProjectAndFolderCards
          showTitle={false}
          layout="threecolumns"
          publicationStatusFilter={['published', 'archived']}
          folderId={null}
        />
      </StyledContentContainer>
      <CityLogoSection />
    </Container>
  </>
));
