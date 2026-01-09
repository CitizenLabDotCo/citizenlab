import { useState, useMemo } from 'react';

import { useParams } from 'react-router-dom';

import useProjectById from 'api/projects/useProjectById';
import { ResultUngrouped } from 'api/survey_results/types';
import useFormResults from 'api/survey_results/useSurveyResults';

export interface LogicConfig {
  toggleLogicIds: (logicId: string) => void;
  filterLogicIds: string[];
  isLoading: boolean;
}

interface UseSurveyResultsDataProps {
  projectId?: string;
  phaseId?: string;
}

interface UseSurveyResultsDataReturn {
  results: ResultUngrouped[];
  totalSubmissions: number;
  logicConfig: LogicConfig;
  isReady: boolean;
}

const useSurveyResultsData = ({
  projectId: projectIdProp,
  phaseId: phaseIdProp,
}: UseSurveyResultsDataProps): UseSurveyResultsDataReturn => {
  const { projectId: projectIdParam, phaseId: phaseIdParam } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const projectId = projectIdProp || projectIdParam;
  const phaseId = phaseIdProp || phaseIdParam;

  const { data: project } = useProjectById(projectId);
  const [filterLogicIds, setFilterLogicIds] = useState<string[]>([]);
  const { data: formResults, isLoading: isLoadingResults } = useFormResults({
    phaseId,
    filterLogicIds,
  });

  const results = useMemo(
    () => formResults?.data.attributes.results ?? [],
    [formResults?.data.attributes.results]
  );

  const totalSubmissions = formResults?.data.attributes.totalSubmissions ?? 0;

  const toggleLogicIds = (logicId: string) => {
    if (filterLogicIds.includes(logicId)) {
      setFilterLogicIds(filterLogicIds.filter((id) => id !== logicId));
    } else {
      setFilterLogicIds([...filterLogicIds, logicId]);
    }
  };

  const logicConfig: LogicConfig = {
    toggleLogicIds,
    filterLogicIds,
    isLoading: isLoadingResults,
  };

  const isReady = !!formResults && !!project;

  return {
    results,
    totalSubmissions,
    logicConfig,
    isReady,
  };
};

export default useSurveyResultsData;
