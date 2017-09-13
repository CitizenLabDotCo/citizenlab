import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

export interface ITenantSettings {
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
  };
}

export interface ITenantData {
  id: string;
  type: string;
  attributes: {
    name: string;
    host: string;
    settings: ITenantSettings;
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

export interface IUpdatedTenantProperties {
  settings: Partial<ITenantSettings>;
  logo: string;
  header_bg: string;
}

export function currentTenantStream() {
  return streams.get<ITenant>({ apiEndpoint: `${API_PATH}/tenants/current` });
}

export function updateTenant(tenantId: string, object: IUpdatedTenantProperties) {
  return streams.update<ITenant>(`${API_PATH}/tenants/${tenantId}`, tenantId, { tenant: object });
}
