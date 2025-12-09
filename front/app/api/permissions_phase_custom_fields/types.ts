import { Multiloc } from 'typings';

import { Action } from 'api/permissions/types';

import { Keys } from 'utils/cl-react-query/types';

import permissionsPhaseCustomFieldsKeys from './keys';

export type PermissionsPhaseCustomFieldsKeys = Keys<
  typeof permissionsPhaseCustomFieldsKeys
>;

export interface IPermissionsPhaseCustomFields {
  data: IPermissionsPhaseCustomFieldData[];
}

export type IItemParameters = {
  id?: string;
};

export type IListParameters = {
  phaseId?: string;
  action: Action;
};

export interface IPermissionsPhaseCustomField {
  data: IPermissionsPhaseCustomFieldData;
}

export interface IPermissionsPhaseCustomFieldAdd {
  action: Action;
  phaseId?: string;
  required: boolean;
  custom_field_id: string;
}

export type IPermissionPhaseCustomFieldUpdate = {
  id: string;

  // These two should be defined if the
  // field is not persisted yet.
  permission_id?: string;
  custom_field_id?: string;

  // the actual parameter
  required?: boolean;
};

export interface IPermissionsPhaseCustomFieldData {
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
