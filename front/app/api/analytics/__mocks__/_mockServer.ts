import { rest } from 'msw';
import { API_PATH } from 'containers/App/constants';

const apiPath = `${API_PATH}/analytics`;

const participantsGraphParams =
  '?query%5B%5D%5Bfact%5D=participation&query%5B%5D%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=citizen&query%5B%5D%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=&query%5B%5D%5Bfilters%5D%5Bdimension_project.id%5D=f229c7e1-cf50-45fe-a231-dd52cd1e7037&query%5B%5D%5Bgroups%5D=dimension_date_created.month&query%5B%5D%5Baggregations%5D%5Bdimension_user_id%5D=count&query%5B%5D%5Baggregations%5D%5Bdimension_date_created.date%5D=first&query%5B%5D%5Bfact%5D=participation&query%5B%5D%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=citizen&query%5B%5D%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=&query%5B%5D%5Bfilters%5D%5Bdimension_project.id%5D=f229c7e1-cf50-45fe-a231-dd52cd1e7037&query%5B%5D%5Baggregations%5D%5Bdimension_user_id%5D=count&query%5B%5D%5Bfact%5D=participation&query%5B%5D%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=citizen&query%5B%5D%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=&query%5B%5D%5Bfilters%5D%5Bdimension_project.id%5D=f229c7e1-cf50-45fe-a231-dd52cd1e7037&query%5B%5D%5Bfilters%5D%5Bdimension_date_created.date%5D%5Bfrom%5D=2023-10-01&query%5B%5D%5Bfilters%5D%5Bdimension_date_created.date%5D%5Bto%5D=2023-10-31&query%5B%5D%5Baggregations%5D%5Bdimension_user_id%5D=count&query%5B%5D%5Bfact%5D=visit&query%5B%5D%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=citizen&query%5B%5D%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=&query%5B%5D%5Bfilters%5D%5Bdimension_projects.id%5D=f229c7e1-cf50-45fe-a231-dd52cd1e7037&query%5B%5D%5Baggregations%5D%5Bvisitor_id%5D=count&query%5B%5D%5Bfact%5D=visit&query%5B%5D%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=citizen&query%5B%5D%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=&query%5B%5D%5Bfilters%5D%5Bdimension_projects.id%5D=f229c7e1-cf50-45fe-a231-dd52cd1e7037&query%5B%5D%5Bfilters%5D%5Bdimension_date_first_action.date%5D%5Bfrom%5D=2023-10-01&query%5B%5D%5Bfilters%5D%5Bdimension_date_first_action.date%5D%5Bto%5D=2023-10-31&query%5B%5D%5Baggregations%5D%5Bvisitor_id%5D=count';
const participantsGraphData = {
  type: 'analytics',
  attributes: [
    [
      {
        first_dimension_date_created_date: '2023-08-10',
        'dimension_date_created.month': '2023-08',
        count_dimension_user_id: 10,
      },
      {
        first_dimension_date_created_date: '2023-09-10',
        'dimension_date_created.month': '2023-08',
        count_dimension_user_id: 15,
      },
      {
        first_dimension_date_created_date: '2023-10-10',
        'dimension_date_created.month': '2023-08',
        count_dimension_user_id: 14,
      },
    ],
    [{ count_dimension_user_id: 39 }],
    [{ count_dimension_user_id: 14 }],
    [{ count_visitor_id: 4 }],
    [],
  ],
};

const visitorsTimelineParams =
  '?query%5B%5D%5Bfact%5D=visit&query%5B%5D%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=citizen&query%5B%5D%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=&query%5B%5D%5Bfilters%5D%5Bdimension_projects.id%5D=f229c7e1-cf50-45fe-a231-dd52cd1e7037&query%5B%5D%5Baggregations%5D%5Ball%5D=count&query%5B%5D%5Baggregations%5D%5Bvisitor_id%5D=count&query%5B%5D%5Baggregations%5D%5Bduration%5D=avg&query%5B%5D%5Baggregations%5D%5Bpages_visited%5D=avg&query%5B%5D%5Bfact%5D=visit&query%5B%5D%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=citizen&query%5B%5D%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=&query%5B%5D%5Bfilters%5D%5Bdimension_projects.id%5D=f229c7e1-cf50-45fe-a231-dd52cd1e7037&query%5B%5D%5Bfilters%5D%5Bdimension_date_first_action.date%5D%5Bfrom%5D=2023-10-01&query%5B%5D%5Bfilters%5D%5Bdimension_date_first_action.date%5D%5Bto%5D=2023-10-31&query%5B%5D%5Baggregations%5D%5Ball%5D=count&query%5B%5D%5Baggregations%5D%5Bvisitor_id%5D=count&query%5B%5D%5Baggregations%5D%5Bduration%5D=avg&query%5B%5D%5Baggregations%5D%5Bpages_visited%5D=avg&query%5B%5D%5Bfact%5D=visit&query%5B%5D%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=citizen&query%5B%5D%5Bfilters%5D%5Bdimension_user.role%5D%5B%5D=&query%5B%5D%5Bfilters%5D%5Bdimension_projects.id%5D=f229c7e1-cf50-45fe-a231-dd52cd1e7037&query%5B%5D%5Bgroups%5D=dimension_date_first_action.month&query%5B%5D%5Baggregations%5D%5Ball%5D=count&query%5B%5D%5Baggregations%5D%5Bvisitor_id%5D=count&query%5B%5D%5Baggregations%5D%5Bdimension_date_first_action.date%5D=first';
const visitorsTimelineData = {
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
        count: 34,
        count_visitor_id: 12,
        avg_duration: '125.5294117647058824',
        avg_pages_visited: '3.6176470588235294',
      },
    ],
    [
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
};

const responses = {
  [participantsGraphParams]: participantsGraphData,
  [visitorsTimelineParams]: visitorsTimelineData,
};

const endpoints = {
  'GET analytics': rest.get(apiPath, (req, res, ctx) => {
    const params = new URL(req.url.toString()).search;
    const response = responses[params];

    if (!response) {
      return res(ctx.status(404));
    }

    return res(ctx.status(200), ctx.json({ data: response }));
  }),
};

export default endpoints;
