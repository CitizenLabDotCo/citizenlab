import { Keys } from 'utils/cl-react-query/types';
import eventsKeys from './keys';

export type EventsKeys = Keys<typeof eventsKeys>;

export type IUpdatePermissionObject = {
  permissionId: string;
  custom_field_id: string;
  required: boolean;
};

export interface IPermissionsCustomFields {
  data: IPermissionsCustomFieldData[];
}

export interface IPermissionsCustomField {
  data: IPermissionsCustomFieldData;
}

export interface IPermissionsCustomField {
  phaseId?: string;
  projectId: string;
  initiativeId?: string;
  action: string;
  custom_field_id: string;
  required: string;
}

export interface IPermissionsCustomFieldAdd {
  custom_field_id: string;
  required: boolean;
  phaseId: string;
  initiativeId: string;
  projectId: string;
  action: string;
}

export interface IPermissionCustomFieldUpdate {
  id: string;
  required: boolean;
}

export type IPCPermissionAction =
  | 'posting_idea'
  | 'voting_idea'
  | 'commenting_idea'
  | 'commenting_idea'
  | 'taking_survey'
  | 'taking_poll'
  | 'budgeting';

export interface IPermissionsCustomFieldData {
  custom_field_id: string;
  required: boolean;
  type: string;
}
