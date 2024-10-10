import { MessageDescriptor } from 'react-intl';

import { Action } from 'api/permissions/types';
import { IPhasePermissionAction } from 'api/phase_permissions/types';

import { FieldType } from 'containers/Admin/settings/registration/CustomFieldRoutes/RegistrationCustomFieldForm';

import messages from './messages';

type GetPermissionActionMessageProps = {
  permissionAction: Action;
  postType: 'defaultInput' | 'nativeSurvey';
};

export const getPermissionActionSectionSubtitle = ({
  permissionAction,
  postType,
}: GetPermissionActionMessageProps) => {
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
    annotating_document: messages.permissionAction_annotating_document_subtitle,
    attending_event: messages.permissionAction_attending_event_subtitle,
    volunteering: messages.permissionAction_volunteering_subtitle,
  };
  return participationContextPermissionActionMessages[permissionAction];
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
