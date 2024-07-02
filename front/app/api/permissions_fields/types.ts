import {
  IGlobalPermissionAction,
  IPhasePermissionAction,
} from 'api/permissions/types';

import { Keys } from 'utils/cl-react-query/types';

import eventsKeys from './keys';

export type EventsKeys = Keys<typeof eventsKeys>;

export interface IPermissionsFields {
  data: IPermissionsFieldData[];
}

export type IItemParameters = {
  id?: string;
};

export type IListParameters = {
  phaseId?: string | null;
  initiativeContext?: boolean | null;
  projectId?: string | null;
  action: IGlobalPermissionAction | IPhasePermissionAction;
};

export interface IPermissionsField {
  data: IPermissionsFieldData;
}

export interface IPermissionsFieldAdd {
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

export interface IPermissionsFieldData {
  id: string;
  type: 'permissions_field';
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
