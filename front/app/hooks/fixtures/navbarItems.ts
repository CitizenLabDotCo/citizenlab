import { INavbarItem } from 'services/navbar';

const VISIBLE_ITEMS: INavbarItem[] = [
  {
    id: 'c78daa47-8e53-47bf-acec-e16588f827cb',
    type: 'navbar_item',
    attributes: {
      type: 'home',
      title_multiloc: {
        en: 'Home',
      },
      visible: true,
      ordering: 0,
    },
    relationships: {
      page: {
        data: {
          id: '71b9533e-773c-4af3-b457-fbaf3f82fdef',
          type: 'page',
        },
      },
    },
  },
  {
    id: 'edeab39d-c361-4093-ae18-013579385e72',
    type: 'navbar_item',
    attributes: {
      type: 'projects',
      title_multiloc: {
        en: 'Projects',
      },
      visible: true,
      ordering: 1,
    },
    relationships: {
      page: {
        data: {
          id: '71b9533e-773c-4af3-b457-fbaf3f82fdef',
          type: 'page',
        },
      },
    },
  },
  {
    id: '41a151ed-3d1b-42ab-838b-d8e1e7305a09',
    type: 'navbar_item',
    attributes: {
      type: 'all_input',
      title_multiloc: {
        en: 'All input',
      },
      visible: true,
      ordering: 2,
    },
    relationships: {
      page: {
        data: {
          id: '6f95f9df-28ed-48ef-814d-630d10c75420',
          type: 'page',
        },
      },
    },
  },
  {
    id: '9398677e-bce8-4577-b63d-3fcdf9a886ea',
    type: 'navbar_item',
    attributes: {
      type: 'proposals',
      title_multiloc: {
        en: 'Proposals',
      },
      visible: true,
      ordering: 3,
    },
    relationships: {
      page: {
        data: {
          id: 'ee62cecb-731d-49ea-9778-13fc855340ba',
          type: 'page',
        },
      },
    },
  },
  {
    id: '943f0db5-9e3e-432c-b82b-d402ce00379b',
    type: 'navbar_item',
    attributes: {
      type: 'events',
      title_multiloc: {
        en: 'Events',
      },
      visible: true,
      ordering: 4,
    },
    relationships: {
      page: {
        data: {
          id: 'fe891ffd-8996-4a22-9ca5-f7071739016c',
          type: 'page',
        },
      },
    },
  },
  {
    id: '31dc140a-bc32-4af3-933f-e46d17e317c6',
    type: 'navbar_item',
    attributes: {
      type: 'custom',
      title_multiloc: {
        en: 'About',
      },
      visible: true,
      ordering: 5,
    },
    relationships: {
      page: {
        data: {
          id: 'cedbda78-3ebc-4bd6-8c54-e4cee4bda490',
          type: 'page',
        },
      },
    },
  },
  {
    id: 'ddfda514-ad5b-4e33-8369-c1d755ef5c2c',
    type: 'navbar_item',
    attributes: {
      type: 'custom',
      title_multiloc: {
        en: 'FAQ',
      },
      visible: true,
      ordering: 6,
    },
    relationships: {
      page: {
        data: {
          id: '7d2414cf-d120-4a77-b5f5-940b171b737d',
          type: 'page',
        },
      },
    },
  },
];

const HIDDEN_ITEMS: INavbarItem[] = [
  {
    id: '64f7bfaf-5c72-4810-b6d3-9037a8cdeb34',
    type: 'navbar_item',
    attributes: {
      type: 'custom',
      title_multiloc: {
        en: '',
      },
      visible: false,
      ordering: 0,
    },
    relationships: {
      page: {
        data: {
          id: 'f6caec29-ec11-440c-ad69-02b3422fa24b',
          type: 'page',
        },
      },
    },
  },
  {
    id: '5cba8fed-0a1f-4a1e-a841-b5f62684ef12',
    type: 'navbar_item',
    attributes: {
      type: 'custom',
      title_multiloc: {
        en: 'Proposals',
      },
      visible: false,
      ordering: 1,
    },
    relationships: {
      page: {
        data: {
          id: '6bb02bb1-36be-403f-ad44-0fc54781bd4c',
          type: 'page',
        },
      },
    },
  },
  {
    id: 'b98e681e-b6de-4fd8-97f6-4c87307586f3',
    type: 'navbar_item',
    attributes: {
      type: 'custom',
      title_multiloc: {
        en: 'River Shuttle',
      },
      visible: false,
      ordering: 2,
    },
    relationships: {
      page: {
        data: {
          id: '222dc99e-baae-4ab5-b0c9-8325d6ad3fc5',
          type: 'page',
        },
      },
    },
  },
  {
    id: 'aa23cdc7-90b4-4717-a92f-e3dc71873396',
    type: 'navbar_item',
    attributes: {
      type: 'custom',
      title_multiloc: {
        en: '1030/0',
      },
      visible: false,
      ordering: 3,
    },
    relationships: {
      page: {
        data: {
          id: '223e85a8-e3ec-457a-84b4-891b09007770',
          type: 'page',
        },
      },
    },
  },
];

export const allItems = [...VISIBLE_ITEMS, ...HIDDEN_ITEMS];
export const visibleItems = VISIBLE_ITEMS;
export const hiddenItems = HIDDEN_ITEMS;
