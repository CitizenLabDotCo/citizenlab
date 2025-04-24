import { Keys } from 'utils/cl-react-query/types';

import projectLibraryTopicsKeys from './keys';

export type ProjectLibraryTopicsKeys = Keys<typeof projectLibraryTopicsKeys>;

export type Parameters = any;

export type ProjectLibraryTopics = {
  data: {
    id: string;
    type: 'project_library_topics';
    attributes: {
      // TODO
    };
  }[];
};
