import React, { useEffect, useRef } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useQueryClient } from '@tanstack/react-query';

import useCancelReportGeneration from 'api/report_generation/useCancelReportGeneration';
import useGenerateReport from 'api/report_generation/useGenerateReport';
import useReportGenerationJob from 'api/report_generation/useReportGenerationJob';
import {
  isReportGenerationInProgress,
  reportGenerationFailed,
} from 'api/report_generation/util';
import reportLayoutKeys from 'api/report_layout/keys';
import useReportLayout from 'api/report_layout/useReportLayout';
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
  const queryClient = useQueryClient();
  const { mutate: addReport, isPending: creating } = useAddReport();
  const { mutate: generateReport, isPending: starting } = useGenerateReport();
  const { mutate: cancelGeneration, isPending: stopping } =
    useCancelReportGeneration();
  const { data: jobs } = useReportGenerationJob(
    { type: 'Project', id: projectId },
    { enabled: llmReportingEnabled }
  );
  const { data: layout, isLoading: loadingLayout } = useReportLayout(
    llmReportingEnabled ? reportId : undefined
  );

  const job = jobs?.data[0];
  const running = isReportGenerationInProgress(job);
  const failed = reportGenerationFailed(job);

  // The run writes the layout on the server, which no query here can notice, and
  // layouts are cached indefinitely. Without this the button keeps reading the empty
  // copy it fetched before the run and goes on offering to generate a finished report.
  const wasRunning = useRef(false);
  useEffect(() => {
    if (wasRunning.current && !running) {
      queryClient.invalidateQueries({
        queryKey: reportLayoutKeys.item({ id: reportId }),
      });
    }
    wasRunning.current = running;
  }, [running, reportId, queryClient]);

  if (!llmReportingEnabled) return null;

  // A report row exists from the moment someone asks for one, and is left empty if
  // the run failed or never ran — so what decides the button is whether the report
  // has content, not whether it exists.
  const hasContent =
    Object.keys(layout?.data.attributes.craftjs_json ?? {}).length > 0;

  const generate = (id: string) =>
    generateReport({
      reportId: id,
      context: { type: 'Project', id: projectId },
    });

  // Wait for the layout before deciding: until it is read there is no telling
  // whether this report has content, and guessing wrong offers to overwrite a
  // finished one.
  const settled = !running && !loadingLayout;

  if (settled && reportId && hasContent && !failed) {
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

  // One button throughout: starting a run, waiting for it and reading the layout all
  // keep its shape and label, and only the spinner inside it changes.
  const busy = running || creating || starting || loadingLayout;

  return (
    <Box display="flex" alignItems="center" gap="4px">
      <ButtonWithLink
        buttonStyle="secondary-outlined"
        icon="stars"
        size="s"
        padding="4px 8px"
        processing={busy}
        disabled={busy}
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
        {formatMessage(label({ busy: running, failed, reportId, hasContent }))}
      </ButtonWithLink>
      {/* The run keeps going until the loop reads the flag between rounds, so the
          button stays while the tracker still says running. */}
      {running && reportId && (
        <ButtonWithLink
          buttonStyle="text"
          size="s"
          padding="4px 8px"
          processing={stopping}
          disabled={stopping}
          onClick={() => cancelGeneration({ reportId })}
        >
          {formatMessage(messages.stopGenerating)}
        </ButtonWithLink>
      )}
    </Box>
  );
};

const label = ({
  busy,
  failed,
  reportId,
  hasContent,
}: {
  busy: boolean;
  failed: boolean;
  reportId?: string;
  hasContent: boolean;
}) => {
  if (busy) return messages.generatingReport;
  // Retrying is only on offer when there is something to retry: a run that failed,
  // or a report left empty by one that did.
  if (failed || (reportId && !hasContent)) return messages.retryReport;
  return messages.generateReport;
};

export default GenerateReportButton;
