import { API_PATH } from 'containers/App/constants';

export const usersByCustomFieldXlsxEndpoint = (customFieldId: string) =>
  `${API_PATH}/stats/users_by_custom_field_as_xlsx/${customFieldId}`;
