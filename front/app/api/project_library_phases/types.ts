import { Multiloc } from 'typings';

import { ParticipationMethod } from 'api/phases/types';

import { Keys } from 'utils/cl-react-query/types';

import projectLibraryPhasesKeys from './keys';

export type ProjectLibraryPhasesKeys = Keys<typeof projectLibraryPhasesKeys>;

export interface ProjectLibraryPhase {
  data: ProjectLibraryPhaseData;
}

export type ProjectLibraryPhaseData = {
  type: 'project_library_phase';
  id: string;
  attributes: {
    cl_created_at: string;
    cl_updated_at: string;
    created_at: string;
    description_en: string;
    description_multiloc: Multiloc;
    end_at: string | null;
    participation_method: ParticipationMethod;
    project_id: string;
    start_at: string;
    title_en: string;
    title_multiloc: Multiloc;
    updated_at: string;
  };
};
