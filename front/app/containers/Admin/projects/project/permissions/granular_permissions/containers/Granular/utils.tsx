import { MessageDescriptor } from 'react-intl';

import {
  IGlobalPermissionAction,
  IPermissionData,
  IPhasePermissionAction,
} from 'api/permissions/types';

import { FieldType } from 'containers/Admin/settings/registration/CustomFieldRoutes/RegistrationCustomFieldForm';

import messages from './messages';

type GetPermissionActionMessageProps = {
  permissionAction: IPhasePermissionAction | IGlobalPermissionAction;
  postType: 'defaultInput' | 'nativeSurvey' | 'initiative';
};

export type HandlePermissionChangeProps = {
  permission: IPermissionData;
  permittedBy?: IPermissionData['attributes']['permitted_by'];
  globalCustomFields?: IPermissionData['attributes']['global_custom_fields'];
  groupIds: string[];
  phaseId?: string | null;
};

export const getPermissionActionSectionSubtitle = ({
  permissionAction,
  postType,
}: GetPermissionActionMessageProps) => {
  if (postType !== 'initiative') {
    const participationContextPermissionActionMessages: {
      [key in IPhasePermissionAction]: MessageDescriptor;
    } = {
      posting_idea:
        postType === 'nativeSurvey'
          ? messages.permissionAction_take_survey_subtitle
          : messages.permissionAction_submit_input_subtitle,
      reacting_idea: messages.permissionAction_reaction_input_subtitle,
      commenting_idea: messages.permissionAction_comment_input_subtitle,
      taking_survey: messages.permissionAction_take_survey_subtitle,
      taking_poll: messages.permissionAction_take_poll_subtitle,
      voting: messages.permissionAction_voting_subtitle,
      annotating_document:
        messages.permissionAction_annotating_document_subtitle,
      attending_event: messages.permissionAction_attending_event_subtitle,
      volunteering: messages.permissionAction_volunteering_subtitle,
    };
    return participationContextPermissionActionMessages[permissionAction];
  }
  if (postType === 'initiative') {
    const globalPermissionActionMessages: {
      [key in Exclude<IGlobalPermissionAction, 'following'>]: MessageDescriptor;
    } = {
      reacting_initiative: messages.permissionAction_vote_proposals_subtitle,
      commenting_initiative:
        messages.permissionAction_comment_proposals_subtitle,
      posting_initiative: messages.permissionAction_post_proposal_subtitle,
    };

    return globalPermissionActionMessages[permissionAction];
  }
};

export const getLabelForInputType = (inputType: FieldType) => {
  const inputTypeMessages: { [key in FieldType]: MessageDescriptor } = {
    text: messages.fieldType_text,
    number: messages.fieldType_number,
    multiline_text: messages.fieldType_multiline_text,
    select: messages.fieldType_select,
    multiselect: messages.fieldType_multiselect,
    checkbox: messages.fieldType_checkbox,
    date: messages.fieldType_date,
  };

  return inputTypeMessages[inputType];
};
