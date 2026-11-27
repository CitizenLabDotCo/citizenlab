import React from 'react';

import DashboardCard from 'design-system/DashboardCard';
import EmptyState from 'design-system/EmptyState';

import { IPhaseData } from 'api/phases/types';
import { exportSurveyResults } from 'api/survey_results/utils';

import projectMessages from 'containers/Admin/projects/project/messages';
import surveyTracks from 'containers/Admin/projects/project/surveyResults/tracks';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import ExportMenuAction from './ExportMenuAction';
import styles from './Insights.module.css';
import messages from './messages';
import RecommendedActions from './RecommendedActions';
import 'design-system/tokens.css';

interface Props {
  phase: IPhaseData;
}

// An external survey's answers stay with its provider: the platform can only
// export them, so there is no dashboard to draw.
const ExternalSurveyInsights = ({ phase }: Props) => {
  const { formatMessage } = useIntl();

  const exportResponses = async () => {
    trackEventByName(surveyTracks.clickExportSurvey, { phaseId: phase.id });
    await exportSurveyResults({ phaseId: phase.id });
  };

  return (
    <div className={styles.panelRegion} role="region" aria-label="Phase Insights">
      <div className={styles.panelLayout}>
        <div className={styles.sideColumn}>
          <RecommendedActions phase={phase}>
            <ExportMenuAction
              items={[
                {
                  label: formatMessage(projectMessages.exportSurveyResults),
                  onExport: exportResponses,
                },
              ]}
            />
          </RecommendedActions>
        </div>
        <div className={styles.dashboardPanel}>
          <DashboardCard title={formatMessage(messages.responses)}>
            <EmptyState context="card">
              {formatMessage(messages.externalSurveyResponses)}
            </EmptyState>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default ExternalSurveyInsights;
