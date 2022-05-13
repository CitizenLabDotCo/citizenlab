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
import { PROJECT_DESCRIPTION_CODE } from '../../services/contentBuilder';
import useLocale from 'hooks/useLocale';
import useContentBuilderLayout from '../../hooks/useContentBuilder';
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
        <Box mt={`${stylingConsts.menuHeight}px`} display="flex">
          <ContentBuilderToolbox />
          <StyledRightColumn>
            <Box width="1000px">
              <ContentBuilderFrame editorData={editorData} />
            </Box>
          </StyledRightColumn>
          <ContentBuilderSettings />
        </Box>
      </Editor>
    </Box>
  );
};

export default withRouter(ContentBuilderPage);
