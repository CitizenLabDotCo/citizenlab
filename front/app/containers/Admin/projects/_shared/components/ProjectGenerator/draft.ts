import { Multiloc } from 'typings';

import { UpdatePhaseArguments } from 'api/ai_assistant_tool_calls/tools/updatePhase';
import { UpdateProjectArguments } from 'api/ai_assistant_tool_calls/tools/updateProject';
import {
  AiAssistantToolCall,
  AiAssistantToolName,
  IAiAssistantToolCallData,
} from 'api/ai_assistant_tool_calls/types';
import { isToolCall } from 'api/ai_assistant_tool_calls/utils';
import { IEventData } from 'api/events/types';
import { IPhaseData, ParticipationMethod } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

// The saved project, phases and events, with the proposed changes applied on top.

type ToolCall = IAiAssistantToolCallData;

export type ProposedChange = {
  toolCall: ToolCall;
  kind: 'create' | 'update' | 'remove';
};

export type DraftProject = {
  title: Multiloc;
  descriptionPreview: Multiloc;
  headerImageUrl: string | null;
  change?: ProposedChange;
};

export type DraftPhase = {
  key: string;
  title: Multiloc;
  description: Multiloc;
  method: ParticipationMethod;
  startAt: string;
  endAt: string | null;
  change?: ProposedChange;
};

export type DraftEvent = {
  key: string;
  title: Multiloc;
  location: Multiloc;
  address: string | null;
  onlineLink: string | null;
  startAt: string;
  endAt: string;
  change?: ProposedChange;
};

export const CHANGE_TOOLS: AiAssistantToolName[] = [
  'update_project',
  'create_phase',
  'update_phase',
  'update_phase_permission',
  'create_event',
  'update_resource',
  'destroy_resource',
];

// Questions also wait for the admin, but they are answered in the chat, not in the draft.
export const getProposedChanges = (toolCalls: ToolCall[]) =>
  toolCalls.filter(
    ({ attributes }) =>
      attributes.status === 'awaiting_user' && attributes.name !== 'ask_user'
  );

// The changes that ran, right away or once approved.
export const getAppliedChanges = (toolCalls: ToolCall[]) =>
  toolCalls.filter(
    ({ attributes }) =>
      ['executed', 'auto_executed'].includes(attributes.status) &&
      CHANGE_TOOLS.includes(attributes.name)
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
  const { attributes } = project;
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
    headerImageUrl: attributes.header_bg.large,
    change: toolCall && { toolCall, kind: 'update' },
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

// An item offers one decision at a time, and a removal comes last: approving it removes the item.
const firstChange = (
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
  const accessRightsUpdate = proposedChanges
    .filter((toolCall) => isToolCall(toolCall, 'update_phase_permission'))
    .find((toolCall) => toolCall.attributes.arguments.phase_id === phase.id);
  const args: Partial<UpdatePhaseArguments> =
    update?.attributes.arguments ?? {};

  return {
    key: phase.id,
    title: mergeMultiloc(attributes.title_multiloc, args.title_multiloc),
    description: mergeMultiloc(
      attributes.description_multiloc,
      args.description_multiloc
    ),
    method: args.participation_method ?? attributes.participation_method,
    startAt: args.start_at ?? attributes.start_at,
    endAt: proposedOrSaved(args.end_at, attributes.end_at),
    change: firstChange(
      update ?? accessRightsUpdate,
      removalOf(proposedChanges, 'phase', phase.id)
    ),
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
    location: args.location_multiloc ?? {},
    address: args.address_1 ?? null,
    onlineLink: args.online_link ?? null,
    startAt: args.start_at,
    endAt: args.end_at,
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
  const args = update?.attributes.arguments.attributes ?? {};

  return {
    key: event.id,
    title: mergeMultiloc(attributes.title_multiloc, args.title_multiloc),
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
    change: firstChange(update, removalOf(proposedChanges, 'event', event.id)),
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
