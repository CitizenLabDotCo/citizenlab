import React from 'react';

// Components
import GoBackButton from 'components/UI/GoBackButton';
import Button from 'components/UI/Button';

// Styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { Box } from '@citizenlab/cl2-component-library';

const TopContainer = styled(Box)`
  border-style: solid;
  border-width: 1px;
  border-color: ${colors.separation};
  width: 100%;
  display: flex;
  background: white;
  align-items: center;
`;

const HeaderContainerLeft = styled(Box)`
  padding: 15px;
  width: 210px;
`;

const HeaderContainerRight = styled(Box)`
  border-left-style: solid;
  border-left-width: 1px;
  border-left-color: ${colors.separation};
  padding: 15px;
  flex-grow: 1;
  align-items: center;
  display: flex;
  gap: 10px;
`;

const ProjectDescriptionContainer = styled(Box)`
  flex-grow: 2;
`;

const ProjectTitle = styled.p`
  margin-bottom: 8px;
  color: ${colors.adminSecondaryTextColor};
`;

const BuilderTitle = styled.h1`
  margin: 0px;
`;

const dummy = () => {};

const ContentBuilderPage = () => {
  return (
    <TopContainer>
      <HeaderContainerLeft>
        <GoBackButton onClick={dummy} />
      </HeaderContainerLeft>
      <HeaderContainerRight>
        <ProjectDescriptionContainer>
          <ProjectTitle>An idea? Bring it to your council</ProjectTitle>
          <BuilderTitle>Project Description</BuilderTitle>
        </ProjectDescriptionContainer>
        <Button buttonStyle="primary" onClick={dummy}>
          Save
        </Button>
      </HeaderContainerRight>
    </TopContainer>
  );
};

export default ContentBuilderPage;
