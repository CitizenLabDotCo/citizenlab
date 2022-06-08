import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { withRouter } from 'react-router';
import { FocusOn } from 'react-focus-on';

// styles
import styled from 'styled-components';
import { stylingConsts, colors } from 'utils/styleUtils';

// components
import { RightColumn } from 'containers/Admin';
import { Box } from '@citizenlab/cl2-component-library';
import ContentBuilderMobileView from '../components/ContentBuilderMobileView';
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
import useFeatureFlag from 'hooks/useFeatureFlag';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { SerializedNodes } from '@craftjs/core';
import { Locale } from 'typings';

const StyledRightColumn = styled(RightColumn)`
  min-height: calc(100vh - ${stylingConsts.menuHeight}px);
  z-index: 2;
  margin: 0;
  max-width: 100%;
  align-items: center;
  padding-bottom: 100px;
`;

const ContentBuilderPage = ({
  params: { projectId },
  location: { pathname },
}) => {
  const [mobilePreviewEnabled, setMobilePreviewEnabled] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<Locale | undefined>();

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const featureEnabled = useFeatureFlag({ name: 'content_builder' });
  const locale = useLocale();
  const contentBuilderLayout = useContentBuilderLayout({
    projectId,
    code: PROJECT_DESCRIPTION_CODE,
  });

  useEffect(() => {
    if (!isNilOrError(locale)) {
      setSelectedLocale(locale);
    }
  }, [locale]);

  const editorData =
    !isNilOrError(contentBuilderLayout) && !isNilOrError(locale)
      ? contentBuilderLayout.data.attributes.craftjs_jsonmultiloc[locale]
      : undefined;

  const handleEditorChange = (nodes: SerializedNodes) => {
    iframeRef.current &&
      iframeRef.current.contentWindow &&
      iframeRef.current.contentWindow.postMessage(nodes, window.location.href);
  };

  const modalPortalElement = document.getElementById('modal-portal');
  const contentBuilderVisible =
    featureEnabled &&
    pathname.includes('admin/content-builder') &&
    modalPortalElement;

  return contentBuilderVisible
    ? createPortal(
        <Box
          display="flex"
          flexDirection="column"
          w="100%"
          zIndex="10000"
          position="fixed"
          bgColor={colors.adminBackground}
          h="100vh"
        >
          <FocusOn>
            <Editor isPreview={false} onNodesChange={handleEditorChange}>
              <ContentBuilderTopBar
                mobilePreviewEnabled={mobilePreviewEnabled}
                setMobilePreviewEnabled={setMobilePreviewEnabled}
                selectedLocale={selectedLocale}
                setSelectedLocale={setSelectedLocale}
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
              <Box
                justifyContent="center"
                display={mobilePreviewEnabled ? 'flex' : 'none'}
              >
                <ContentBuilderMobileView
                  projectId={projectId}
                  ref={iframeRef}
                />
              </Box>
            </Editor>
          </FocusOn>
        </Box>,
        modalPortalElement
      )
    : null;
};

export default withRouter(ContentBuilderPage);
