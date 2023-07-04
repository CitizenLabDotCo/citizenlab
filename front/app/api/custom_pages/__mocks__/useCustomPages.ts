import { ICustomPageData } from '../types';

export const customPagesData: ICustomPageData[] = [
  {
    id: 'a91f2896-a707-4acd-bf9a-bdef9d07a69e',
    type: 'static_page',
    attributes: {
      title_multiloc: {
        en: 'ds',
        'fr-BE': 'dsfsd',
        'nl-BE': 'Minima quia dolor voluptas.',
      },
      top_info_section_multiloc: {
        en: '\u003cp\u003eLibero ut non. Officiis sit omnis. Maxime et doloribus.\u003c/p\u003e\u003cp\u003eEnim sit dolorum. Sed qui et. Rerum animi perspiciatis.\u003c/p\u003e\u003cp\u003eInventore et perferendis. Quod est error. Sint totam nihil.\u003c/p\u003e',
      },
      slug: 'minima-quia-dolor-voluptas',
      created_at: '2023-06-29T16:09:11.002Z',
      updated_at: '2023-07-04T13:22:28.211Z',
      code: 'custom',
      banner_enabled: false,
      banner_layout: 'full_width_banner_layout',
      banner_overlay_color: null,
      banner_overlay_opacity: null,
      banner_cta_button_multiloc: {},
      banner_cta_button_type: 'no_button',
      banner_cta_button_url: null,
      banner_header_multiloc: {},
      banner_subheader_multiloc: {},
      top_info_section_enabled: true,
      files_section_enabled: true,
      projects_enabled: false,
      projects_filter_type: 'no_filter',
      events_widget_enabled: false,
      bottom_info_section_enabled: false,
      header_bg: {
        large: null,
        medium: null,
        small: null,
      },
      nav_bar_item_title_multiloc: {
        en: 'ds',
      },
    },
    relationships: {
      nav_bar_item: {
        data: null,
      },
      topics: {
        data: [],
      },
      areas: {
        data: [],
      },
    },
  },
];

export default jest.fn(() => {
  return { data: { data: customPagesData } };
});
