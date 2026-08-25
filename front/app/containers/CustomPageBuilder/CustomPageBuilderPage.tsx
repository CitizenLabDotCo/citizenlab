import React, { useState, useRef, useCallback, useMemo } from 'react';

import { Box, stylingConsts } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';
import { Multiloc, SupportedLocale } from 'typings';

import useCustomPageLayout from 'api/custom_page_layout/useCustomPageLayout';
import useUpsertCustomPageLayout from 'api/custom_page_layout/useUpsertCustomPageLayout';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

import { CUSTOM_PAGE_BUILDER_PATH } from 'components/admin/ContentBuilder/constants';
import { ContentBuilderLayoutProvider } from 'components/admin/ContentBuilder/context/ContentBuilderLayoutContext';
import FullscreenContentBuilder from 'components/admin/ContentBuilder/FullscreenContentBuilder';
import { ContentBuilderErrors } from 'components/admin/ContentBuilder/typings';
import { normalizeCustomPageLayout } from 'components/CustomPageBuilder/defaultLayout';
import CustomPageBuilderEditModePreview from 'components/CustomPageBuilder/EditModePreview';
import Editor from 'components/CustomPageBuilder/Editor';
import CustomPageBuilderToolbox from 'components/CustomPageBuilder/Toolbox';
import CustomPageBuilderTopBar from 'components/CustomPageBuilder/TopBar';
import DescriptionBuilderContent from 'components/DescriptionBuilder/DescriptionBuilderContent';
import ContentBuilderSettings from 'components/DescriptionBuilder/Settings';

import { type TypedLinkProps } from 'utils/cl-router/Link';
import { useLocation } from 'utils/router';

type Props = {
  staticPageId: string;
  backPath: string;
  previewLink: TypedLinkProps;
  titleMultiloc: Multiloc;
};

const CustomPageBuilderPage = ({
  staticPageId,
  backPath,
  previewLink,
  titleMultiloc,
}: Props) => {
  const locale = useLocale();
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const { pathname } = useLocation();

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const locales = useAppConfigurationLocales();
  const { data: layout } = useCustomPageLayout(staticPageId);
  const { mutateAsync: upsertCustomPageLayout } = useUpsertCustomPageLayout();

  const [contentBuilderErrors, setContentBuilderErrors] =
    useState<ContentBuilderErrors>({});
  const [imageUploading, setImageUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  // Memoised so the frame doesn't re-deserialize on every render.
  const editorData = useMemo(
    () => normalizeCustomPageLayout(layout?.data.attributes.craftjs_json),
    [layout]
  );

  const builderVisible = pathname.includes(CUSTOM_PAGE_BUILDER_PATH);

  // DO NOT REMOVE THESE useCallbacks, without them the content builder
  // becomes horribly slow
  const handleErrors = useCallback((newErrors: ContentBuilderErrors) => {
    setContentBuilderErrors((contentBuilderErrors) => ({
      ...contentBuilderErrors,
      ...newErrors,
    }));
  }, []);

  const handleDeleteElement = useCallback((id: string) => {
    setContentBuilderErrors((contentBuilderErrors) => {
      const { [id]: _id, ...rest } = contentBuilderErrors;
      return rest;
    });
  }, []);

  if (!locales || !builderVisible || !layout) {
    return null;
  }

  const hasError =
    Object.values(contentBuilderErrors).filter((node) => node.hasError).length >
    0;

  const handleSave = async (nodes: SerializedNodes): Promise<boolean> => {
    if (isSaving) return false;
    setIsSaving(true);
    setSaveError(false);

    try {
      await upsertCustomPageLayout({ staticPageId, craftjs_json: nodes });
      return true;
    } catch {
      setSaveError(true);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditorChange = (nodes: SerializedNodes) => {
    iframeRef.current?.contentWindow?.postMessage(nodes, window.location.href);
  };

  const handleSelectedLocaleChange = (newLocale: SupportedLocale) => {
    iframeRef.current?.contentWindow?.postMessage(
      { selectedLocale: newLocale },
      window.location.href
    );

    setSelectedLocale(newLocale);
  };

  return (
    <ContentBuilderLayoutProvider layoutId={layout.data.id}>
      <FullscreenContentBuilder
        onErrors={handleErrors}
        onDeleteElement={handleDeleteElement}
        onUploadImage={setImageUploading}
      >
        <Editor isPreview={false} onNodesChange={handleEditorChange}>
          <CustomPageBuilderTopBar
            hasError={hasError}
            hasPendingState={imageUploading}
            previewEnabled={previewEnabled}
            setPreviewEnabled={setPreviewEnabled}
            selectedLocale={selectedLocale}
            onSelectLocale={handleSelectedLocaleChange}
            backPath={backPath}
            previewLink={previewLink}
            titleMultiloc={titleMultiloc}
            onSave={handleSave}
            isSaving={isSaving}
            saveHasError={saveError}
          />
          <Box
            mt={`${stylingConsts.menuHeight}px`}
            display={previewEnabled ? 'none' : 'flex'}
          >
            <CustomPageBuilderToolbox />
            <DescriptionBuilderContent
              selectedLocale={selectedLocale}
              platformLocale={locale}
              editorData={editorData}
            />
            <ContentBuilderSettings />
          </Box>
        </Editor>
        <Box justifyContent="center" display={previewEnabled ? 'flex' : 'none'}>
          <CustomPageBuilderEditModePreview
            staticPageId={staticPageId}
            ref={iframeRef}
            selectedLocale={selectedLocale}
          />
        </Box>
      </FullscreenContentBuilder>
    </ContentBuilderLayoutProvider>
  );
};

export default CustomPageBuilderPage;
