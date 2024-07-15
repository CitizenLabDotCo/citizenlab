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
  custom_field_id: string;
  required: boolean;
  phaseId?: string | null;
  projectId?: string | null;
  action: string;
}

export type EmailConfig = {
  password: boolean;
  confirmed: boolean;
};

export interface IPermissionCustomFieldUpdate {
  id: string;
  required?: boolean;
  verified?: boolean;
  enabled?: boolean;
  config?: EmailConfig;
}

export interface IPermissionsFieldData {
  id: string;
  type: 'permissions_field';
  attributes: {
    config: Record<string, never> | EmailConfig;
    // Is an EmailConfig if field_type is 'email'
    // Is an empty object otherwise

    created_at: string;
    enabled: boolean;
    field_type: 'name' | 'email' | 'custom_field';
    locked: boolean;
    ordering: number;
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
      } | null;
    };
  };
}
