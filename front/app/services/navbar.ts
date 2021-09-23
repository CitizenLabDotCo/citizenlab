import { IRelationship, Multiloc } from 'typings';
import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { IPageData } from './pages';

export const apiEndpoint = `${API_PATH}/navbar_items`;

export interface INavbarItem {
  id: string;
  type: string;
  attributes: {
    type: string;
    title_multiloc: Multiloc;
    visible: boolean;
    ordering: number;
    created_at: string;
    updated_at: string;
  };
  page: IPageData;
  relationships: {
    page: {
      data: IRelationship[];
    };
  };
}

interface ListProps {
  visible?: boolean;
}

export function listNavbarItems({ visible = undefined }: ListProps = {}) {
  return streams.get<{ data: INavbarItem[] }>({
    apiEndpoint: `${apiEndpoint}`,
    queryParameters: { visible },
  });
}
