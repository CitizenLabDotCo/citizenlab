import React from 'react';

import CommonGroundResults from 'containers/ProjectsShowPage/timeline/CommonGround/CommonGroundResults';

import { MethodSpecificInsightProps } from '../types';

const CommonGroundInsights = ({ phaseId }: MethodSpecificInsightProps) => {
  return <CommonGroundResults phaseId={phaseId} />;
};

export default CommonGroundInsights;
