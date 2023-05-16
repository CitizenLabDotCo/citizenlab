import {
  IGlobalPermissionAction,
  IPermissionData,
} from 'services/actionPermissions';
import { IProjectData } from 'api/projects/types';
import { isNilOrError } from 'utils/helperUtils';
import messages from './messages';
import { IPCPermissionAction } from 'typings';
import { FieldType } from 'containers/Admin/settings/registration/CustomFieldRoutes/RegistrationCustomFieldForm';

type GetPermissionActionMessageProps = {
  permissionAction: IPCPermissionAction | IGlobalPermissionAction;
  postType: 'defaultInput' | 'nativeSurvey' | 'initiative';
  project: IProjectData | null | undefined;
};

export type HandlePermissionChangeProps = {
  permission: IPermissionData;
  permittedBy?: IPermissionData['attributes']['permitted_by'];
  globalCustomFields?: IPermissionData['attributes']['global_custom_fields'];
  groupIds: string[];
};

// CL-3466
export const getPermissionActionSectionSubtitle = ({
  permissionAction,
  postType,
  project,
}: GetPermissionActionMessageProps) => {
  if (postType !== 'initiative' && !isNilOrError(project)) {
    return {
      posting_idea:
        postType === 'nativeSurvey'
          ? messages.permissionAction_take_survey_subtitle
          : messages.permissionAction_submit_input_subtitle,
      voting_idea: messages.permissionAction_vote_input_subtitle,
      commenting_idea: messages.permissionAction_comment_input_subtitle,
      taking_survey: messages.permissionAction_take_survey_subtitle,
      taking_poll: messages.permissionAction_take_poll_subtitle,
      budgeting: messages.permissionAction_budgeting_subtitle,
    }[permissionAction];
  }
  if (postType === 'initiative') {
    return {
      voting_initiative: messages.permissionAction_vote_proposals_subtitle,
      commenting_initiative:
        messages.permissionAction_comment_proposals_subtitle,
      posting_initiative: messages.permissionAction_post_proposal_subtitle,
    }[permissionAction];
  }
};

export const getLabelForInputType = (inputType: FieldType) => {
  return {
    text: messages.fieldType_text,
    number: messages.fieldType_number,
    multiline_text: messages.fieldType_multiline_text,
    select: messages.fieldType_select,
    multiselect: messages.fieldType_multiselect,
    checkbox: messages.fieldType_checkbox,
    date: messages.fieldType_date,
  }[inputType];
};
