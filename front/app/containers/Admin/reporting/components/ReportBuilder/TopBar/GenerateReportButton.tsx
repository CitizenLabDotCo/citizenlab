import React, { useEffect, useRef, useState } from 'react';

import { Box, Spinner, Text } from '@citizenlab/cl2-component-library';
import { useEditor, SerializedNodes } from '@craftjs/core';

import useGenerateReport from 'api/report_generation/useGenerateReport';
import useReportGenerationJob from 'api/report_generation/useReportGenerationJob';
import {
  isReportGenerationInProgress,
  reportGenerationFailed,
} from 'api/report_generation/util';
import useReportLayout from 'api/report_layout/useReportLayout';

import useFeatureFlag from 'hooks/useFeatureFlag';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import GenerateReportModal from './GenerateReportModal';
import messages from './messages';

interface Props {
  reportId: string;
  phaseId: string;
  setSaved: (savedNodes: SerializedNodes) => void;
}

const GenerateReportButton = ({ reportId, phaseId, setSaved }: Props) => {
  const llmReportingEnabled = useFeatureFlag({ name: 'llm_reporting' });
  const [confirming, setConfirming] = useState(false);
  const { actions, query } = useEditor();
  const { mutate: generateReport } = useGenerateReport();
  const generationContext = { type: 'Phase', id: phaseId } as const;
  const { data: jobs } = useReportGenerationJob(generationContext, {
    enabled: llmReportingEnabled,
  });
  const { refetch: refetchLayout } = useReportLayout(reportId);

  const job = jobs?.data[0];
  const running = isReportGenerationInProgress(job);
  const failed = reportGenerationFailed(job);

  // The job writes the layout server-side, so the editor — which was filled at
  // mount — has to be told. Only a run this tab watched finish counts: an old
  // completed tracker must not overwrite what the admin is editing.
  const watchedRunRef = useRef(false);

  useEffect(() => {
    if (running) {
      watchedRunRef.current = true;
      return;
    }
    if (!watchedRunRef.current) return;
    watchedRunRef.current = false;
    if (failed) return;

    refetchLayout().then(({ data }) => {
      const craftjsJson = data?.data.attributes.craftjs_json;
      if (!craftjsJson) return;

      actions.deserialize(craftjsJson);
      setSaved(craftjsJson);
    });
  }, [running, failed, refetchLayout, actions, setSaved]);

  if (!llmReportingEnabled) return null;

  if (running) {
    return (
      <Box display="flex" alignItems="center" gap="8px">
        <Spinner size="20px" />
        <Text m="0" fontSize="s" color="textSecondary">
          <FormattedMessage {...messages.generatingReport} />
        </Text>
      </Box>
    );
  }

  return (
    <>
      <ButtonWithLink
        buttonStyle="secondary-outlined"
        icon="stars"
        size="s"
        onClick={() => setConfirming(true)}
      >
        <FormattedMessage {...messages.generateReport} />
      </ButtonWithLink>
      {failed && (
        <Text m="0" ml="8px" fontSize="s" color="error">
          <FormattedMessage {...messages.generateReportFailed} />
        </Text>
      )}
      <GenerateReportModal
        opened={confirming}
        reportIsEmpty={
          confirming && Object.keys(query.getSerializedNodes()).length <= 1
        }
        onClose={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          generateReport({ reportId, context: generationContext });
        }}
      />
    </>
  );
};

export default GenerateReportButton;
