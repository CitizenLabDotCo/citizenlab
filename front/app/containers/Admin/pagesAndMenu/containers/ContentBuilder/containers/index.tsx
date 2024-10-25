import React, { useState } from 'react';

import { Box, stylingConsts } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';
import { isEmpty } from 'lodash-es';
import { useTheme } from 'styled-components';
import { SupportedLocale } from 'typings';

import { IHomepageBuilderLayout } from 'api/home_page_layout/types';
import useHomepageLayout from 'api/home_page_layout/useHomepageLayout';

import useLocale from 'hooks/useLocale';

import Frame from 'components/admin/ContentBuilder/Frame';
import { StyledRightColumn } from 'components/admin/ContentBuilder/Frame/FrameWrapper';
import FullscreenContentBuilder from 'components/admin/ContentBuilder/FullscreenContentBuilder';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';
import ContentBuilderSettings from 'components/admin/ContentBuilder/Settings';
import { ContentBuilderErrors } from 'components/admin/ContentBuilder/typings';
import ViewContainer from 'components/admin/ContentBuilder/ViewContainer';
import { View } from 'components/admin/ContentBuilder/ViewContainer/typings';

import HomepageBanner from '../components/CraftComponents/HomepageBanner';
import Projects from '../components/CraftComponents/Projects';
import Editor from '../components/Editor';
import HomepageBuilderToolbox from '../components/HomepageBuilderToolbox';
import HomepageBuilderTopBar from '../components/HomepageBuilderTopBar';

interface Props {
  homepageLayout: IHomepageBuilderLayout;
}

const HomepageBuilder = ({ homepageLayout }: Props) => {
  const locale = useLocale();
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const [view, setView] = useState<View>('document');

  const theme = useTheme();

  const [initialData] = useState(() => {
    const { craftjs_json } = homepageLayout.data.attributes;

    if (isEmpty(craftjs_json)) {
      return undefined;
    }

    return craftjs_json;
  });

  const [contentBuilderErrors, setContentBuilderErrors] =
    useState<ContentBuilderErrors>({});

  const [imageUploading, setImageUploading] = useState(false);

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
      <Editor isPreview={false}>
        <HomepageBuilderTopBar
          hasError={hasError}
          hasPendingState={imageUploading}
          selectedLocale={selectedLocale}
          view={view}
          setView={setView}
          onSelectLocale={handleSelectedLocaleChange}
        />
        <Box mt={`${stylingConsts.menuHeight}px`}>
          <HomepageBuilderToolbox selectedLocale={selectedLocale} />
          <LanguageProvider
            contentBuilderLocale={selectedLocale}
            platformLocale={locale}
          >
            <StyledRightColumn>
              <ViewContainer view={view}>
                <Frame editorData={initialData}>
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
                </Frame>
              </ViewContainer>
            </StyledRightColumn>
          </LanguageProvider>
          <ContentBuilderSettings />
        </Box>
      </Editor>
    </FullscreenContentBuilder>
  );
};

const HomepageBuilderWrapper = () => {
  const { data: homepageLayout } = useHomepageLayout();
  if (!homepageLayout) return null;

  return <HomepageBuilder homepageLayout={homepageLayout} />;
};

export default HomepageBuilderWrapper;
