import { Keys } from 'utils/cl-react-query/types';
import eventsKeys from './keys';
import {
  IGlobalPermissionAction,
  IParticipationContextPermissionAction,
} from 'api/permissions/types';

export type EventsKeys = Keys<typeof eventsKeys>;

export interface IPermissionsCustomFields {
  data: IPermissionsCustomFieldData[];
}

export type IItemParameters = {
  id?: string;
};

export type IListParameters = {
  phaseId?: string | null;
  initiativeContext?: boolean | null;
  projectId?: string | null;
  action: IGlobalPermissionAction | IParticipationContextPermissionAction;
};

export interface IPermissionsCustomField {
  data: IPermissionsCustomFieldData;
}

export interface IPermissionsCustomFieldAdd {
  custom_field_id: string;
  required: boolean;
  phaseId?: string | null;
  initiativeContext?: boolean | null;
  projectId?: string | null;
  action: string;
}

export interface IPermissionCustomFieldUpdate {
  id: string;
  required: boolean;
}

export interface IPermissionsCustomFieldData {
  id: string;
  type: 'permissions_custom_field';
  attributes: {
    required: boolean;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    permission: {
      data: {
        id: string;
        type: 'permission';
      };
    };
    custom_field: {
      data: {
        id: string;
        type: 'custom_field';
      };
    };
  };
}
