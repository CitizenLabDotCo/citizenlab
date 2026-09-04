import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useFeatureFlag from 'hooks/useFeatureFlag';

import SpotlightSurveys from '../../projectPage/SpotlightSurveys';
import TimelinePhases from '../../projectPage/TimelinePhases';

const Sections = styled(Box)`
  & > div:first-child {
    border-top: none;
  }
`;

interface Props {
  projectId: string;
}

const ProjectLeftPanel = ({ projectId }: Props) => {
  const spotlightSurveysEnabled = useFeatureFlag({
    name: 'parallel_participation',
  });

  return (
    <Sections>
      <TimelinePhases projectId={projectId} />
      {spotlightSurveysEnabled && <SpotlightSurveys projectId={projectId} />}
    </Sections>
  );
};

export default ProjectLeftPanel;
