import {
  ICustomFieldParams,
  IUsersByCustomField,
} from 'api/users_by_custom_field/types';
import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

const apiEndpoint = `${API_PATH}/stats`;

export const usersByRegFieldXlsxEndpoint = (customFieldId: string) =>
  `${apiEndpoint}/users_by_custom_field_as_xlsx/${customFieldId}`;

export function usersByRegFieldStream(
  streamParams: ICustomFieldParams | null = null,
  customFieldId: string
) {
  return streams.get<IUsersByCustomField>({
    apiEndpoint: `${apiEndpoint}/users_by_custom_field/${customFieldId}`,
    ...streamParams,
    cacheStream: false,
  });
}
