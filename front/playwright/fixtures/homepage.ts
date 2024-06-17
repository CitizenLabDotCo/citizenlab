import { Page } from '@playwright/test';

import { loginAsAdminRequest } from './user';

const homepageMinimalData = {
  ROOT: {
    type: 'div',
    isCanvas: true,
    props: { id: 'e2e-content-builder-frame' },
    displayName: 'div',
    custom: {},
    hidden: false,
    nodes: ['j_8F37ESLH', 'RUeJQobA8i'],
    linkedNodes: {},
  },
  RUeJQobA8i: {
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
  j_8F37ESLH: {
    type: { resolvedName: 'HomepageBanner' },
    isCanvas: false,
    props: {
      homepageSettings: {
        banner_layout: 'full_width_banner_layout',
        banner_avatars_enabled: true,
        banner_cta_signed_in_url: 'https://www.google.com',
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
      image: {},
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
};

export class Homepage {
  constructor(public readonly page: Page) {}

  async updateMinimalHomepage() {
    const response = await loginAsAdminRequest(this.page);
    await this.page.request.post(
      `web_api/v1/home_pages/content_builder_layouts/homepage/upsert`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${response.jwt}`,
        },
        data: {
          content_builder_layout: {
            enabled: true,
            craftjs_json: homepageMinimalData,
          },
        },
      }
    );
  }
}
