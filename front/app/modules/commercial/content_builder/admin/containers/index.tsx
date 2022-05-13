import React, { useState } from 'react';
import { withRouter } from 'react-router';

// styles
import styled from 'styled-components';
import { stylingConsts } from 'utils/styleUtils';

// components
import { RightColumn } from 'containers/Admin';
import { Box } from '@citizenlab/cl2-component-library';

// craft
import Editor from '../components/Editor';
import ContentBuilderToolbox from '../components/ContentBuilderToolbox';
import ContentBuilderTopBar from '../components/ContentBuilderTopBar';
import ContentBuilderFrame from '../components/ContentBuilderFrame';
import ContentBuilderSettings from '../components/ContentBuilderSettings';

// hooks
import { PROJECT_DESCRIPTION_CODE } from '../../services/contentBuilder';
import useLocale from 'hooks/useLocale';
import useContentBuilderLayout from '../../hooks/useContentBuilder';
import useProject from 'hooks/useProject';

// utils
import { isNilOrError } from 'utils/helperUtils';

const StyledRightColumn = styled(RightColumn)`
  min-height: calc(100vh - ${2 * stylingConsts.menuHeight}px);
  z-index: 2;
  margin: 0;
  max-width: 100%;
  align-items: center;
`;

const ContentBuilderPage = ({ params: { projectId } }) => {
  const [mobilePreviewEnabled, setMobilePreviewEnabled] = useState(false);

  const locale = useLocale();
  const project = useProject({ projectId });

  const contentBuilderLayout = useContentBuilderLayout({
    projectId,
    code: PROJECT_DESCRIPTION_CODE,
  });

  const editorData =
    !isNilOrError(contentBuilderLayout) && !isNilOrError(locale)
      ? contentBuilderLayout.data.attributes.craftjs_jsonmultiloc[locale]
      : undefined;

  return (
    <Box display="flex" flexDirection="column" w="100%">
      <Editor isPreview={false}>
        <ContentBuilderTopBar
          mobilePreviewEnabled={mobilePreviewEnabled}
          setMobilePreviewEnabled={setMobilePreviewEnabled}
        />
        <Box
          mt={`${stylingConsts.menuHeight}px`}
          display={mobilePreviewEnabled ? 'none' : 'flex'}
        >
          <ContentBuilderToolbox />
          <StyledRightColumn>
            <Box width="1000px">
              <ContentBuilderFrame editorData={editorData} />
            </Box>
          </StyledRightColumn>
          <ContentBuilderSettings />
        </Box>
        <Box justifyContent="center">
          <Box
            mt={`${stylingConsts.menuHeight + 20}px`}
            minHeight={`calc(100vh - ${2 * stylingConsts.menuHeight + 20}px)`}
            display={mobilePreviewEnabled ? 'flex' : 'none'}
          >
            <iframe
              //  ref={iframeRef}
              src={`/${locale}/projects/${project?.attributes.slug}`}
              height="550px"
              width="400px"
            />
          </Box>
        </Box>
      </Editor>
    </Box>
  );
};

export default withRouter(ContentBuilderPage);
