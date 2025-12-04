import React from 'react';

import { ParticipationMethod } from 'api/phases/types';

import { methodSpecificInsightsRegistry } from './registry';

interface Props {
  phaseId: string;
  participationMethod: ParticipationMethod;
}

/**
 * Wrapper component that renders method-specific insights based on participation method
 * Returns null if no component is registered for the given method
 */
const MethodSpecificInsights = ({ phaseId, participationMethod }: Props) => {
  const InsightComponent = methodSpecificInsightsRegistry[participationMethod];

  if (!InsightComponent) {
    return null;
  }

  return <InsightComponent phaseId={phaseId} />;
};

export default MethodSpecificInsights;
