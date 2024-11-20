const visitorReferrers = {
  params:
    '?query%5Bfact%5D=visit&query%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=citizen&query%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=&query%5Bfilters%5D%5Bdimension_date_first_action.date%5D%5Bto%5D=2023-11-03&query%5Bgroups%5D=dimension_referrer_type.id&query%5Baggregations%5D%5Ball%5D=count&query%5Baggregations%5D%5Bdimension_referrer_type.name%5D=first',
  response: {
    data: {
      type: 'analytics',
      attributes: [
        {
          'dimension_referrer_type.id': 'ae290a32-4b83-400c-9081-9bad4d13bcb6',
          count: 26,
          first_dimension_referrer_type_name: 'Websites',
        },
        {
          'dimension_referrer_type.id': 'b4f6fd01-4724-4a9c-87a2-11d9c2143024',
          count: 483,
          first_dimension_referrer_type_name: 'Direct Entry',
        },
        {
          'dimension_referrer_type.id': 'cadb0b3f-95d6-4c10-8d81-7732b966ddcb',
          count: 2,
          first_dimension_referrer_type_name: 'Social Networks',
        },
      ],
    },
  },
};

const postsOverTime = {
  params:
    '?query%5B%5D%5Bfact%5D=post&query%5B%5D%5Bfilters%5D%5Bdimension_date_created.date%5D%5Bfrom%5D=2017-01-01&query%5B%5D%5Bfilters%5D%5Bdimension_date_created.date%5D%5Bto%5D=2023-11-03&query%5B%5D%5Bfilters%5D%5Bdimension_type.name%5D=idea&query%5B%5D%5Bfilters%5D%5Bpublication_status%5D=published&query%5B%5D%5Bgroups%5D=dimension_date_created.month&query%5B%5D%5Baggregations%5D%5Ball%5D=count&query%5B%5D%5Baggregations%5D%5Bdimension_date_created.date%5D=first&query%5B%5D%5Bfact%5D=post&query%5B%5D%5Bfilters%5D%5Bdimension_date_created.date%5D%5Bto%5D=2023-11-03&query%5B%5D%5Bfilters%5D%5Bdimension_type.name%5D=idea&query%5B%5D%5Bfilters%5D%5Bpublication_status%5D=published&query%5B%5D%5Baggregations%5D%5Ball%5D=count',
  response: {
    data: {
      type: 'analytics',
      attributes: [
        [
          {
            'dimension_date_created.month': '2023-02',
            count: 4,
            first_dimension_date_created_date: '2023-02-15',
          },
          {
            'dimension_date_created.month': '2023-03',
            count: 8,
            first_dimension_date_created_date: '2023-03-23',
          },
          {
            'dimension_date_created.month': '2023-04',
            count: 2,
            first_dimension_date_created_date: '2023-04-04',
          },
          {
            'dimension_date_created.month': '2023-05',
            count: 9,
            first_dimension_date_created_date: '2023-05-12',
          },
          {
            'dimension_date_created.month': '2023-06',
            count: 8,
            first_dimension_date_created_date: '2023-06-20',
          },
          {
            'dimension_date_created.month': '2023-07',
            count: 6,
            first_dimension_date_created_date: '2023-07-20',
          },
          {
            'dimension_date_created.month': '2023-08',
            count: 3,
            first_dimension_date_created_date: '2023-08-11',
          },
          {
            'dimension_date_created.month': '2023-10',
            count: 11,
            first_dimension_date_created_date: '2023-10-18',
          },
          {
            'dimension_date_created.month': '2023-11',
            count: 3,
            first_dimension_date_created_date: '2023-11-03',
          },
        ],
        [
          {
            count: 330,
          },
        ],
      ],
    },
  },
};

const commentsOverTime = {
  params:
    '?query%5B%5D%5Bfact%5D=participation&query%5B%5D%5Bfilters%5D%5Bdimension_date_created.date%5D%5Bfrom%5D=2017-01-01&query%5B%5D%5Bfilters%5D%5Bdimension_date_created.date%5D%5Bto%5D=2023-11-03&query%5B%5D%5Bfilters%5D%5Bdimension_type.name%5D=comment&query%5B%5D%5Bfilters%5D%5Bdimension_type.parent%5D%5B%5D=idea&query%5B%5D%5Bfilters%5D%5Bdimension_type.parent%5D%5B%5D=idea&query%5B%5D%5Bgroups%5D=dimension_date_created.month&query%5B%5D%5Baggregations%5D%5Ball%5D=count&query%5B%5D%5Baggregations%5D%5Bdimension_date_created.date%5D=first&query%5B%5D%5Bfact%5D=participation&query%5B%5D%5Bfilters%5D%5Bdimension_date_created.date%5D%5Bto%5D=2023-11-03&query%5B%5D%5Bfilters%5D%5Bdimension_type.name%5D=comment&query%5B%5D%5Bfilters%5D%5Bdimension_type.parent%5D%5B%5D=idea&query%5B%5D%5Bfilters%5D%5Bdimension_type.parent%5D%5B%5D=idea&query%5B%5D%5Baggregations%5D%5Ball%5D=count',
  response: {
    data: {
      type: 'analytics',
      attributes: [
        [
          {
            'dimension_date_created.month': '2023-02',
            count: 1,
            first_dimension_date_created_date: '2023-02-17',
          },
          {
            'dimension_date_created.month': '2023-03',
            count: 3,
            first_dimension_date_created_date: '2023-03-22',
          },
          {
            'dimension_date_created.month': '2023-04',
            count: 7,
            first_dimension_date_created_date: '2023-04-20',
          },
          {
            'dimension_date_created.month': '2023-05',
            count: 1,
            first_dimension_date_created_date: '2023-05-03',
          },
          {
            'dimension_date_created.month': '2023-06',
            count: 15,
            first_dimension_date_created_date: '2023-06-12',
          },
          {
            'dimension_date_created.month': '2023-08',
            count: 3,
            first_dimension_date_created_date: '2023-08-23',
          },
          {
            'dimension_date_created.month': '2023-09',
            count: 3,
            first_dimension_date_created_date: '2023-09-12',
          },
          {
            'dimension_date_created.month': '2023-10',
            count: 1,
            first_dimension_date_created_date: '2023-10-11',
          },
        ],
        [
          {
            count: 432,
          },
        ],
      ],
    },
  },
};

const reactionsOverTime = {
  params:
    '?query%5B%5D%5Bfact%5D=participation&query%5B%5D%5Bfilters%5D%5Bdimension_date_created.date%5D%5Bfrom%5D=2017-01-01&query%5B%5D%5Bfilters%5D%5Bdimension_date_created.date%5D%5Bto%5D=2023-11-03&query%5B%5D%5Bfilters%5D%5Bdimension_type.name%5D=reaction&query%5B%5D%5Bfilters%5D%5Bdimension_type.parent%5D=idea&query%5B%5D%5Bgroups%5D=dimension_date_created.month&query%5B%5D%5Baggregations%5D%5Bdimension_date_created.date%5D=first&query%5B%5D%5Baggregations%5D%5Blikes_count%5D=sum&query%5B%5D%5Baggregations%5D%5Bdislikes_count%5D=sum&query%5B%5D%5Bfact%5D=participation&query%5B%5D%5Bfilters%5D%5Bdimension_date_created.date%5D%5Bto%5D=2023-11-03&query%5B%5D%5Bfilters%5D%5Bdimension_type.name%5D=reaction&query%5B%5D%5Bfilters%5D%5Bdimension_type.parent%5D=idea&query%5B%5D%5Baggregations%5D%5Breactions_count%5D=sum',
  response: {
    data: {
      type: 'analytics',
      attributes: [
        [
          {
            'dimension_date_created.month': '2023-02',
            first_dimension_date_created_date: '2023-02-15',
            sum_likes_count: 4,
            sum_dislikes_count: 0,
          },
          {
            'dimension_date_created.month': '2023-03',
            first_dimension_date_created_date: '2023-03-21',
            sum_likes_count: 8,
            sum_dislikes_count: 1,
          },
          {
            'dimension_date_created.month': '2023-04',
            first_dimension_date_created_date: '2023-04-11',
            sum_likes_count: 2,
            sum_dislikes_count: 0,
          },
          {
            'dimension_date_created.month': '2023-05',
            first_dimension_date_created_date: '2023-05-03',
            sum_likes_count: 9,
            sum_dislikes_count: 1,
          },
          {
            'dimension_date_created.month': '2023-06',
            first_dimension_date_created_date: '2023-06-13',
            sum_likes_count: 5,
            sum_dislikes_count: 0,
          },
          {
            'dimension_date_created.month': '2023-07',
            first_dimension_date_created_date: '2023-07-25',
            sum_likes_count: 1,
            sum_dislikes_count: 0,
          },
          {
            'dimension_date_created.month': '2023-10',
            first_dimension_date_created_date: '2023-10-27',
            sum_likes_count: 2,
            sum_dislikes_count: 0,
          },
          {
            'dimension_date_created.month': '2023-11',
            first_dimension_date_created_date: '2023-11-03',
            sum_likes_count: 2,
            sum_dislikes_count: 0,
          },
        ],
        [
          {
            sum_reactions_count: 1592,
          },
        ],
      ],
    },
  },
};

const participantsOverTime = {
  params:
    '?query%5B%5D%5Bfact%5D=participation&query%5B%5D%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=citizen&query%5B%5D%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=&query%5B%5D%5Bfilters%5D%5Bdimension_project.id%5D=8f1dffb8-0fb6-4f00-af70-55c757f78f14&query%5B%5D%5Bfilters%5D%5Bdimension_date_created.date%5D%5Bto%5D=2023-11-03&query%5B%5D%5Bgroups%5D=dimension_date_created.month&query%5B%5D%5Baggregations%5D%5Bdimension_user_id%5D=count&query%5B%5D%5Baggregations%5D%5Bdimension_date_created.date%5D=first&query%5B%5D%5Bfact%5D=participation&query%5B%5D%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=citizen&query%5B%5D%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=&query%5B%5D%5Bfilters%5D%5Bdimension_project.id%5D=8f1dffb8-0fb6-4f00-af70-55c757f78f14&query%5B%5D%5Bfilters%5D%5Bdimension_date_created.date%5D%5Bto%5D=2023-11-03&query%5B%5D%5Baggregations%5D%5Bdimension_user_id%5D=count',
  response: {
    data: {
      type: 'analytics',
      attributes: [
        [
          {
            'dimension_date_created.month': '2023-02',
            count_participant_id: 1,
            first_dimension_date_created_date: '2023-02-15',
          },
          {
            'dimension_date_created.month': '2023-03',
            count_participant_id: 5,
            first_dimension_date_created_date: '2023-03-22',
          },
          {
            'dimension_date_created.month': '2023-04',
            count_participant_id: 1,
            first_dimension_date_created_date: '2023-04-11',
          },
          {
            'dimension_date_created.month': '2023-05',
            count_participant_id: 11,
            first_dimension_date_created_date: '2023-05-03',
          },
          {
            'dimension_date_created.month': '2023-06',
            count_participant_id: 1,
            first_dimension_date_created_date: '2023-06-01',
          },
          {
            'dimension_date_created.month': '2023-08',
            count_participant_id: 5,
            first_dimension_date_created_date: '2023-08-29',
          },
          {
            'dimension_date_created.month': '2023-09',
            count_participant_id: 1,
            first_dimension_date_created_date: '2023-09-27',
          },
          {
            'dimension_date_created.month': '2023-10',
            count_participant_id: 10,
            first_dimension_date_created_date: '2023-10-18',
          },
        ],
        [
          {
            count_participant_id: 501,
          },
        ],
      ],
    },
  },
};

const visitors = {
  params:
    '?query%5B%5D%5Bfact%5D=visit&query%5B%5D%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=citizen&query%5B%5D%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=&query%5B%5D%5Bfilters%5D%5Bdimension_projects.id%5D=8f1dffb8-0fb6-4f00-af70-55c757f78f14&query%5B%5D%5Bfilters%5D%5Bdimension_date_first_action.date%5D%5Bto%5D=2023-11-03&query%5B%5D%5Baggregations%5D%5Ball%5D=count&query%5B%5D%5Baggregations%5D%5Bvisitor_id%5D=count&query%5B%5D%5Baggregations%5D%5Bduration%5D=avg&query%5B%5D%5Baggregations%5D%5Bpages_visited%5D=avg&query%5B%5D%5Bfact%5D=visit&query%5B%5D%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=citizen&query%5B%5D%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=&query%5B%5D%5Bfilters%5D%5Bdimension_projects.id%5D=8f1dffb8-0fb6-4f00-af70-55c757f78f14&query%5B%5D%5Bfilters%5D%5Bdimension_date_first_action.date%5D%5Bto%5D=2023-11-03&query%5B%5D%5Bgroups%5D=dimension_date_first_action.month&query%5B%5D%5Baggregations%5D%5Ball%5D=count&query%5B%5D%5Baggregations%5D%5Bvisitor_id%5D=count&query%5B%5D%5Baggregations%5D%5Bdimension_date_first_action.date%5D=first',
  response: {
    data: {
      type: 'analytics',
      attributes: [
        [
          {
            count: 511,
            count_visitor_id: 110,
            avg_duration: '237.3424657534246575',
            avg_pages_visited: '4.0078277886497065',
          },
        ],
        [
          {
            'dimension_date_first_action.month': '2023-01',
            count: 23,
            count_visitor_id: 12,
            first_dimension_date_first_action_date: '2023-01-02',
          },
          {
            'dimension_date_first_action.month': '2023-02',
            count: 38,
            count_visitor_id: 17,
            first_dimension_date_first_action_date: '2023-02-15',
          },
          {
            'dimension_date_first_action.month': '2023-03',
            count: 32,
            count_visitor_id: 13,
            first_dimension_date_first_action_date: '2023-03-22',
          },
          {
            'dimension_date_first_action.month': '2023-04',
            count: 13,
            count_visitor_id: 8,
            first_dimension_date_first_action_date: '2023-04-10',
          },
          {
            'dimension_date_first_action.month': '2023-05',
            count: 50,
            count_visitor_id: 19,
            first_dimension_date_first_action_date: '2023-05-29',
          },
          {
            'dimension_date_first_action.month': '2023-06',
            count: 46,
            count_visitor_id: 14,
            first_dimension_date_first_action_date: '2023-06-28',
          },
          {
            'dimension_date_first_action.month': '2023-07',
            count: 34,
            count_visitor_id: 11,
            first_dimension_date_first_action_date: '2023-07-04',
          },
          {
            'dimension_date_first_action.month': '2023-08',
            count: 54,
            count_visitor_id: 12,
            first_dimension_date_first_action_date: '2023-08-11',
          },
          {
            'dimension_date_first_action.month': '2023-09',
            count: 34,
            count_visitor_id: 10,
            first_dimension_date_first_action_date: '2023-09-29',
          },
          {
            'dimension_date_first_action.month': '2023-10',
            count: 34,
            count_visitor_id: 12,
            first_dimension_date_first_action_date: '2023-10-24',
          },
        ],
      ],
    },
  },
};

const responses = {
  [visitorReferrers.params]: visitorReferrers.response,
  [postsOverTime.params]: postsOverTime.response,
  [commentsOverTime.params]: commentsOverTime.response,
  [reactionsOverTime.params]: reactionsOverTime.response,
  [participantsOverTime.params]: participantsOverTime.response,
  [visitors.params]: visitors.response,
};

export default responses;
