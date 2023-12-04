import { Localize } from 'hooks/useLocalize';
import { MessageDescriptor } from 'utils/cl-intl';
import messages from './messages';
import { FormatMessage } from 'typings';
import { IPCPermissionData, permittedBy } from 'api/phase_permissions/types';
import { IPhasePermissionAction } from 'api/permissions/types';
import { IGroupData } from 'api/groups/types';

export const getPartipationRequirementMessage = (
  permittedBy: permittedBy,
  noOfGroups: number,
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
    case 'everyone_confirmed_email':
      participantMessage = messages.usersWithConfirmedEmail;
      break;
    case 'groups':
      return formatMessage(messages.groups, {
        noOfGroups,
      });
    case 'everyone':
      participantMessage = messages.everyone;
      break;
  }
  return formatMessage(participantMessage);
};

export const getParticipantMessage = (
  permissions: IPCPermissionData[] | undefined,
  formatMessage: FormatMessage
) => {
  if (!permissions?.length) return null;

  const {
    attributes: { permitted_by },
    relationships,
  } = permissions[0];

  if (permissions.length === 1) {
    return getPartipationRequirementMessage(
      permitted_by,
      relationships.groups.data.length,
      formatMessage
    );
  }

  return formatMessage(messages.mixedRights);
};

export const getParticipationActionLabel = (action: IPhasePermissionAction) => {
  switch (action) {
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
  }
};

export const getGroupMessage = (
  permission: IPCPermissionData,
  groups: IGroupData[],
  localize: Localize,
  formatMessage: FormatMessage
) => {
  if (permission.relationships.groups.data.length === 0) {
    return formatMessage(messages.noGroups);
  }
  const groupIds = permission.relationships.groups.data.map(
    (group) => group.id
  );
  const groupNames = groups
    ?.filter((group) => groupIds.includes(group.id))
    .map((group) => localize(group.attributes.title_multiloc));
  return groupNames.length > 1
    ? `${groupNames.slice(0, -1).join(', ')} ${formatMessage(
        messages.and
      )} ${groupNames.slice(-1)}`
    : `${formatMessage(messages.only)} ${groupNames[0]}`;
};
