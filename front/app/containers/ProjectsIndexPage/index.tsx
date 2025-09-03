import React from 'react';

import { media, fontSizes, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import CityLogoSection from 'components/CityLogoSection';
import ContentContainer from 'components/ContentContainer';
import ProjectAndFolderCards from 'components/ProjectAndFolderCards';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import ProjectsIndexMeta from './ProjectsIndexMeta';

const Container = styled.div`
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
      <main>
        <Container>
          <StyledContentContainer mode="page">
            <PageTitle>
              <FormattedMessage {...messages.pageTitle} />
            </PageTitle>

            <ProjectAndFolderCards
              showTitle={false}
              showSearch={true}
              layout="threecolumns"
            />
          </StyledContentContainer>
          <CityLogoSection />
        </Container>
      </main>
    </>
  );
};

export default ProjectsIndex;
