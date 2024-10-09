import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

// import useHomepageLayout from 'api/home_page_layout/useHomepageLayout';

import Editor from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Editor';

import { IMAGES_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';

import eventEmitter from 'utils/eventEmitter';

const homepageMinimalData = {
  ROOT: {
    type: 'div',
    isCanvas: true,
    props: { id: 'e2e-content-builder-frame' },
    displayName: 'div',
    custom: {},
    hidden: false,
    nodes: ['HOMEPAGEBANNER', 'PROJECTS'],
    linkedNodes: {},
    parent: '',
  },
  HOMEPAGEBANNER: {
    type: { resolvedName: 'HomepageBanner' },
    isCanvas: false,
    props: {
      homepageSettings: {
        banner_layout: 'full_width_banner_layout',
        banner_avatars_enabled: true,
        banner_cta_signed_in_url: '',
        banner_cta_signed_in_type: 'no_button',
        banner_cta_signed_out_url: '',
        banner_cta_signed_out_type: 'sign_up_button',
        banner_signed_in_header_multiloc: { en: '' },
        banner_signed_out_header_multiloc: { en: '' },
        banner_cta_signed_in_text_multiloc: { en: '' },
        banner_cta_signed_out_text_multiloc: { en: '' },
        banner_signed_out_subheader_multiloc: { en: '' },
        banner_signed_in_header_overlay_color: '#0A5159',
        banner_signed_out_header_overlay_color: '#0A5159',
        banner_signed_in_header_overlay_opacity: 90,
        banner_signed_out_header_overlay_opacity: 90,
      },
      image: {
        imageUrl:
          'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/header.jpg',
      },
      errors: [],
      hasError: false,
    },
    displayName: 'HomepageBanner',
    custom: {
      title: {
        id: 'app.containers.admin.ContentBuilder.homepage.homepageBanner',
        defaultMessage: 'Homepage banner',
      },
      noPointerEvents: true,
      noDelete: true,
    },
    parent: 'ROOT',
    hidden: false,
    nodes: [],
    linkedNodes: {},
  },
  PROJECTS: {
    type: { resolvedName: 'Projects' },
    isCanvas: false,
    props: { currentlyWorkingOnText: { en: '' } },
    displayName: 'Projects',
    custom: {
      title: {
        id: 'app.containers.Admin.pagesAndMenu.containers.ContentBuilder.components.CraftComponents.Projects.projectsTitle',
        defaultMessage: 'Projects',
      },
      noPointerEvents: true,
      noDelete: true,
    },
    parent: 'ROOT',
    hidden: false,
    nodes: [],
    linkedNodes: {},
  },
};

const handleLoadImages = () => {
  eventEmitter.emit(IMAGES_LOADED_EVENT);
};

const Preview = () => {
  // const { data: homepageLayout } = useHomepageLayout();

  // const homepageContent = homepageLayout?.data.attributes.craftjs_json;

  return (
    <Box>
      <Editor isPreview={true}>
        <ContentBuilderFrame
          editorData={homepageMinimalData}
          onLoadImages={handleLoadImages}
        />
      </Editor>
    </Box>
  );
};

export default Preview;
