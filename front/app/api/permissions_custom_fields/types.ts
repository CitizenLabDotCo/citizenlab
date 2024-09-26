import { Multiloc } from 'typings';

import { Action } from 'api/permissions/types';

import { Keys } from 'utils/cl-react-query/types';

import eventsKeys from './keys';

export type EventsKeys = Keys<typeof eventsKeys>;

export interface IPermissionsCustomFields {
  data: IPermissionsCustomFieldData[];
}

export type IItemParameters = {
  id?: string;
};

export type IListParameters = {
  phaseId?: string;
  action: Action;
};

export interface IPermissionsCustomField {
  data: IPermissionsCustomFieldData;
}

export interface IPermissionsCustomFieldAdd {
  action: Action;
  phaseId?: string;
  required: boolean;
  custom_field_id: string;
}

export type IPermissionCustomFieldUpdate = {
  id: string;

  // These two should be defined if the
  // field is not persisted yet.
  permission_id?: string;
  custom_field_id?: string;

  // the actual parameter
  required?: boolean;
};

export interface IPermissionsCustomFieldData {
  id: string;
  type: 'permissions_custom_field';
  attributes: {
    created_at: string;
    lock: null | 'verification' | 'group';
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
