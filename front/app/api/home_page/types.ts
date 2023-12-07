import { Keys } from 'utils/cl-react-query/types';
import homepageSettingsKeys from './keys';
import { SerializedNode } from '@craftjs/core';

export type HomepageSettingsKeys = Keys<typeof homepageSettingsKeys>;

export interface IHomepageSettings {
  data: IHomepageSettingsData;
}

export interface IHomepageSettingsData {
  id: string;
  type: 'home_page';
  attributes: IHomepageSettingsAttributes;
}

export interface IHomepageSettingsAttributes {
  // content builder
  craftjs_json?: Record<string, SerializedNode>;
}
