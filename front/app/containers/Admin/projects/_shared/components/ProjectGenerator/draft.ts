import { Multiloc } from 'typings';

import { UpdatePhaseArguments } from 'api/ai_assistant_tool_calls/tools/updatePhase';
import { UpdateProjectArguments } from 'api/ai_assistant_tool_calls/tools/updateProject';
import {
  AiAssistantToolCall,
  IAiAssistantToolCallData,
} from 'api/ai_assistant_tool_calls/types';
import { isToolCall } from 'api/ai_assistant_tool_calls/utils';
import { IEventData } from 'api/events/types';
import {
  IPhaseData,
  IUpdatedPhaseProperties,
  ParticipationMethod,
} from 'api/phases/types';
import { IProjectData, Visibility } from 'api/projects/types';

// The saved project, phases and events, with the proposed changes applied on top.

type ToolCall = IAiAssistantToolCallData;

export type ProposedChange = {
  toolCall: ToolCall;
  kind: 'create' | 'update' | 'remove';
};

export type PermissionChange = {
  toolCall: AiAssistantToolCall<'update_phase_permission'>;
  kind: 'update';
};

// What a proposal sets, next to the saved values of what it updates.
export type ProposedValues = {
  proposed: object;
  saved?: object;
};

export type DraftProject = {
  title: Multiloc;
  descriptionPreview: Multiloc;
  areaIds: string[];
  includeAllAreas: boolean;
  topicIds: string[];
  visibleTo: Visibility;
  // Only known when proposed: saved visibility groups are fetched separately.
  proposedGroupIds?: string[];
  listed: boolean;
  headerImageUrl: string | null;
  values: ProposedValues;
  changed: string[];
  change?: ProposedChange;
  // The saved project, when a proposed change updates it.
  previous?: DraftProject;
};

export type DraftPhase = {
  key: string;
  phaseId?: string;
  title: Multiloc;
  description: Multiloc;
  method: ParticipationMethod;
  startAt: string;
  endAt: string | null;
  settings: IUpdatedPhaseProperties;
  values: ProposedValues;
  changed: string[];
  change?: ProposedChange;
  permissionChange?: PermissionChange;
  // The saved phase, when a proposed change updates it.
  previous?: DraftPhase;
};

export type DraftEvent = {
  key: string;
  title: Multiloc;
  description: Multiloc;
  location: Multiloc;
  address: string | null;
  onlineLink: string | null;
  startAt: string;
  endAt: string;
  values: ProposedValues;
  changed: string[];
  change?: ProposedChange;
  // The saved event, when a proposed change updates it.
  previous?: DraftEvent;
};

// Questions also wait for the admin, but they are answered in the chat, not in the draft.
export const getProposedChanges = (toolCalls: ToolCall[]) =>
  toolCalls.filter(
    ({ attributes }) =>
      attributes.status === 'awaiting_user' && attributes.name !== 'ask_user'
  );

// Multilocs are updated per locale.
const mergeMultiloc = (current: Multiloc, proposed: Multiloc | undefined) =>
  proposed ? { ...current, ...proposed } : current;

// An explicit null clears the saved value.
const proposedOrSaved = <Value>(proposed: Value | undefined, saved: Value) =>
  proposed === undefined ? saved : proposed;

const byStartDate = (a: { startAt: string }, b: { startAt: string }) =>
  new Date(a.startAt).getTime() - new Date(b.startAt).getTime();

export const changeElementId = (toolCallId: string) =>
  `draft-change-${toolCallId}`;

export const scrollToChange = (toolCallId: string) =>
  document
    .getElementById(changeElementId(toolCallId))
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });

export const getDraftProject = (
  project: IProjectData,
  proposedChanges: ToolCall[]
): DraftProject => {
  const { attributes, relationships } = project;
  const toolCall = proposedChanges.find((proposedChange) =>
    isToolCall(proposedChange, 'update_project')
  );
  const args: UpdateProjectArguments = toolCall?.attributes.arguments ?? {};

  return {
    title: mergeMultiloc(attributes.title_multiloc, args.title_multiloc),
    descriptionPreview: mergeMultiloc(
      attributes.description_preview_multiloc,
      args.description_preview_multiloc
    ),
    areaIds: args.area_ids ?? relationships.areas.data.map(({ id }) => id),
    includeAllAreas: args.include_all_areas ?? attributes.include_all_areas,
    topicIds:
      args.global_topic_ids ??
      relationships.global_topics.data.map(({ id }) => id),
    visibleTo: args.visible_to ?? attributes.visible_to,
    proposedGroupIds: args.group_ids,
    listed: args.listed ?? attributes.listed,
    headerImageUrl: attributes.header_bg.large,
    values: { proposed: args, saved: attributes },
    changed: Object.keys(args),
    change: toolCall && { toolCall, kind: 'update' },
    previous: toolCall && getDraftProject(project, []),
  };
};

const removalOf = (
  proposedChanges: ToolCall[],
  resourceType: 'phase' | 'event',
  id: string
) =>
  proposedChanges
    .filter((toolCall) => isToolCall(toolCall, 'destroy_resource'))
    .find(
      ({ attributes: { arguments: args } }) =>
        args.resource_type === resourceType && args.id === id
    );

// A row offers one decision at a time, and a removal comes last: approving it removes the row.
const firstDecision = (
  update: ToolCall | undefined,
  removal: ToolCall | undefined
): ProposedChange | undefined => {
  if (update) return { toolCall: update, kind: 'update' };
  return removal && { toolCall: removal, kind: 'remove' };
};

const proposedPhase = (
  toolCall: AiAssistantToolCall<'create_phase'>
): DraftPhase => {
  const args = toolCall.attributes.arguments;

  return {
    key: toolCall.id,
    title: args.title_multiloc,
    description: args.description_multiloc ?? {},
    method: args.participation_method ?? 'ideation',
    startAt: args.start_at,
    endAt: args.end_at ?? null,
    settings: args,
    values: { proposed: args },
    changed: Object.keys(args),
    change: { toolCall, kind: 'create' },
  };
};

const savedPhase = (
  phase: IPhaseData,
  proposedChanges: ToolCall[]
): DraftPhase => {
  const { attributes } = phase;
  const update = proposedChanges
    .filter((toolCall) => isToolCall(toolCall, 'update_phase'))
    .find((toolCall) => toolCall.attributes.arguments.phase_id === phase.id);
  const removal = removalOf(proposedChanges, 'phase', phase.id);
  const permissionUpdate = proposedChanges
    .filter((toolCall) => isToolCall(toolCall, 'update_phase_permission'))
    .find((toolCall) => toolCall.attributes.arguments.phase_id === phase.id);
  const args: Partial<UpdatePhaseArguments> =
    update?.attributes.arguments ?? {};

  return {
    key: phase.id,
    phaseId: phase.id,
    title: mergeMultiloc(attributes.title_multiloc, args.title_multiloc),
    description: mergeMultiloc(
      attributes.description_multiloc,
      args.description_multiloc
    ),
    method: args.participation_method ?? attributes.participation_method,
    startAt: args.start_at ?? attributes.start_at,
    endAt: proposedOrSaved(args.end_at, attributes.end_at),
    settings: { ...attributes, ...args },
    values: { proposed: args, saved: attributes },
    changed: Object.keys(args).filter((key) => key !== 'phase_id'),
    change: firstDecision(update, permissionUpdate ? undefined : removal),
    previous: update && savedPhase(phase, []),
    permissionChange: permissionUpdate && {
      toolCall: permissionUpdate,
      kind: 'update',
    },
  };
};

export const getDraftPhases = (
  phases: IPhaseData[],
  proposedChanges: ToolCall[]
): DraftPhase[] => {
  const created = proposedChanges
    .filter((toolCall) => isToolCall(toolCall, 'create_phase'))
    .map(proposedPhase);

  return [
    ...phases.map((phase) => savedPhase(phase, proposedChanges)),
    ...created,
  ].sort(byStartDate);
};

const proposedEvent = (
  toolCall: AiAssistantToolCall<'create_event'>
): DraftEvent => {
  const args = toolCall.attributes.arguments;

  return {
    key: toolCall.id,
    title: args.title_multiloc,
    description: args.description_multiloc ?? {},
    location: args.location_multiloc ?? {},
    address: args.address_1 ?? null,
    onlineLink: args.online_link ?? null,
    startAt: args.start_at,
    endAt: args.end_at,
    values: { proposed: args },
    changed: Object.keys(args),
    change: { toolCall, kind: 'create' },
  };
};

const savedEvent = (
  event: IEventData,
  proposedChanges: ToolCall[]
): DraftEvent => {
  const { attributes } = event;
  const update = proposedChanges
    .filter((toolCall) => isToolCall(toolCall, 'update_resource'))
    .find((toolCall) => toolCall.attributes.arguments.id === event.id);
  const removal = removalOf(proposedChanges, 'event', event.id);
  const args = update?.attributes.arguments.attributes ?? {};

  return {
    key: event.id,
    title: mergeMultiloc(attributes.title_multiloc, args.title_multiloc),
    description: mergeMultiloc(
      attributes.description_multiloc,
      args.description_multiloc
    ),
    location: mergeMultiloc(
      attributes.location_multiloc,
      args.location_multiloc
    ),
    address: proposedOrSaved(args.address_1, attributes.address_1 ?? null),
    onlineLink: proposedOrSaved(
      args.online_link,
      attributes.online_link ?? null
    ),
    startAt: args.start_at ?? attributes.start_at,
    endAt: args.end_at ?? attributes.end_at,
    values: { proposed: args, saved: attributes },
    changed: Object.keys(args),
    change: firstDecision(update, removal),
    previous: update && savedEvent(event, []),
  };
};

export const getDraftEvents = (
  events: IEventData[],
  proposedChanges: ToolCall[]
): DraftEvent[] => {
  const created = proposedChanges
    .filter((toolCall) => isToolCall(toolCall, 'create_event'))
    .map(proposedEvent);

  return [
    ...events.map((event) => savedEvent(event, proposedChanges)),
    ...created,
  ].sort(byStartDate);
};
