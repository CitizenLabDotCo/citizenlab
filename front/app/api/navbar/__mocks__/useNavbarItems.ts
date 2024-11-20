import { INavbarItem } from '../types';

export const navbarItemsData: INavbarItem[] = [
  {
    id: '317f5ce0-7cd6-406b-b365-3a852bc2acf1',
    type: 'nav_bar_item',
    attributes: {
      title_multiloc: {
        en: 'Home',
        'nl-BE': 'Home',
        'fr-BE': 'Accueil',
      },
      slug: null,
      code: 'home',
      ordering: 0,
      created_at: '2021-12-10T10:36:36.742Z',
      updated_at: '2021-12-10T10:36:36.742Z',
    },
    relationships: {
      static_page: {
        data: null,
      },
      project: {
        data: null,
      },
    },
  },
  {
    id: 'a51b389f-279c-49c8-9631-a86d862ffd12',
    type: 'nav_bar_item',
    attributes: {
      title_multiloc: {
        en: 'All projects',
        'nl-BE': 'Alle projecten',
        'fr-BE': 'Tous les projets',
      },
      slug: null,
      code: 'projects',
      ordering: 1,
      created_at: '2021-12-10T10:36:36.750Z',
      updated_at: '2021-12-10T10:36:36.750Z',
    },
    relationships: {
      static_page: {
        data: null,
      },
      project: {
        data: null,
      },
    },
  },
  {
    id: '2003e851-6cae-4ce8-a0e4-4b930fe73009',
    type: 'nav_bar_item',
    attributes: {
      title_multiloc: {
        en: 'All input',
        'nl-BE': 'Bijdragen',
        'fr-BE': 'Contributions',
      },
      slug: null,
      code: 'all_input',
      ordering: 2,
      created_at: '2021-12-10T10:36:36.759Z',
      updated_at: '2021-12-10T10:36:36.759Z',
    },
    relationships: {
      static_page: {
        data: null,
      },
      project: {
        data: null,
      },
    },
  },
  {
    id: 'f2e26926-40b6-4692-8321-d1a7ed7ee77c',
    type: 'nav_bar_item',
    attributes: {
      title_multiloc: {
        en: 'Events',
        'fr-BE': 'Événements',
        'nl-BE': 'Activiteiten',
      },
      slug: null,
      code: 'events',
      ordering: 4,
      created_at: '2021-12-10T10:41:46.617Z',
      updated_at: '2021-12-10T10:41:46.656Z',
    },
    relationships: {
      static_page: {
        data: null,
      },
      project: {
        data: null,
      },
    },
  },
  {
    id: '794befb8-ba94-45bd-bedf-833d6dd8a38a',
    type: 'nav_bar_item',
    attributes: {
      title_multiloc: {
        en: 'About',
        'nl-BE': 'Over',
        'fr-BE': 'À propos',
      },
      slug: 'about',
      code: 'custom',
      ordering: 5,
      created_at: '2021-12-10T10:36:36.784Z',
      updated_at: '2021-12-10T10:41:46.652Z',
    },
    relationships: {
      static_page: {
        data: {
          id: 'e7854e94-3074-4607-b66e-0422aa3d8359',
          type: 'static_page',
        },
      },
      project: {
        data: null,
      },
    },
  },
  {
    id: '2dcbaf58-4aaf-4644-a86a-fc822f1747d1',
    type: 'nav_bar_item',
    attributes: {
      title_multiloc: {
        en: 'FAQ',
        'nl-BE': 'Veelgestelde vragen',
        'fr-BE': 'Foire aux questions (FAQ)',
      },
      slug: 'custom',
      code: 'custom',
      ordering: 6,
      created_at: '2021-12-10T10:36:36.793Z',
      updated_at: '2021-12-10T10:41:46.652Z',
    },
    relationships: {
      static_page: {
        data: {
          id: '793d56cc-c8b3-4422-b393-972b71f82aa2',
          type: 'static_page',
        },
      },
      project: {
        data: null,
      },
    },
  },
  {
    id: '037c953a-f717-4d17-beca-b0b684335b7b',
    type: 'nav_bar_item',
    attributes: {
      title_multiloc: {
        en: 'Proposals',
        'nl-BE': 'Voorstellen',
        'fr-BE': 'Propositions',
      },
      code: 'custom',
      ordering: 3,
      created_at: '2021-12-10T10:36:36.767Z',
      updated_at: '2021-12-10T10:41:30.660Z',
      slug: null,
    },
    relationships: {
      static_page: {
        data: null,
      },
      project: {
        data: null,
      },
    },
  },
];

export default jest.fn(() => {
  return { data: { data: navbarItemsData } };
});
