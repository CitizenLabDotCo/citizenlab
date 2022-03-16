import React from 'react';

// Components
import GoBackButton from 'components/UI/GoBackButton';
import Button from 'components/UI/Button';

// Styling
import styled from 'styled-components';

const TopContainer = styled.div`
  border-style: solid;
  border-width: 1px;
  border-color: Gainsboro;
  width: 100%;
  display: flex;
  background: white;
  align-items: center;
`;

const HeaderContainerLeft = styled.div`
  padding: 15px;
  flex-grow: 1;
  width: 210px;
`;

const HeaderContainerRight = styled.div`
  border-left-style: solid;
  border-left-width: 1px;
  border-left-color: Gainsboro;
  padding: 15px;
  flex-grow: 9;
  align-items: center;
  display: flex;
  gap: 10px;
`;

const ProjectDescriptionContainer = styled.div`
  flex-grow: 2;
`;

const dummy = () => {};

const ContentBuilderPage = () => {
  return (
    <>
      <TopContainer>
        <HeaderContainerLeft>
          <GoBackButton onClick={dummy} />
        </HeaderContainerLeft>
        <HeaderContainerRight>
          <ProjectDescriptionContainer>
            <p>Text Placeholder</p>
          </ProjectDescriptionContainer>
          <Button
            buttonStyle="secondary"
            icon="eye"
            disabled={false}
            processing={false}
            onClick={dummy}
          >
            Preview
          </Button>
          <Button
            buttonStyle="primary"
            disabled={false}
            processing={false}
            onClick={dummy}
          >
            Save
          </Button>
        </HeaderContainerRight>
      </TopContainer>
      <h1>Content Builder</h1>
    </>
  );
};

export default ContentBuilderPage;
