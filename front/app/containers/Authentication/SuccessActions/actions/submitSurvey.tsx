import { addIdea, invalidateIdeaQueries } from 'api/ideas/useAddIdea';
import { IProjectData } from 'api/projects/types';
import { FormValues } from 'containers/IdeasNewPage/IdeasNewForm';
import { queryClient } from 'utils/cl-react-query/queryClient';
import { ParticipationMethodConfig } from 'utils/configs/participationMethodConfig';

export interface SubmitSurveyParams {
  project: IProjectData;
  data: FormValues;
  phase_ids: string[] | null;
  postAnonymously?: boolean;
  config?: ParticipationMethodConfig;
}

export const submitSurvey =
  ({ data, config, phase_ids, postAnonymously, project }: SubmitSurveyParams) =>
  async () => {
    const idea = await addIdea({
      ...data,
      project_id: project.id,
      publication_status: 'published',
      phase_ids,
      anonymous: postAnonymously ? true : undefined,
    });

    const ideaId = idea.data.id;
    config?.onFormSubmission({ project, ideaId, idea });

    // Invalidate cache
    invalidateIdeaQueries(idea, queryClient);
  };
