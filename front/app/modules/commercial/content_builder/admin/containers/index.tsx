import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';
import { useParams, useLocation } from 'react-router-dom';

// styles
import styled from 'styled-components';
import { stylingConsts, colors } from 'utils/styleUtils';

// components
import { RightColumn } from 'containers/Admin';
import { Box } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
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
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { SerializedNodes } from '@craftjs/core';
import { Locale } from 'typings';
import eventEmitter from 'utils/eventEmitter';

// intl
import messages from '../messages';
import FormattedMessage from 'utils/cl-intl/FormattedMessage';

const StyledRightColumn = styled(RightColumn)`
  min-height: calc(100vh - ${stylingConsts.menuHeight}px);
  z-index: 2;
  margin: 0;
  max-width: 100%;
  align-items: center;
  padding-bottom: 100px;
`;

type ContentBuilderErrors = Record<
  string,
  { hasError: boolean; selectedLocale: Locale }
>;

export const ContentBuilderPage = () => {
  const [mobilePreviewEnabled, setMobilePreviewEnabled] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<Locale | undefined>();
  const [draftData, setDraftData] = useState<Record<string, SerializedNodes>>();
  const { pathname } = useLocation();
  const { projectId } = useParams() as { projectId: string };

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const featureEnabled = useFeatureFlag({ name: 'content_builder' });
  const locale = useLocale();
  const locales = useAppConfigurationLocales();
  const contentBuilderLayout = useContentBuilderLayout({
    projectId,
    code: PROJECT_DESCRIPTION_CODE,
  });

  useEffect(() => {
    if (!isNilOrError(locale)) {
      setSelectedLocale(locale);
    }
  }, [locale]);

  const [contentBuilderErrors, setContentBuilderErrors] =
    useState<ContentBuilderErrors>({});

  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent('contentBuilderError')
      .subscribe(({ eventValue }) => {
        setContentBuilderErrors((contentBuilderErrors) => ({
          ...contentBuilderErrors,
          ...(eventValue as ContentBuilderErrors),
        }));
      });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent('deleteContentBuilderElement')
      .subscribe(({ eventValue }) => {
        setContentBuilderErrors((contentBuilderErrors) => {
          const deletedElementId = eventValue as string;
          const { [deletedElementId]: _deletedElementId, ...rest } =
            contentBuilderErrors;
          return rest;
        });
      });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isNilOrError(locales)) {
    return null;
  }

  const localesWithError = Object.values(contentBuilderErrors)
    .filter((node) => node.hasError)
    .map((node) => node.selectedLocale);

  const editorData =
    !isNilOrError(contentBuilderLayout) && selectedLocale
      ? draftData && draftData[selectedLocale]
        ? draftData[selectedLocale]
        : contentBuilderLayout.data.attributes.craftjs_jsonmultiloc[
            selectedLocale
          ]
      : undefined;

  const handleEditorChange = (nodes: SerializedNodes) => {
    iframeRef.current &&
      iframeRef.current.contentWindow &&
      iframeRef.current.contentWindow.postMessage(nodes, window.location.href);
  };

  const handleSelectedLocaleChange = ({
    locale,
    editorData,
  }: {
    locale: Locale;
    editorData: SerializedNodes;
  }) => {
    if (selectedLocale && selectedLocale !== locale) {
      setDraftData({ ...draftData, [selectedLocale]: editorData });
    }

    iframeRef.current &&
      iframeRef.current.contentWindow &&
      iframeRef.current.contentWindow.postMessage(
        { selectedLocale: locale },
        window.location.href
      );

    setSelectedLocale(locale);
  };

  const contentBuilderVisible =
    featureEnabled && pathname.includes('admin/content-builder');

  return contentBuilderVisible ? (
    <Box
      display="flex"
      flexDirection="column"
      w="100%"
      zIndex="10000"
      position="fixed"
      bgColor={colors.adminBackground}
      h="100vh"
      data-testid="contentBuilderPage"
    >
      <FocusOn>
        <Editor isPreview={false} onNodesChange={handleEditorChange}>
          <ContentBuilderTopBar
            localesWithError={localesWithError}
            mobilePreviewEnabled={mobilePreviewEnabled}
            setMobilePreviewEnabled={setMobilePreviewEnabled}
            selectedLocale={selectedLocale}
            onSelectLocale={handleSelectedLocaleChange}
            draftEditorData={draftData}
          />
          <Box
            mt={`${stylingConsts.menuHeight}px`}
            display={mobilePreviewEnabled ? 'none' : 'flex'}
          >
            {selectedLocale && (
              <ContentBuilderToolbox selectedLocale={selectedLocale} />
            )}
            <StyledRightColumn>
              <Box width="1000px">
                {localesWithError.length > 0 && (
                  <Error
                    text={
                      <FormattedMessage
                        {...messages.errorMessage}
                        values={{
                          locale: localesWithError[0].toUpperCase(),
                        }}
                      />
                    }
                  />
                )}
                <ContentBuilderFrame
                  key={selectedLocale}
                  editorData={editorData}
                />
              </Box>
            </StyledRightColumn>
            <ContentBuilderSettings />
          </Box>
          <Box
            justifyContent="center"
            display={mobilePreviewEnabled ? 'flex' : 'none'}
          >
            <ContentBuilderMobileView projectId={projectId} ref={iframeRef} />
          </Box>
        </Editor>
      </FocusOn>
    </Box>
  ) : null;
};

const ContentBuilderPageModal = () => {
  const modalPortalElement = document.getElementById('modal-portal');
  return modalPortalElement
    ? createPortal(<ContentBuilderPage />, modalPortalElement)
    : null;
};

export default ContentBuilderPageModal;
