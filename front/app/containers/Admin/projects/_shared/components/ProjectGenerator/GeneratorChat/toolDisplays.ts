import { AiAssistantToolDisplays } from 'components/AiAssistant/types';

import messages from '../messages';

import ProposedChangeLine from './ProposedChangeLine';

// Proposed changes are decided on in the draft, so the chat only shows where they stand.
export const TOOL_DISPLAYS: AiAssistantToolDisplays = {
  list_areas: { label: messages.areas },
  list_global_topics: { label: messages.topics },
  list_groups: { label: messages.groups },
  list_phase_permissions: { label: messages.accessRights },
  get_resource: { label: messages.draftDetails },
  update_project: {
    label: messages.projectSetup,
    CustomCard: ProposedChangeLine,
  },
  create_phase: { label: messages.newPhase, CustomCard: ProposedChangeLine },
  update_phase: { label: messages.phaseChange, CustomCard: ProposedChangeLine },
  update_phase_permission: {
    label: messages.accessRightsChange,
    CustomCard: ProposedChangeLine,
  },
  create_event: { label: messages.newEvent, CustomCard: ProposedChangeLine },
  update_resource: {
    label: messages.eventChange,
    CustomCard: ProposedChangeLine,
  },
  destroy_resource: { label: messages.removal, CustomCard: ProposedChangeLine },
};
