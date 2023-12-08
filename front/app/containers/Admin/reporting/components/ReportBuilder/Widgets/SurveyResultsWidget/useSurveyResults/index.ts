import { useNode } from '@craftjs/core';
import useGraphDataUnitsLive from 'api/graph_data_units/useGraphDataUnitsLive';
import useGraphDataUnitsPublished from 'api/graph_data_units/useGraphDataUnitsPublished';
import { SurveyResultsType } from 'api/survey_results/types';
import { useLocation } from 'react-router-dom';
import { isPage } from 'utils/helperUtils';

const useSurveyResults = ({
  projectId,
  phaseId,
  reportId,
}: {
  projectId: string;
  phaseId?: string | null;
  reportId?: string;
}) => {
  const { pathname } = useLocation();
  const { id: graphId } = useNode();
  const isAdminPage = isPage('admin', pathname);

  const { data: analyticsLive } = useGraphDataUnitsLive<SurveyResultsType>(
    {
      resolvedName: 'SurveyResultsWidget',
      props: { projectId, phaseId },
    },
    { enabled: isAdminPage }
  );

  const { data: analyticsPublished } =
    useGraphDataUnitsPublished<SurveyResultsType>(
      {
        reportId,
        graphId,
      },
      { enabled: !isAdminPage }
    );

  return analyticsLive ?? analyticsPublished;
};

export default useSurveyResults;
