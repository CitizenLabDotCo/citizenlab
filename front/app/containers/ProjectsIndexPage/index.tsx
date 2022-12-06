import React from 'react';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { media, fontSizes, colors } from 'utils/styleUtils';
import CityLogoSection from 'components/CityLogoSection';
// components
import ContentContainer from 'components/ContentContainer';
import ProjectAndFolderCards from 'components/ProjectAndFolderCards';
// style
import styled from 'styled-components';
import ProjectsIndexMeta from './ProjectsIndexMeta';
import messages from './messages';

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
  margin-bottom: 40px;

  ${media.tablet`
    text-align: left;
    margin-bottom: 20px;
  `}

  ${media.phone`
    font-size: ${fontSizes.xxxl}px;
  `}
`;

const ProjectsIndex = () => {
  return (
    <>
      <ProjectsIndexMeta />
      <Container>
        <StyledContentContainer mode="page">
          <PageTitle>
            <FormattedMessage {...messages.pageTitle} />
          </PageTitle>

          <ProjectAndFolderCards
            showTitle={false}
            showSearch={true}
            layout="threecolumns"
            publicationStatusFilter={['published', 'archived']}
          />
        </StyledContentContainer>
        <CityLogoSection />
      </Container>
    </>
  );
};

export default ProjectsIndex;
