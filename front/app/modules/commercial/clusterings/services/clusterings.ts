import { flatten } from 'lodash-es';
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { Multiloc } from 'typings';

const apiEndpoint = `${API_PATH}/clusterings`;

interface BaseNode {
  id: string;
}

export interface ProjectNode extends BaseNode {
  type: 'project';
  children: Node[];
}

export interface TopicNode extends BaseNode {
  type: 'topic';
  children: Node[];
}

export interface CustomNode extends BaseNode {
  type: 'custom';
  title?: string;
  children: Node[];
  keywords?: {
    name: string;
  }[];
}

export interface IdeaNode extends BaseNode {
  type: 'idea';
}

export type ParentNode = ProjectNode | TopicNode | CustomNode;

export type Node = ParentNode | IdeaNode;

export const ideasUnder = (node: Node): string[] => {
  if (node.type === 'idea') {
    return [node.id];
  } else {
    return flatten(node.children.map((c) => ideasUnder(c)));
  }
};

export interface IClusteringData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    structure: ParentNode;
    created_at: string;
    updated_at: string;
  };
}

export interface IClusteringLinks {
  self: string;
  first: string;
  prev: string;
  next: string;
  last: string;
}

export interface IClusterings {
  data: IClusteringData[];
  links: IClusteringLinks;
}

export interface IClustering {
  data: IClusteringData;
}

export function clusteringByIdStream(clusteringId: string) {
  return streams.get<IClustering>({
    apiEndpoint: `${apiEndpoint}/${clusteringId}`,
  });
}

export function clusteringsStream(streamParams: IStreamParams | null = null) {
  return streams.get<IClusterings>({ apiEndpoint, ...streamParams });
}

export function addClustering(object) {
  return streams.add<IClustering>(apiEndpoint, { clustering: object });
}

export function deleteClustering(clusteringId: string) {
  return streams.delete(`${apiEndpoint}/${clusteringId}`, clusteringId);
}
