import useAddAnalysis from 'api/analyses/useAddAnalysis';
import useAnalyses from 'api/analyses/useAnalyses';
import usePhase from 'api/phases/usePhase';

import tracks from 'containers/Admin/projects/project/analysis/tracks';

import { trackEventByName } from 'utils/analytics';
import clHistory from 'utils/cl-router/history';

import { getAnalysisScope } from './utils';

/**
 * Opens the phase's analysis, creating it first when there is none yet.
 */
const useGoToAnalysis = (projectId: string, phaseId: string) => {
  const { data: phase } = usePhase(phaseId);
  const scope = getAnalysisScope(phase?.data.attributes.participation_method);

  const { data: analyses, isLoading } = useAnalyses({
    projectId: scope === 'project' ? projectId : undefined,
    phaseId: scope === 'phase' ? phaseId : undefined,
  });
  const { mutate: createAnalysis, isPending } = useAddAnalysis();

  const analysisUrl = (analysisId: string) =>
    `/admin/projects/${
      projectId || phase?.data.relationships.project.data.id
    }/analysis/${analysisId}?phase_id=${phaseId}`;

  const goToAnalysis = () => {
    if (analyses?.data.length) {
      clHistory.push(analysisUrl(analyses.data[0].id));
      return;
    }

    createAnalysis(
      {
        projectId: scope === 'project' ? projectId : undefined,
        phaseId: scope === 'phase' ? phaseId : undefined,
      },
      {
        onSuccess: (analysis) => {
          clHistory.push(analysisUrl(analysis.data.id));
          trackEventByName(tracks.analysisCreated, {
            projectId,
            phaseId,
            participationMethod:
              phase?.data.attributes.participation_method || 'ideation',
          });
        },
      }
    );
  };

  return { goToAnalysis, isLoading, isPending };
};

export default useGoToAnalysis;
