// Storybook-only data for the stories of the redesigned project back
// office (app/containers/Admin/projects/project/backofficeRedesign). The
// default handlers in ../mockServer.ts cover projects, phases, ideas and the
// app configuration; these add the endpoints the redesigned pieces read on
// top of them. A story passes `backofficeRedesignHandlers` (or a selection)
// as `parameters.msw`: MSW tries them before the defaults.
import React from 'react';

import { Decorator } from '@storybook/react';
import { http, HttpResponse } from 'msw';
// The raw IntlShape, as the LanguageProvider keeps it per locale.
// eslint-disable-next-line no-restricted-imports
import { useIntl } from 'react-intl';
import { waitFor } from 'storybook/test';

import { IAreaData } from '../../app/api/areas/types';
import { IEventData } from '../../app/api/events/types';
import { ideaData } from '../../app/api/ideas/__mocks__/_mockServer';
import { IIdeaData } from '../../app/api/ideas/types';
import {
  mockPhaseIdeationData,
  mockPhaseInformationData,
} from '../../app/api/phases/__mocks__/_mockServer';
import { IPhaseData } from '../../app/api/phases/types';
import { project1 } from '../../app/api/projects/__mocks__/_mockServer';
import { usersData } from '../../app/api/users/__mocks__/_mockServer';
import CustomIntlContext from '../../app/containers/LanguageProvider/CustomIntlContext';

const API = '/web_api/v1';

const iso = (daysFromNow: number, hour: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

const day = (daysFromNow: number) => iso(daysFromNow, 12).slice(0, 10);

const phaseOf = (
  base: IPhaseData,
  id: string,
  title: string,
  startDay: number,
  endDay: number,
  ideasCount: number
): IPhaseData => ({
  ...base,
  id,
  attributes: {
    ...base.attributes,
    title_multiloc: { en: title },
    start_at: day(startDay),
    end_at: day(endDay),
    ideas_count: ideasCount,
  },
  relationships: {
    ...base.relationships,
    project: { data: { id: project1.id, type: 'project' } },
  },
});

// A past information phase, a current ideation phase and a future vote.
export const infoPhase = phaseOf(
  mockPhaseInformationData,
  'bo-phase-info',
  'Share the plan',
  -60,
  -31,
  0
);
export const ideationPhase = phaseOf(
  mockPhaseIdeationData,
  'bo-phase-ideation',
  'Collect ideas',
  -30,
  20,
  5
);
const votingBase: IPhaseData = {
  ...mockPhaseIdeationData,
  attributes: {
    ...mockPhaseIdeationData.attributes,
    participation_method: 'voting',
    voting_method: 'single_voting',
    voting_max_total: 1,
    voting_min_total: 0,
    voting_max_votes_per_idea: 1,
    vote_term: 'vote',
  },
};
export const votingPhase = phaseOf(
  votingBase,
  'bo-phase-voting',
  'Choose the places',
  21,
  50,
  0
);
export const mockPhases = [infoPhase, ideationPhase, votingPhase];

export const mockEvents: IEventData[] = [
  {
    id: 'bo-event-1',
    type: 'event',
    attributes: {
      title_multiloc: { en: 'Walk along the tree route' },
      description_multiloc: {
        en: '<p>Meet the team at the park gate and walk the route where the new trees could go.</p>',
      },
      location_multiloc: { en: 'Park gate, Koekenbakstraat' },
      address_2_multiloc: {},
      address_1: 'Koekenbakstraat 1, Antwerp',
      location_point_geojson: {
        type: 'Point',
        coordinates: [4.40346, 51.21989],
      },
      start_at: iso(12, 10),
      end_at: iso(12, 12),
      created_at: iso(-20, 9),
      updated_at: iso(-20, 9),
      attendees_count: 14,
      maximum_attendees: 30,
    },
    relationships: {
      project: { data: { id: project1.id, type: 'project' } },
      event_images: { data: [] },
      user_attendance: { data: { id: '', type: 'event_attendance' } },
    },
  },
  {
    id: 'bo-event-2',
    type: 'event',
    attributes: {
      title_multiloc: { en: 'Neighbourhood workshop' },
      description_multiloc: {
        en: '<p>An evening to sort the proposals and pick the places to plant.</p>',
      },
      location_multiloc: { en: 'Community centre' },
      address_2_multiloc: {},
      address_1: 'Lange Leemstraat 20, Antwerp',
      location_point_geojson: { type: 'Point', coordinates: [4.4106, 51.2075] },
      start_at: iso(-30, 18),
      end_at: iso(-30, 21),
      created_at: iso(-60, 9),
      updated_at: iso(-60, 9),
      attendees_count: 22,
      maximum_attendees: null,
    },
    relationships: {
      project: { data: { id: project1.id, type: 'project' } },
      event_images: { data: [] },
      user_attendance: { data: { id: '', type: 'event_attendance' } },
    },
  },
];

// The two default ideas, with valid dates and titles that fit the project.
export const mockIdeas: IIdeaData[] = [
  ['Plant oaks along the canal', -12],
  ['More shade on the school square', -4],
].map(([title, daysAgo], i) => ({
  ...ideaData[i],
  attributes: {
    ...ideaData[i].attributes,
    title_multiloc: { en: title as string },
    created_at: iso(daysAgo as number, 9),
    updated_at: iso(daysAgo as number, 9),
    published_at: iso(daysAgo as number, 9),
  },
  relationships: {
    ...ideaData[i].relationships,
    project: { data: { id: project1.id, type: 'project' } },
  },
}));

const mockAreas: IAreaData[] = [
  ['bo-area-1', 'North district'],
  ['bo-area-2', 'City centre'],
  ['bo-area-3', 'Harbour'],
].map(([id, title], ordering) => ({
  id,
  type: 'area',
  attributes: {
    title_multiloc: { en: title },
    description_multiloc: {},
    ordering,
    followers_count: 0,
    include_in_onboarding: false,
  },
  relationships: {},
}));

// Eight weeks of participants, for the project setup panel's graph.
const participantsTimeseries = Array.from({ length: 8 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - 7 * (7 - i));
  return {
    date_group: d.toISOString().slice(0, 10),
    participants: [1, 2, 2, 4, 3, 6, 5, 8][i],
  };
});

const links = (path: string) => ({
  self: `${API}${path}?page%5Bnumber%5D=1`,
  first: `${API}${path}?page%5Bnumber%5D=1`,
  prev: null,
  next: null,
  last: `${API}${path}?page%5Bnumber%5D=1`,
});

export const eventsHandler = http.get(`${API}/events`, () =>
  HttpResponse.json({ data: mockEvents, links: links('/events') })
);

export const noEventsHandler = http.get(`${API}/events`, () =>
  HttpResponse.json({ data: [], links: links('/events') })
);

// Counts for the input manager's filters and stat tiles: the two default
// ideas, one of them still waiting for a reply.
const filterCountsHandler = http.get(
  `${API}/ideas/filter_counts`,
  ({ request }) => {
    const params = new URL(request.url).searchParams;
    const total = params.has('imported')
      ? 0
      : params.has('feedback_needed') || params.has('official_feedback')
      ? 1
      : 2;
    return HttpResponse.json({
      data: {
        type: 'filter_counts',
        attributes: {
          idea_status_id: total === 2 ? { 1: 1, 2: 1 } : { 1: total },
          area_id: {},
          input_topic_id: {},
          assignee_id: {},
          total,
        },
      },
    });
  }
);

const empty = (path: string) =>
  http.get(`${API}${path}`, () =>
    HttpResponse.json({ data: [], links: links(path) })
  );

const handlers = {
  filterCounts: filterCountsHandler,
  ideas: http.get(`${API}/ideas`, () =>
    HttpResponse.json({ data: mockIdeas, links: links('/ideas') })
  ),
  idea: http.get(`${API}/ideas/:id`, ({ params }) =>
    HttpResponse.json({
      data: mockIdeas.find((idea) => idea.id === params.id) ?? mockIdeas[0],
    })
  ),
  ideaFiles: empty('/ideas/:id/files'),
  officialFeedback: empty('/ideas/:id/official_feedback'),
  analyses: empty('/analyses'),
  inputTopics: empty('/projects/:projectId/input_topics'),
  // The people an input can be assigned to.
  moderatorUsers: http.get(`${API}/users`, ({ request }) => {
    if (!new URL(request.url).searchParams.has('can_moderate_project')) {
      return undefined;
    }
    return HttpResponse.json({
      data: usersData.slice(0, 2),
      links: links('/users'),
    });
  }),
  // No verification method enabled: the API answers 204.
  verificationMethod: http.get(
    `${API}/id_methods/first_enabled_verification_method`,
    () => new HttpResponse(null, { status: 204 })
  ),
  phasePermissions: http.get(`${API}/phases/:id/permissions`, () =>
    HttpResponse.json({ data: [] })
  ),
  // No extra registration questions on an action.
  permissionCustomFields: http.get(
    `${API}/phases/:id/permissions/:action/permissions_custom_fields`,
    () => HttpResponse.json({ data: [] })
  ),
  phases: http.get(`${API}/projects/:projectId/phases`, () =>
    HttpResponse.json({ data: mockPhases })
  ),
  phase: http.get(`${API}/phases/:id`, ({ params }) =>
    HttpResponse.json({
      data: mockPhases.find((p) => p.id === params.id) ?? ideationPhase,
    })
  ),
  events: eventsHandler,
  event: http.get(`${API}/events/:id`, ({ params }) =>
    HttpResponse.json({
      data: mockEvents.find((e) => e.id === params.id) ?? mockEvents[0],
    })
  ),
  areas: http.get(`${API}/areas`, () =>
    HttpResponse.json({ data: mockAreas, links: links('/areas') })
  ),
  fileAttachments: http.get(`${API}/file_attachments`, () =>
    HttpResponse.json({ data: [] })
  ),
  moderators: http.get(`${API}/projects/:projectId/moderators`, () =>
    HttpResponse.json({ data: usersData.slice(0, 2) })
  ),
  recipientCount: http.get(
    `${API}/projects/:projectId/publication_recipient_count`,
    () =>
      HttpResponse.json({
        data: {
          type: 'publication_recipient_count',
          attributes: { count: 128 },
        },
      })
  ),
  projectPageLayout: http.get(
    `${API}/projects/:projectId/content_builder_layouts/project_page`,
    () =>
      HttpResponse.json({
        data: {
          id: 'bo-layout-1',
          type: 'content_builder_layout',
          attributes: {
            enabled: true,
            code: 'project_page',
            craftjs_json: {},
            created_at: iso(-30, 9),
            updated_at: iso(-30, 9),
          },
        },
      })
  ),
  // Only the participants widget; other widgets fall through to the
  // default handler.
  participants: http.get(
    `${API}/reports/graph_data_units/live`,
    ({ request }) => {
      const url = new URL(request.url);
      if (url.searchParams.get('resolved_name') !== 'ParticipantsWidget') {
        return undefined;
      }
      return HttpResponse.json({
        data: {
          type: 'report_builder_data_units',
          attributes: {
            participants_timeseries: participantsTimeseries,
            participants_whole_period: 31,
            participation_rate_whole_period: 0.12,
            participants_compared_period: 8,
            participation_rate_compared_period: 0.1,
          },
        },
      });
    }
  ),
};

export const backofficeRedesignHandlers = Object.values(handlers);

export default handlers;

// The play step of a story whose content loads through MSW: waits until
// the canvas shows `text`.
export const waitForText = (canvasElement: HTMLElement, text: string) =>
  waitFor(
    () => {
      if (!canvasElement.textContent.includes(text)) {
        throw new Error(`"${text}" not rendered yet`);
      }
    },
    {
      timeout: 10000,
      onTimeout: () => new Error(`"${text}" did not render within 10s`),
    }
  );

// Pieces that format messages in every tenant locale (the defaults of a new
// phase, for one) read them from the LanguageProvider's context, which the
// preview does not mount. This gives them the story's own messages for every
// locale.
const AllLocales = ({ children }: { children: React.ReactNode }) => {
  const intl = useIntl();
  const value = React.useMemo(
    () => ({
      intlShapes: new Proxy({}, { get: () => intl }) as any,
      loadLocales: () => Promise.resolve(),
    }),
    [intl]
  );
  return React.createElement(CustomIntlContext.Provider, { value }, children);
};

export const withAllLocales: Decorator = (Story) =>
  React.createElement(AllLocales, null, React.createElement(Story));

// The same, for content with no fixed text to wait for (a translated
// story, say): waits until the canvas holds an element matching `selector`.
export const waitForElement = (canvasElement: HTMLElement, selector: string) =>
  waitFor(
    () => {
      if (!canvasElement.querySelector(selector)) {
        throw new Error(`no ${selector} rendered yet`);
      }
    },
    {
      timeout: 10000,
      onTimeout: () => new Error(`no ${selector} rendered within 10s`),
    }
  );

// The phase preview shows the front-office project page in a phone frame,
// from a URL that Storybook does not serve. Its frame gets a placeholder
// instead of the server's "Not Found".
const PREVIEW_PLACEHOLDER = `<!doctype html><html><body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;font:14px/1.5 system-ui,sans-serif;color:#596b7a;text-align:center;padding:0 24px;box-sizing:border-box"><div><strong style="display:block;color:#263e4f;margin-bottom:4px">Project page preview</strong>The project page as participants see it shows here in the platform.</div></body></html>`;

const FRONT_OFFICE_PATH = /^\/[a-z]{2}(-[A-Z]{2})?\/projects\//;

const PreviewPlaceholder = ({ children }: { children: React.ReactNode }) => {
  // Patched during render, so it is in place before the frame is added to
  // the page: the frame then never requests the missing page.
  const [restore] = React.useState(() => {
    const setAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (name: string, value: string) {
      if (
        this instanceof HTMLIFrameElement &&
        name === 'src' &&
        FRONT_OFFICE_PATH.test(value)
      ) {
        this.srcdoc = PREVIEW_PLACEHOLDER;
        return;
      }
      setAttribute.call(this, name, value);
    };
    return () => {
      Element.prototype.setAttribute = setAttribute;
    };
  });
  React.useEffect(() => restore, [restore]);
  return React.createElement(React.Fragment, null, children);
};

export const withPreviewPlaceholder: Decorator = (Story) =>
  React.createElement(PreviewPlaceholder, null, React.createElement(Story));

// A page-sized layout in a box narrower than a desktop screen (a gallery
// card, a phone viewport) would squeeze until nothing reads. It is laid out
// at desktop width instead and zoomed down to the box, so a card shows the
// page as it is; at a desktop width it renders as is.
const DESKTOP = 1200;

const DesktopWidth = ({ children }: { children: React.ReactNode }) => {
  const box = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(DESKTOP);
  React.useLayoutEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(() => setWidth(el.clientWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const fit = width > 0 && width < DESKTOP;
  return React.createElement(
    'div',
    // The full box even inside a centring flex parent, which would
    // otherwise shrink it to the content.
    { ref: box, style: { width: '100%', minWidth: 0 } },
    React.createElement(
      'div',
      { style: fit ? { width: DESKTOP, zoom: width / DESKTOP } : undefined },
      children
    )
  );
};

export const withDesktopWidth: Decorator = (Story) =>
  React.createElement(DesktopWidth, null, React.createElement(Story));
