import React from 'react';
import { Editor, Frame, Element } from '@craftjs/core';

// utils
import { isNilOrError } from 'utils/helperUtils';

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
import Text from '../components/CraftComponents/Text';
import TwoColumn from '../components/CraftComponents/TwoColumn';
import RenderNode from '../components/RenderNode';
import ContentBuilderTopBar from '../components/ContentBuilderTopBar';

// hooks
import useLocale from 'hooks/useLocale';
import useContentBuilderLayout from '../../hooks/useContentBuilder';
import { PROJECT_DESCRIPTION_CODE } from '../../services/contentBuilder';

// router
import { withRouter, WithRouterProps } from 'react-router';

const StyledRightColumn = styled(RightColumn)`
  min-height: calc(100vh - ${2 * stylingConsts.menuHeight}px);
`;

const ContentBuilderPage = ({ params: { projectId } }: WithRouterProps) => {
  const data = useContentBuilderLayout({
    projectId,
    code: PROJECT_DESCRIPTION_CODE,
  });
  const locale = useLocale();

  const editorData =
    !isNilOrError(data) && !isNilOrError(locale)
      ? JSON.stringify(data[locale])
      : undefined;
  console.log(editorData);
  return (
    <Box display="flex" flexDirection="column" w="100%">
      <ContentBuilderTopBar />
      <Editor
        resolver={{ Box, Container, TwoColumn, Text }}
        onRender={RenderNode}
      >
        <Box display="flex">
          <Box
            flex="0 0 auto"
            h="100%"
            w="220px"
            display="flex"
            flexDirection="column"
            alignItems="center"
            bgColor={colors.adminDarkBackground}
            borderRight={`1px solid ${colors.mediumGrey}`}
          >
            <ContentBuilderToolbox />
          </Box>
          <StyledRightColumn>
            <Box paddingTop="20px">
              <Frame json={editorData}>
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

export default withRouter(ContentBuilderPage);
