import { IRelationship } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import customFieldBinsKeys from './keys';

export type CustomFieldBinsKeys = Keys<typeof customFieldBinsKeys>;

export interface ICustomFieldBinData {
  id: string;
  type: 'custom_field_bin';
  attributes: {
    type:
      | 'CustomFieldBins::OptionBin'
      | 'CustomFieldBins::RangeBin'
      | 'CustomFieldBins::ValueBin'
      | 'CustomFieldBins::AgeBin';
    range: null | { begin: number; end: number | null };
    values: null | number[];
    created_at: string;
    updated_at: string;
  };
  relationships: {
    custom_field: { data?: IRelationship };
    custom_field_option: { data?: IRelationship } | null;
  };
}

export interface ICustomFieldBins {
  data: ICustomFieldBinData[];
}

export interface ICustomFieldBin {
  data: ICustomFieldBinData;
}
