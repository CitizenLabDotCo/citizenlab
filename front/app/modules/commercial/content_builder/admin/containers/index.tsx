import React from 'react';
import { Editor, Frame, Element } from '@craftjs/core';

// styles
import styled from 'styled-components';
import { colors, stylingConsts } from 'utils/styleUtils';

// components
import { RightColumn } from 'containers/Admin';
import { Box } from '@citizenlab/cl2-component-library';

// craft
import ContentBuilderToolbox from '../components/ContentBuilderToolbox';
import ContentBuilderSettings from '../components/ContentBuilderSettings';
import Container from '../components/CraftComponents/Container';
import RenderNode from '../components/RenderNode';

const Wrapper = styled.div`
  flex: 0 0 auto;
  width: 210px;
`;

const ContainerInner = styled.nav`
  flex: 0 0 auto;
  width: 210px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  top: 0;
  bottom: 0;
  padding-top: ${stylingConsts.menuHeight + 10}px;
  background-color: ${colors.disabledPrimaryButtonBg};
  border-right: 1px solid ${colors.border};
`;

const ContentBuilderPage = () => {
  return (
    <Editor resolver={{ Box, Container }} onRender={RenderNode}>
      <Wrapper>
        <ContainerInner>
          <ContentBuilderToolbox />
        </ContainerInner>
      </Wrapper>
      <RightColumn>
        <Frame>
          <Element
            is="div"
            canvas
            style={{
              padding: '4px',
              minHeight: '300px',
              backgroundColor: '#fff',
            }}
          />
        </Frame>
      </RightColumn>
      <ContentBuilderSettings />
    </Editor>
  );
};

export default ContentBuilderPage;
