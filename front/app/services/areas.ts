import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { Multiloc } from 'typings';

const apiEndpoint = `${API_PATH}/areas`;

export interface IAreaData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    ordering: number;
  };
}

export interface IAreaLinks {
  self: string;
  first: string;
  prev: string;
  next: string;
  last: string;
}

export interface IAreas {
  data: IAreaData[];
  links: IAreaLinks;
}

export interface IArea {
  data: IAreaData;
}

export function areaByIdStream(areaId: string) {
  return streams.get<IArea>({ apiEndpoint: `${apiEndpoint}/${areaId}` });
}

export function areasStream(streamParams: IStreamParams | null = null) {
  return streams.get<IAreas>({ apiEndpoint, ...streamParams });
}

export function addArea(object) {
  return streams.add<IArea>(apiEndpoint, { area: object });
}

export function updateArea(areaId: string, object) {
  return streams.update<IArea>(`${apiEndpoint}/${areaId}`, areaId, {
    area: object,
  });
}

export function deleteArea(areaId: string) {
  return streams.delete(`${apiEndpoint}/${areaId}`, areaId);
}

export async function reorderArea(areaId: string, newOrder: number) {
  const response = streams.update<IArea>(`${apiEndpoint}/${areaId}`, areaId, {
    area: { ordering: newOrder },
  });

  await streams.fetchAllWith({
    apiEndpoint: [apiEndpoint],
  });

  return response;
}
