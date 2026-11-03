import { FormatMessage } from 'typings';

import { Action, IPermissionData, PermittedBy } from 'api/permissions/types';

import { MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';

export const getPartipationRequirementMessage = (
  permittedBy: PermittedBy,
  formatMessage: FormatMessage
) => {
  let participantMessage: MessageDescriptor;
  switch (permittedBy) {
    case 'users':
      participantMessage = messages.registeredUsers;
      break;
    case 'admins_moderators':
      participantMessage = messages.adminsAndManagers;
      break;
    case 'everyone':
      participantMessage = messages.everyone;
      break;
  }
  return formatMessage(participantMessage);
};

export const getParticipantMessage = (
  permissions: IPermissionData[] | undefined,
  formatMessage: FormatMessage
) => {
  if (!permissions?.length) return null;

  const {
    attributes: { permitted_by },
  } = permissions[0];

  if (permissions.length === 1) {
    return getPartipationRequirementMessage(permitted_by, formatMessage);
  }

  return formatMessage(messages.mixedRights);
};

// Returns undefined for the actions that cannot occur in a phase.
export const getParticipationActionLabel = (action: Action) => {
  switch (action) {
    case 'visiting':
    case 'following':
      return undefined;
    case 'posting_idea':
      return messages.submitInputs;
    case 'reacting_idea':
      return messages.react;
    case 'commenting_idea':
      return messages.comment;
    case 'taking_survey':
      return messages.takingSurvey;
    case 'taking_poll':
      return messages.takingPoll;
    case 'voting':
      return messages.voting;
    case 'annotating_document':
      return messages.annotatingDocument;
    case 'attending_event':
      return messages.registeredForEvent;
    case 'volunteering':
      return messages.volunteering;
  }
};
