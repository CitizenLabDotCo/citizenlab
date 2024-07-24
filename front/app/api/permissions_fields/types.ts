import { Multiloc } from 'typings';

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
  projectId?: string | null;
  action: IGlobalPermissionAction | IPhasePermissionAction;
};

export interface IPermissionsField {
  data: IPermissionsFieldData;
}

export interface IPermissionsFieldAdd {
  action: string;
  phaseId?: string | null;
  projectId?: string | null;
  required: boolean;
  custom_field_id: string;
}

export interface IPermissionCustomFieldUpdate {
  id: string;
  required?: boolean;
}

export interface IPermissionsFieldData {
  id: string;
  type: 'permissions_field';
  attributes: {
    created_at: string;
    lock: string;
    ordering: number;
    persisted: boolean;
    required: boolean;
    title_multiloc?: Multiloc;
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
