// Storybook-only data for the stories of the input manager pieces
// (app/containers/Admin/projects/project/backofficeRedesign/InputManager),
// on top of ./backofficeRedesign: tags for the project, an input that has a
// status, tags, an assignee and a phase, and filter categories as the
// manager builds them.
import { http, HttpResponse } from 'msw';

import { ideaStatusesData } from '../../app/api/idea_statuses/__mocks__/_mockServer';
import { IIdeaData } from '../../app/api/ideas/types';
import { IInputTopicData } from '../../app/api/input_topics/types';
import { project1 } from '../../app/api/projects/__mocks__/_mockServer';
import { usersData } from '../../app/api/users/__mocks__/_mockServer';
import { FilterCategory } from '../../app/containers/Admin/projects/project/backofficeRedesign/InputManager/FilterMenu/useFilterCategories';
import { PhaseCounts } from '../../app/containers/Admin/projects/project/backofficeRedesign/InputManager/usePhaseCounts';

import {
  backofficeRedesignHandlers,
  ideationPhase,
  infoPhase,
  mockIdeas,
  votingPhase,
} from './backofficeRedesign';

const API = '/web_api/v1';

export const mockTopics: IInputTopicData[] = [
  ['bo-topic-1', 'Trees'],
  ['bo-topic-2', 'Shade'],
  ['bo-topic-3', 'Schools'],
  ['bo-topic-4', 'Mobility'],
].map(([id, title], i) => ({
  id,
  type: 'input_topic',
  attributes: {
    title_multiloc: { en: title },
    description_multiloc: {},
    full_title_multiloc: { en: title },
    icon: null,
    parent_icon: null,
    depth: 0,
    lft: i * 2 + 1,
    rgt: i * 2 + 2,
    children_count: 0,
  },
  relationships: {
    project: { data: { id: project1.id, type: 'project' } },
  },
}));

export const tagLabels = new Map(
  mockTopics.map((topic) => [topic.id, topic.attributes.title_multiloc.en!])
);

const withRelationships = (
  idea: IIdeaData,
  statusId: string,
  topicIds: string[],
  assigneeId: string | null
): IIdeaData => ({
  ...idea,
  relationships: {
    ...idea.relationships,
    idea_status: { data: { id: statusId, type: 'idea_status' } },
    input_topics: {
      data: topicIds.map((id) => ({ id, type: 'input_topic' })),
    },
    assignee: { data: assigneeId ? { id: assigneeId, type: 'user' } : null },
    phases: { data: [{ id: ideationPhase.id, type: 'phase' }] },
    ideas_phases: { data: [] },
  },
});

// The two default inputs, with a status the statuses mock knows, tags and
// (for the first) an assignee.
export const managedIdeas: IIdeaData[] = [
  withRelationships(
    mockIdeas[0],
    ideaStatusesData[0].id,
    ['bo-topic-1', 'bo-topic-2'],
    usersData[0].id
  ),
  withRelationships(mockIdeas[1], ideaStatusesData[1].id, ['bo-topic-2'], null),
];

export const managedIdea = managedIdeas[0];

export const mockCounts: PhaseCounts = {
  total: 12,
  byStatus: { [ideaStatusesData[0].id]: 8, [ideaStatusesData[1].id]: 4 },
  byTopic: {},
  byAssignee: undefined,
  awaiting: 5,
  replied: 7,
  imported: 2,
  online: 10,
};

export const inputManagerHandlers = [
  http.get(`${API}/projects/:projectId/input_topics`, () =>
    HttpResponse.json({ data: mockTopics })
  ),
  http.get(`${API}/ideas/:id`, ({ params }) => {
    const idea = managedIdeas.find((item) => item.id === params.id);
    return idea ? HttpResponse.json({ data: idea }) : undefined;
  }),
  ...backofficeRedesignHandlers,
];

const noop = () => {};

// The filter categories of an ideation phase, as useFilterCategories
// builds them. `active` turns on a status and a tag filter.
export const mockFilterCategories = (active = false): FilterCategory[] => [
  {
    key: 'phase',
    label: 'Phase',
    icon: 'timeline',
    options: [
      { value: 'all', label: 'All phases' },
      ...[infoPhase, ideationPhase, votingPhase].map((phase) => ({
        value: phase.id,
        label: phase.attributes.title_multiloc.en!,
      })),
    ],
    selected: [ideationPhase.id],
    multiple: false,
    isActive: false,
    toggle: noop,
    clear: noop,
  },
  {
    key: 'source',
    label: 'Source',
    icon: 'download',
    options: [
      { value: 'online', label: 'Online', count: 10 },
      { value: 'imported', label: 'Imported', count: 2 },
    ],
    selected: [],
    multiple: false,
    isActive: false,
    toggle: noop,
    clear: noop,
  },
  {
    key: 'status',
    label: 'Status',
    icon: 'check-circle',
    options: ideaStatusesData.map((status) => ({
      value: status.id,
      label: status.attributes.title_multiloc.en!,
      color: status.attributes.color,
      count: mockCounts.byStatus[status.id] ?? 0,
    })),
    selected: active ? [ideaStatusesData[0].id] : [],
    multiple: true,
    isActive: active,
    toggle: noop,
    clear: noop,
  },
  {
    key: 'assignee',
    label: 'Assignee',
    icon: 'user',
    options: [
      { value: 'unassigned', label: 'Unassigned' },
      ...usersData.slice(0, 2).map((user) => ({
        value: user.id,
        label: `${user.attributes.first_name} ${user.attributes.last_name}`,
      })),
    ],
    selected: [],
    multiple: true,
    isActive: false,
    toggle: noop,
    clear: noop,
  },
  {
    key: 'tags',
    label: 'Tags',
    icon: 'label',
    options: mockTopics.map((topic, i) => ({
      value: topic.id,
      label: topic.attributes.title_multiloc.en!,
      count: [6, 4, 1, 0][i],
    })),
    selected: active ? ['bo-topic-1', 'bo-topic-2'] : [],
    multiple: true,
    searchable: true,
    isActive: active,
    toggle: noop,
    clear: noop,
  },
  {
    key: 'reply',
    label: 'Reply',
    icon: 'chat-bubble',
    options: [
      { value: 'awaiting', label: 'Awaiting reply', count: 5 },
      { value: 'replied', label: 'Replied', count: 7 },
    ],
    selected: [],
    multiple: false,
    isActive: false,
    toggle: noop,
    clear: noop,
  },
];
