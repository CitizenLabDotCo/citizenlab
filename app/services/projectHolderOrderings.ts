import streams, { IStreamParams } from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import { ILinks } from 'typings';
import { PublicationStatus } from 'services/projects';

const apiEndpoint = `${API_PATH}/project_holder_orderings`;

/*
  Data structure to handle the ordering of published projects and folders.
  Projects and folders are not included, they have to be fetched separately.
*/

export interface IProjectHolderOrderingData {
  id: string;
  type: 'project_holder_orderings';
  attributes: {
    ordering: number;
  };
  relationships: {
    project_holder: {
      data: {
        id: string,
        type: 'project' | 'project_folder'
      };
    }
  };
}

export interface IProjectHolderOrdering {
  data: IProjectHolderOrderingData[];
  links: ILinks;
}

interface IQueryParametersWithPS {
  publication_statuses: PublicationStatus[];
  [key: string]: any;
}

interface StreamParamsForProjects extends IStreamParams {
  queryParameters: IQueryParametersWithPS;
}

export function listProjectHolderOrderings(streamParams: StreamParamsForProjects) {
  return streams.get<IProjectHolderOrdering>({ apiEndpoint, ...streamParams });
}

export async function reorderProjectHolder(orderingId: string, newOrder: number) {
  return streams.update<IProjectHolderOrdering>(
    `${apiEndpoint}/${orderingId}/reorder`,
    orderingId,
    {
      project_holder_ordering: {
        ordering: newOrder
      }
    }
  );
}
