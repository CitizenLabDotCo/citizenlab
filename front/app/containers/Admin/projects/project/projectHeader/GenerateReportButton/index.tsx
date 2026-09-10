import React from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';

import useGenerateReport from 'api/report_generation/useGenerateReport';
import useReportGenerationJob from 'api/report_generation/useReportGenerationJob';
import {
  isReportGenerationInProgress,
  reportGenerationFailed,
} from 'api/report_generation/util';
import useAddReport from 'api/reports/useAddReport';

import useFeatureFlag from 'hooks/useFeatureFlag';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  projectId: string;
  reportId?: string;
}

// One button for the whole life of a project's report: it writes the report the
// first time, shows the run while it lasts, and afterwards opens what it wrote.
const GenerateReportButton = ({ projectId, reportId }: Props) => {
  const llmReportingEnabled = useFeatureFlag({ name: 'llm_reporting' });
  const { formatMessage } = useIntl();
  const { mutate: addReport, isPending: creating } = useAddReport();
  const { mutate: generateReport, isPending: starting } = useGenerateReport();
  const { data: jobs } = useReportGenerationJob(
    { type: 'Project', id: projectId },
    { enabled: llmReportingEnabled }
  );

  if (!llmReportingEnabled) return null;

  const job = jobs?.data[0];
  const running = isReportGenerationInProgress(job);
  const failed = reportGenerationFailed(job);

  if (running) {
    return (
      <ButtonWithLink
        buttonStyle="secondary-outlined"
        size="s"
        padding="4px 8px"
        disabled
      >
        <Spinner size="16px" />
      </ButtonWithLink>
    );
  }

  // The report exists and nothing is running: the button's job now is to open it.
  if (reportId && !failed) {
    return (
      <ButtonWithLink
        to="/admin/reporting/report-builder/$reportId/editor"
        params={{ reportId }}
        buttonStyle="secondary-outlined"
        icon="stars"
        size="s"
        padding="4px 8px"
      >
        {formatMessage(messages.openReport)}
      </ButtonWithLink>
    );
  }

  const generate = (id: string) =>
    generateReport({
      reportId: id,
      context: { type: 'Project', id: projectId },
    });

  return (
    <ButtonWithLink
      buttonStyle="secondary-outlined"
      icon="stars"
      size="s"
      padding="4px 8px"
      processing={creating || starting}
      onClick={() => {
        if (reportId) {
          generate(reportId);
          return;
        }

        addReport(
          { project_id: projectId },
          { onSuccess: (report) => generate(report.data.id) }
        );
      }}
    >
      {formatMessage(failed ? messages.retryReport : messages.generateReport)}
    </ButtonWithLink>
  );
};

export default GenerateReportButton;
