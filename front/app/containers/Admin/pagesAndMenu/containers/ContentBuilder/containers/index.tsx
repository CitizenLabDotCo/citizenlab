import React, { useState, useRef, useEffect } from 'react';

import { Box, stylingConsts } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';
import { isEmpty } from 'lodash-es';
import { useTheme } from 'styled-components';
import { SupportedLocale } from 'typings';

import useHomepageLayout from 'api/home_page_layout/useHomepageLayout';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import { StyledRightColumn } from 'components/admin/ContentBuilder/Frame/FrameWrapper';
import FullscreenContentBuilder from 'components/admin/ContentBuilder/FullscreenContentBuilder';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';
import ContentBuilderSettings from 'components/admin/ContentBuilder/Settings';
import { ContentBuilderErrors } from 'components/admin/ContentBuilder/typings';

import { isNilOrError } from 'utils/helperUtils';

import HomepageBanner from '../components/CraftComponents/HomepageBanner';
import Projects from '../components/CraftComponents/Projects';
import Editor from '../components/Editor';
import HomepageBuilderEditModePreview from '../components/HomepageBuilderEditModePreview';
import HomepageBuilderToolbox from '../components/HomepageBuilderToolbox';
import HomepageBuilderTopBar from '../components/HomepageBuilderTopBar';

const HomepageBuilderPage = () => {
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<
    SupportedLocale | undefined
  >();

  const theme = useTheme();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const locale = useLocale();
  const locales = useAppConfigurationLocales();
  const { data: homepageLayout } = useHomepageLayout();

  useEffect(() => {
    if (!isNilOrError(locale)) {
      setSelectedLocale(locale);
    }
  }, [locale]);

  const [contentBuilderErrors, setContentBuilderErrors] =
    useState<ContentBuilderErrors>({});

  const [imageUploading, setImageUploading] = useState(false);

  if (isNilOrError(locales)) {
    return null;
  }

  const hasError =
    Object.values(contentBuilderErrors).filter((node) => node.hasError).length >
    0;

  const handleErrors = (newErrors: ContentBuilderErrors) => {
    setContentBuilderErrors((contentBuilderErrors) => ({
      ...contentBuilderErrors,
      ...newErrors,
    }));
  };

  const handleDeleteElement = (id: string) => {
    setContentBuilderErrors((contentBuilderErrors) => {
      const { [id]: _id, ...rest } = contentBuilderErrors;
      return rest;
    });
  };

  const getEditorData = () => {
    if (
      homepageLayout &&
      !isEmpty(homepageLayout.data.attributes.craftjs_json)
    ) {
      return homepageLayout.data.attributes.craftjs_json;
    } else {
      return undefined;
    }
  };

  const handleEditorChange = (nodes: SerializedNodes) => {
    iframeRef.current &&
      iframeRef.current.contentWindow &&
      iframeRef.current.contentWindow.postMessage(nodes, window.location.href);
  };

  const handleSelectedLocaleChange = ({
    locale,
  }: {
    locale: SupportedLocale;
    editorData: SerializedNodes;
  }) => {
    setSelectedLocale(locale);
  };

  return (
    <FullscreenContentBuilder
      onErrors={handleErrors}
      onDeleteElement={handleDeleteElement}
      onUploadImage={setImageUploading}
    >
      <Editor isPreview={false} onNodesChange={handleEditorChange}>
        <HomepageBuilderTopBar
          hasError={hasError}
          hasPendingState={imageUploading}
          previewEnabled={previewEnabled}
          setPreviewEnabled={setPreviewEnabled}
          selectedLocale={selectedLocale}
          onSelectLocale={handleSelectedLocaleChange}
        />
        <Box
          mt={`${stylingConsts.menuHeight}px`}
          display={previewEnabled ? 'none' : 'flex'}
        >
          {selectedLocale && (
            <HomepageBuilderToolbox selectedLocale={selectedLocale} />
          )}
          <StyledRightColumn>
            <LanguageProvider
              contentBuilderLocale={selectedLocale}
              platformLocale={locale}
            >
              <Box width="1000px">
                <ContentBuilderFrame editorData={getEditorData()}>
                  <HomepageBanner
                    homepageSettings={{
                      banner_avatars_enabled: true,
                      banner_layout: 'full_width_banner_layout',
                      banner_signed_in_header_multiloc: {},
                      banner_cta_signed_in_text_multiloc: {},
                      banner_cta_signed_in_type: 'no_button',
                      banner_cta_signed_in_url: null,
                      banner_signed_out_header_multiloc: {},
                      banner_signed_out_subheader_multiloc: {},
                      banner_signed_out_header_overlay_color:
                        theme.colors.tenantPrimary,
                      banner_signed_out_header_overlay_opacity: 90,
                      banner_signed_in_header_overlay_color:
                        theme.colors.tenantPrimary,
                      banner_signed_in_header_overlay_opacity: 90,
                      banner_cta_signed_out_text_multiloc: {},
                      banner_cta_signed_out_type: 'sign_up_button',
                      banner_cta_signed_out_url: null,
                    }}
                  />
                  <Projects />
                </ContentBuilderFrame>
              </Box>
            </LanguageProvider>
          </StyledRightColumn>
          <ContentBuilderSettings />
        </Box>
      </Editor>
      <Box justifyContent="center" display={previewEnabled ? 'flex' : 'none'}>
        <HomepageBuilderEditModePreview
          ref={iframeRef}
          selectedLocale={selectedLocale}
        />
      </Box>
    </FullscreenContentBuilder>
  );
};

export default HomepageBuilderPage;
