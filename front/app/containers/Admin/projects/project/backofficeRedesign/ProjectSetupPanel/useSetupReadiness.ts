import useGlobalTopics from 'api/global_topics/useGlobalTopics';
import usePhases from 'api/phases/usePhases';
import useProjectImages from 'api/project_images/useProjectImages';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import { getDraftValues, useOptionalSetupDraft } from './SetupDraftContext';

export interface SetupReadiness {
  general: boolean;
  methods: boolean;
  page: boolean;
  homepageCard: boolean;
  area: boolean;
  topics: boolean;
}

const useSetupReadiness = (
  project: IProjectData
): { readiness: SetupReadiness; isLoading: boolean } => {
  const localize = useLocalize();
  const draft = useOptionalSetupDraft();
  const changes = draft?.changes ?? {};
  const imageChanges = draft?.imageChanges ?? {};
  const { data: phases, isLoading: phasesLoading } = usePhases(project.id);
  const { data: images, isLoading: imagesLoading } = useProjectImages(
    project.id
  );
  const { data: platformTopics, isLoading: topicsLoading } = useGlobalTopics(
    {}
  );

  const { attributes } = project;

  const completedSteps = attributes.completed_setup_steps ?? [];

  const hasCardImage =
    imageChanges.image !== undefined
      ? imageChanges.image !== null
      : (images?.data.length ?? 0) > 0;
  const hasCardDescription =
    localize(
      changes.description_preview_multiloc ??
        attributes.description_preview_multiloc
    ).trim().length > 0;
  const { areaIds, includeAllAreas, topicIds } = getDraftValues(
    project,
    changes
  );

  const platformHasTopics = platformTopics
    ? platformTopics.data.length > 0
    : true;

  return {
    readiness: {
      general: completedSteps.includes('settings'),
      methods: (phases?.data.length ?? 0) > 0,
      page: completedSteps.includes('page'),
      homepageCard: hasCardImage && hasCardDescription,
      area: areaIds.length > 0 || includeAllAreas,
      topics: !platformHasTopics || topicIds.length > 0,
    },
    isLoading: phasesLoading || imagesLoading || topicsLoading,
  };
};

export default useSetupReadiness;
