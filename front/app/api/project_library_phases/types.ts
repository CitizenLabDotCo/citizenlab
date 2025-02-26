import { Keys } from 'utils/cl-react-query/types';

import projectLibraryPhasesKeys from './keys';

export type ProjectLibraryPhasesKeys = Keys<typeof projectLibraryPhasesKeys>;

export interface ProjectLibraryPhase {
  data: {
    type: 'project_library_phase';
    id: string;
    attributes: {
      // TODO
    };
  };
}
