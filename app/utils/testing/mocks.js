import moment from 'moment';

/*
 * utility functions shared by different test files
 */

export const generateResourcesIdeaValue = (id) => ({
  data: {
    id,
    attributes: {},
    relationships: {},
  },
});

export const generateResourcesTopicValue = (id) => ({
  data: {
    id,
    attributes: {},
    relationships: {},
  },
});

export const generateResourcesAreaValue = (id) => ({
  data: {
    id,
    attributes: {},
    relationships: {},
  },
});


export const generateResourcesPageValue = (id) => ({
  data: {
    id,
    attributes: {},
    relationships: {},
  },
});

export const generateResourcesUserValue = (id) => ({
  data: {
    id,
    attributes: {},
    relationships: {},
  },
});

export const generateResourcesProjectValue = (id) => ({
  data: {
    id,
    attributes: {},
    relationships: {},
  },
  links: {},
});

export const generateResourcesPhaseValue = (id, which) => {
  let startAt;
  let endAt;

  if (which === 'current') {
    startAt = moment().subtract(1, 'month');
    endAt = moment().add(1, 'month');
  } else if (which === 'past') {
    startAt = moment().subtract(3, 'month');
    endAt = moment().subtract(1, 'month');
  } else {
    // coming
    startAt = moment().add(1, 'month');
    endAt = moment().add(3, 'month');
  }

  return {
    data: {
      id,
      attributes: {
        start_at: startAt.format('YYYY-MM-DD'),
        end_at: endAt.format('YYYY-MM-DD'),
      },
      relationships: {},
    },
    links: {},
  };
};

export const generateResourcesNotificationValue = (id, attributes) => ({
  data: {
    id,
    attributes,
    relationships: {},
  },
});

export const generateResourcesEventValue = (id, which) => {
  let startAt;
  let endAt;

  if (which === 'past') {
    startAt = moment().subtract(3, 'month');
    endAt = moment().subtract(1, 'month');
  } else {
    // current / coming
    startAt = moment().add(1, 'month');
    endAt = moment().add(3, 'month');
  }

  return {
    data: {
      id,
      attributes: {
        start_at: startAt.format('YYYY-MM-DD'),
        end_at: endAt.format('YYYY-MM-DD'),
      },
      relationships: {},
    },
    links: {},
  };
};

export const generateResourcesVoteValue = (id, allUp, allDown) => {
  let mode;
  if (allUp) {
    mode = 'up';
  } else if (allDown) {
    mode = 'down';
  } else {
    mode = (id % 2 === 0 ? 'up' : 'down');
  }

  return {
    data: {
      id,
      attributes: { mode },
      relationships: {},
    },
  };
};

export const generateResourcesCommentValue = (id) => ({
  data: {
    id,
    attributes: {
      body_multiloc: {
        en: '<p>Voluptatem pariatur corporis ea assumenda qui. Ut accusamus alias delectus nobis autem soluta quo. Nihil tempore aut officiis esse. Cumque eum minima minus.</p><p>Error ut similique est enim non. Velit veniam dolore. Velit minus excepturi ut. Laborum doloribus ab provident iusto voluptatem sint et.</p><p>Odio aut minus aut qui dolorem repellendus. Omnis repellendus quisquam et id. Mollitia dolores et non et possimus.</p>',
        nl: '<p>Voluptas eos sed dicta in in iusto. Quam voluptatem labore illo modi sit vitae. Quia aperiam fugit autem rem. Aliquam non provident dolor necessitatibus hic dolores reiciendis.</p><p>Ratione omnis qui quia provident molestias dolores. Necessitatibus sed quia facilis rerum nam. Aut ratione et id ad rerum enim autem. Doloribus harum soluta voluptatem dicta aliquid amet.</p><p>Dignissimos dicta adipisci exercitationem. Sint fuga minima. Consequatur vero ipsum ex fugiat quas temporibus voluptate.</p>',
      },
      created_at: '2017-04-13T08:14:34.183Z',
      updated_at: '2017-04-14T15:34:41.536Z',
    },
    relationships: {},
  },
});

