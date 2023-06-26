import { IUserCustomFieldData } from './types';

export function isBuiltInField(field: IUserCustomFieldData) {
  return !!field.attributes.code;
}

export function isHiddenField(field: IUserCustomFieldData) {
  return !!field.attributes.hidden;
}
