import { useQuery } from '@tanstack/react-query';
import { API_PATH } from 'containers/App/constants';
import { IRelationship } from 'typings';
import { getJwt } from 'utils/auth/jwt';

export interface IInsightsViewData {
  id: string;
  type: 'view';
  attributes: {
    name: string;
    updated_at: string;
  };
  relationships?: {
    data_sources: {
      data: IRelationship[];
    };
  };
}

export interface IInsightsView {
  data: IInsightsViewData;
}

export interface IInsightsViews {
  data: IInsightsViewData[];
}

const jwt = getJwt();

const viewKeys = {
  all: [{ type: 'view' }] as const,
  list: () => [{ ...viewKeys.all[0], entity: 'list' }] as const,
};

const fetchViews = async () => {
  const res = await fetch(`${API_PATH}/insights/views`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
  });
  const data = await res.json();
  return data;
};

export const useInsightsViews = () => {
  return useQuery({ queryKey: viewKeys.list(), queryFn: fetchViews });
};
