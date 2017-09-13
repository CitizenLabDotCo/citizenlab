import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import request from 'utils/request';
import { API, Multiloc } from 'typings';

const apiEndpoint = `${API_PATH}/tenants`;

interface TenantSettings {
  core: {
    allowed: boolean;
    enabled: boolean;
    locales: string[];
    timezone: string;
    organization_name: Multiloc;
    organization_type: string;
    header_slogan: Multiloc | null;
    meta_title: Multiloc | null;
    meta_description: Multiloc | null;
    color_main: string | null;
    color_menu_bg: string | null;
  };
  demographic_fields: {
    allowed: boolean;
    enabled: boolean;
    gender: boolean;
    birthyear: boolean;
    domicile: boolean;
    education: boolean;
  };
}

export interface ITenantData {
  id: string;
  type: string;
  attributes: {
    name: string;
    host: string;
    settings: TenantSettings;
    logo: API.ImageSizes;
    header_bg: API.ImageSizes;
  };
}

export interface TenantUpdatedAttributes {
  settings?: TenantSettings;
  logo?: string | API.ImageSizes | null;
  header_bg?: string | API.ImageSizes | null;
}

export interface ITenant {
  data: ITenantData;
}

export function currentTenantStream(streamParams: IStreamParams<ITenant> | null = null) {
  return streams.get<ITenant>({ apiEndpoint: `${apiEndpoint}/current`, ...streamParams });
}
