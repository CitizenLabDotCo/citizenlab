import React from 'react';
import usePhases from 'hooks/usePhases';
import { Box, Select } from '@citizenlab/cl2-component-library';
import { isNilOrError } from 'utils/helperUtils';
import T from 'components/T';
import useLocalize from 'hooks/useLocalize';
import styled from 'styled-components';
import { IOption } from 'typings';
import ProjectFilter from '../../../../../dashboard/components/filters/ProjectFilter';

const StyledSelect = styled(Select)<{ padding?: string }>`
  ${({ padding }) =>
    padding
      ? `
    select {
      padding: ${padding};
    }
  `
      : ''}
`;

type SurveyReportFilterProps = {
  projectId: string;
  currentPhaseFilter?: string | null;
  onPhaseFilter: (filter: IOption) => void;
  onProjectFilter: (filter: IOption) => void;
};

const SurveyReportFilter = ({
  projectId,
  currentPhaseFilter,
  onPhaseFilter,
  onProjectFilter,
}: SurveyReportFilterProps) => {
  const localize = useLocalize();

  // TODO: Only list projects that have surveys in them
  // TODO: Show dropdown only if surveys on multiple projects
  const projectFilter = (
    <Box width="100%" mb="20px">
      <ProjectFilter
        currentProjectFilter={projectId}
        width="100%"
        padding="11px"
        onProjectFilter={onProjectFilter}
      />
    </Box>
  );

  const phases = usePhases(projectId);
  if (isNilOrError(phases)) {
    return <>{projectFilter}</>;
  }

  const surveyPhases = phases.filter((phase) => {
    return phase.attributes.participation_method === 'native_survey';
  });
  const phaseOptions = surveyPhases.map((phase) => ({
    value: phase.id,
    label: localize(phase.attributes.title_multiloc),
  }));

  // 1. No phases with survey
  let phaseFilter = <></>;

  if (phaseOptions.length === 1) {
    // 2. Just one phase with a survey
    onPhaseFilter(phaseOptions[0]);
    phaseFilter = (
      <Box>
        <p>
          One survey Phase:{' '}
          <T value={surveyPhases[0].attributes.title_multiloc} />
        </p>
      </Box>
    );
  } else if (phaseOptions.length > 1) {
    // 3. Multiple phases with survey
    phaseFilter = (
      <Box width="100%" mb="20px">
        <StyledSelect
          id="phaseFilter"
          label="Survey Phases"
          onChange={onPhaseFilter}
          value={currentPhaseFilter || ''}
          options={phaseOptions}
          padding="10px"
        />
      </Box>
    );
  }

  return (
    <Box>
      {projectFilter}
      {phaseFilter}
    </Box>
  );
};

export default SurveyReportFilter;
