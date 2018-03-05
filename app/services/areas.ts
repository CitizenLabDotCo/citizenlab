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

export function areasStream(streamParams: IStreamParams | null = null) {
  return streams.get<IAreas>({ apiEndpoint, ...streamParams });
}

/*
const data = {
  title_multiloc: action.title,
  description_multiloc: action.description,
};
*/

export function addArea(object) {
  return streams.add<IArea>(apiEndpoint, { area: object });
}
