export default [
  {
    id: '841c8eeb-7759-47f5-8563-1a3ebc88bf4f',
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
          id: '8cfc851c-e640-4ca4-84c8-3427250d01f1',
          type: 'page',
        },
      },
    },
  },
  {
    id: 'e93a519c-d2b4-4f87-99ae-fc01f83de398',
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
          id: '75a41fd0-cafc-46b6-a7b5-ee995ac66993',
          type: 'page',
        },
      },
    },
  },
  {
    id: 'a92dd514-cf36-4b83-9a47-242dc356f9bf',
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
          id: '5e44ada7-550a-4117-95f2-b7dda2fdb5d7',
          type: 'page',
        },
      },
    },
  },
  {
    id: '95dce071-fddb-4f94-834f-985a56676d39',
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
          id: '72708427-6899-46d3-a1f0-a28da3441f52',
          type: 'page',
        },
      },
    },
  },
  {
    id: 'a932a7ec-8147-4e49-92d4-2cb0a7adb3a3',
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
          id: 'e453ad32-b743-45fc-bb98-6138ab1e1f78',
          type: 'page',
        },
      },
    },
  },
  {
    id: 'bb954a2d-43a7-4d61-91d8-5d6133a17c58',
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
          id: '30ce9b3e-549e-484d-9493-1fd40a11ec57',
          type: 'page',
        },
      },
    },
  },
  {
    id: 'e5b65cdb-1d22-45f4-ad97-35ab861a8c35',
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
          id: '704d5b7f-91c1-4afc-b381-a10e184834f3',
          type: 'page',
        },
      },
    },
  },
];
