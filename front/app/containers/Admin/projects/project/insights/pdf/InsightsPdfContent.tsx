import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';

import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';

import { FormattedMessage } from 'utils/cl-intl';

import DemographicsSection from '../demographics/DemographicsSection';
import messages from '../messages';
import MethodSpecificInsights from '../methodSpecific/MethodSpecificInsights';
import ParticipantsTimeline from '../ParticipantsTimeline';
import ParticipationMetrics from '../participationMetrics/ParticipationMetrics';

interface Props {
  phase: IPhaseData;
}

/**
 * PDF-specific layout for Insights content.
 * Rendered in a hidden offscreen container during PDF export.
 * Components receive isPdfExport=true to render PDF-optimized layouts.
 */
const InsightsPdfContent = ({ phase }: Props) => {
  const phaseName = Object.values(phase.attributes.title_multiloc)[0] || '';

  return (
    <Box
      id="insights-pdf-hidden-container"
      background="white"
      display="flex"
      flexDirection="column"
    >
      {phaseName && (
        <Title variant="h1" as="h1" color="textPrimary" m="0px" mb="24px">
          {phaseName}
        </Title>
      )}
      <Title variant="h2" as="h2" color="textPrimary" m="0px">
        <FormattedMessage {...messages.insights} />
      </Title>

      <Box display="flex" flexDirection="column" gap="16px" pt="16px">
        <PageBreakBox>
          <ParticipationMetrics phase={phase} />
        </PageBreakBox>

        <PageBreakBox>
          <ParticipantsTimeline phaseId={phase.id} />
        </PageBreakBox>

        <DemographicsSection phase={phase} />

        <PageBreakBox>
          <MethodSpecificInsights
            phaseId={phase.id}
            participationMethod={phase.attributes.participation_method}
          />
        </PageBreakBox>
      </Box>
    </Box>
  );
};

export default InsightsPdfContent;
