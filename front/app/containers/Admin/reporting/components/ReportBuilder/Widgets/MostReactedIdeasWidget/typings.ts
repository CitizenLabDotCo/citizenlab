import { IIdeaImageData } from 'api/idea_images/types';
import { IIdeaData } from 'api/ideas/types';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';
import { Multiloc } from 'typings';

export interface Props {
  title?: Multiloc;
  projectId?: string;
  phaseId?: string;
  numberOfIdeas: number;
  collapseLongText: boolean;
}

export interface Response {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      ideas: IIdeaData[];
      project: IProjectData;
      phase: IPhaseData;
      idea_images: IIdeaImageData[];
    };
  };
}
