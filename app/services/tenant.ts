import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import request from 'utils/request';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';

const apiEndpoint = `${API_PATH}/tenants`;

export interface ITenantData {
  id: string;
  type: string;
  attributes: {
    name: string;
    host: string;
    settings: {
      core: {
        allowed: boolean;
        enabled: boolean;
        locales: string[];
        timezone: string;
        organization_name: {
          [key: string]: string;
        };
        organization_type: string;
        header_slogan: {
          [key: string]: string;
        } | null;
        meta_title: {
          [key: string]: string;
        } | null;
        meta_description: {
          [key: string]: string;
        } | null;
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
      }
    };
    logo: {
      small: string | null;
      medium: string | null;
      large: string | null;
    };
    header_bg: {
      large: string | null;
      medium: string | null;
      small: string | null;
    };
  };
}

export interface ITenant {
  data: ITenantData;
}

export function currentTenantStream(streamParams: IStreamParams<ITenant> | null = null) {
  return streams.get<ITenant>({ apiEndpoint: `${apiEndpoint}/current`, ...streamParams });
}
