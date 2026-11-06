import { Multiloc } from 'typings';

import { UpdateProjectArguments } from 'api/ai_assistant_tool_calls/tools/updateProject';
import { IAiAssistantToolCallData } from 'api/ai_assistant_tool_calls/types';
import { isToolCall } from 'api/ai_assistant_tool_calls/utils';
import { IProjectData, Visibility } from 'api/projects/types';

// The saved project, with the proposed changes applied on top.

type ToolCall = IAiAssistantToolCallData;

export type ProposedChange = {
  toolCall: ToolCall;
  kind: 'create' | 'update' | 'remove';
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
  changed: string[];
  change?: ProposedChange;
  // The saved project, when a proposed change updates it.
  previous?: DraftProject;
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
    changed: Object.keys(args),
    change: toolCall && { toolCall, kind: 'update' },
    previous: toolCall && getDraftProject(project, []),
  };
};
