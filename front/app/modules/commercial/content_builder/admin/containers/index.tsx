import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';
import { useParams, useLocation } from 'react-router-dom';
import { Box } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';
import { Locale } from 'typings';
import useContentBuilderLayout from '../../hooks/useContentBuilder';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';
// hooks
import { PROJECT_DESCRIPTION_CODE } from '../../services/contentBuilder';
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import eventEmitter from 'utils/eventEmitter';
// utils
import { isNilOrError } from 'utils/helperUtils';
import { stylingConsts, colors } from 'utils/styleUtils';
// components
import { RightColumn } from 'containers/Admin';
import ContentBuilderEditModePreview from '../components/ContentBuilderEditModePreview';
import ContentBuilderFrame from '../components/ContentBuilderFrame';
import ContentBuilderSettings from '../components/ContentBuilderSettings';
import ContentBuilderToolbox from '../components/ContentBuilderToolbox';
import ContentBuilderTopBar from '../components/ContentBuilderTopBar';
// craft
import Editor from '../components/Editor';
import Error from 'components/UI/Error';
// styles
import styled from 'styled-components';
// intl
import messages from '../messages';

const StyledRightColumn = styled(RightColumn)`
  height: calc(100vh - ${stylingConsts.menuHeight}px);
  z-index: 2;
  margin: 0;
  max-width: 100%;
  align-items: center;
  padding-bottom: 100px;
  overflow-y: auto;
`;

type ContentBuilderErrors = Record<
  string,
  { hasError: boolean; selectedLocale: Locale }
>;

export const IMAGE_UPLOADING_EVENT = 'imageUploading';
export const CONTENT_BUILDER_ERROR_EVENT = 'contentBuilderError';
export const CONTENT_BUILDER_DELETE_ELEMENT_EVENT =
  'deleteContentBuilderElement';

export const ContentBuilderPage = () => {
  const [previewEnabled, setPreviewEnabled] = useState(false);
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

  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent(CONTENT_BUILDER_ERROR_EVENT)
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
      .observeEvent(CONTENT_BUILDER_DELETE_ELEMENT_EVENT)
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

  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent(IMAGE_UPLOADING_EVENT)
      .subscribe(({ eventValue }) => {
        const uploadingValue = eventValue as boolean;
        setImageUploading(uploadingValue);
      });
    return () => {
      subscription.unsubscribe();
    };
  });

  const contentBuilderVisible =
    featureEnabled && pathname.includes('admin/content-builder');

  if (isNilOrError(locales) && contentBuilderVisible) {
    return null;
  }

  const localesWithError = Object.values(contentBuilderErrors)
    .filter((node) => node.hasError)
    .map((node) => node.selectedLocale);

  const getEditorData = () => {
    if (!isNilOrError(contentBuilderLayout) && selectedLocale) {
      if (draftData && draftData[selectedLocale]) {
        return draftData[selectedLocale];
      } else {
        return contentBuilderLayout.data.attributes.craftjs_jsonmultiloc[
          selectedLocale
        ];
      }
    } else return undefined;
  };

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

  return (
    <Box
      display="flex"
      flexDirection="column"
      w="100%"
      zIndex="10000"
      position="fixed"
      bgColor={colors.background}
      h="100vh"
      data-testid="contentBuilderPage"
    >
      <FocusOn>
        <Editor
          isPreview={false}
          onNodesChange={handleEditorChange}
          key={selectedLocale}
        >
          <ContentBuilderTopBar
            localesWithError={localesWithError}
            hasPendingState={imageUploading}
            previewEnabled={previewEnabled}
            setPreviewEnabled={setPreviewEnabled}
            selectedLocale={selectedLocale}
            onSelectLocale={handleSelectedLocaleChange}
            draftEditorData={draftData}
          />
          <Box
            mt={`${stylingConsts.menuHeight}px`}
            display={previewEnabled ? 'none' : 'flex'}
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
                <ContentBuilderFrame editorData={getEditorData()} />
              </Box>
            </StyledRightColumn>
            <ContentBuilderSettings />
          </Box>
        </Editor>
        <Box justifyContent="center" display={previewEnabled ? 'flex' : 'none'}>
          <ContentBuilderEditModePreview
            projectId={projectId}
            ref={iframeRef}
          />
        </Box>
      </FocusOn>
    </Box>
  );
};

const ContentBuilderPageModal = () => {
  const modalPortalElement = document.getElementById('modal-portal');
  return modalPortalElement
    ? createPortal(<ContentBuilderPage />, modalPortalElement)
    : null;
};

export default ContentBuilderPageModal;
