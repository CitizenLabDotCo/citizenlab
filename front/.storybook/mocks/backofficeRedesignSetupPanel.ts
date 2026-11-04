// Storybook-only data for the stories of the redesigned project setup
// panel (backofficeRedesign/ProjectSetupPanel): the platform's topic tags,
// a project's files, and the empty states of a brand new project.
import { http, HttpResponse } from 'msw';

import { IFileData } from '../../app/api/files/types';
import { IGlobalTopicData } from '../../app/api/global_topics/types';
import { project1 } from '../../app/api/projects/__mocks__/_mockServer';
import { IProjectData } from '../../app/api/projects/types';
import { usersData } from '../../app/api/users/__mocks__/_mockServer';

const API = '/web_api/v1';

const links = (path: string) => ({
  self: `${API}${path}?page%5Bnumber%5D=1`,
  first: `${API}${path}?page%5Bnumber%5D=1`,
  prev: null,
  next: null,
  last: `${API}${path}?page%5Bnumber%5D=1`,
});

export const mockTopics: IGlobalTopicData[] = [
  ['bo-topic-1', 'Nature and animals', 'tree'],
  ['bo-topic-2', 'Mobility', 'bus'],
  ['bo-topic-3', 'Urban planning', 'building'],
  ['bo-topic-4', 'Culture', 'theatre'],
  ['bo-topic-5', 'Safety', 'shield'],
  ['bo-topic-6', 'Sports', 'ball'],
].map(([id, title, icon], ordering) => ({
  id,
  type: 'global_topic',
  attributes: {
    title_multiloc: { en: title },
    description_multiloc: {},
    icon,
    ordering,
    followers_count: 0,
    include_in_onboarding: false,
  },
  relationships: {
    static_pages: { data: [] },
    user_follower: { data: null },
  },
}));

export const topicsHandler = http.get(`${API}/global_topics`, () =>
  HttpResponse.json({ data: mockTopics })
);

const file = (id: string, name: string): IFileData => ({
  id,
  type: 'file',
  attributes: {
    title: name,
    name,
    mime_type: 'application/pdf',
    size: 240000,
    category: 'other',
    description_multiloc: {},
    ai_processing_allowed: false,
    created_at: '2026-09-01T09:00:00.000Z',
    updated_at: '2026-09-01T09:00:00.000Z',
    deleted_at: null,
    content: { url: `/${name}` },
  },
  relationships: {},
});

export const filesHandler = http.get(`${API}/files`, () =>
  HttpResponse.json({
    data: [
      file('bo-file-1', 'tree-route-map.pdf'),
      file('bo-file-2', 'planting-budget.pdf'),
    ],
    links: links('/files'),
  })
);

export const noFilesHandler = http.get(`${API}/files`, () =>
  HttpResponse.json({ data: [], links: links('/files') })
);

// The people search in the management section (who can be added).
export const usersHandler = http.get(`${API}/users`, () =>
  HttpResponse.json({ data: usersData, links: links('/users') })
);

// A project nobody has started on: no phases, project page not built.
export const noPhasesHandler = http.get(
  `${API}/projects/:projectId/phases`,
  () => HttpResponse.json({ data: [], links: links('/phases') })
);

export const pageLayoutDisabledHandler = http.get(
  `${API}/projects/:projectId/content_builder_layouts/project_page`,
  () =>
    HttpResponse.json({
      data: {
        id: 'bo-layout-1',
        type: 'content_builder_layout',
        attributes: {
          enabled: false,
          code: 'project_page',
          craftjs_json: {},
          created_at: '2026-09-01T09:00:00.000Z',
          updated_at: '2026-09-01T09:00:00.000Z',
        },
      },
    })
);

export const projectWith = (
  attributes: Partial<IProjectData['attributes']>,
  relationships: Partial<IProjectData['relationships']> = {}
): IProjectData => ({
  ...project1,
  attributes: { ...project1.attributes, ...attributes },
  relationships: { ...project1.relationships, ...relationships },
});

export const draftProject = projectWith({
  publication_status: 'draft',
  first_published_at: null,
  participants_count: 0,
  completed_setup_steps: ['settings'],
});
