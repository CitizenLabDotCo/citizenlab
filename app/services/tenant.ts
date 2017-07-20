import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import request from 'utils/request';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';

const apiEndpoint = `${API_PATH}/tenants/`;

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

export function observeCurrentTenant(userId: string, streamParams: IStreamParams<ITenant> | null = null) {
  return streams.create<ITenant>({ apiEndpoint: `${apiEndpoint}/current`, ...streamParams });
}
