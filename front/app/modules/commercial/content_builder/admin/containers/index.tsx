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
import ContentBuilderTopBar from '../components/ContentBuilderTopBar';

const StyledRightColumn = styled(RightColumn)`
  min-height: calc(100vh - ${2 * stylingConsts.menuHeight}px);
`;

const ContentBuilderPage = () => {
  return (
    <Box display="flex" flexDirection="column" w="100%">
      <ContentBuilderTopBar />
      <Editor resolver={{ Box, Container }} onRender={RenderNode}>
        <Box display="flex">
          <Box
            flex="0 0 auto"
            h="100%"
            w="220px"
            display="flex"
            flexDirection="column"
            alignItems="center"
            bgColor={colors.adminDarkBackground}
            borderRight={`1px solid ${colors.border}`}
          >
            <ContentBuilderToolbox />
          </Box>
          <StyledRightColumn>
            <Box paddingTop="20px">
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
            </Box>
          </StyledRightColumn>
          <ContentBuilderSettings />
        </Box>
      </Editor>
    </Box>
  );
};

export default ContentBuilderPage;
