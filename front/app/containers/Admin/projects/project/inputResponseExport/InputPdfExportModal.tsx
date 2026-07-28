import React, { useEffect, useState } from 'react';

import {
  Box,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { snakeCase } from 'lodash-es';
import { FormProvider } from 'react-hook-form';

import { downloadInputResponsesPdfResult } from 'api/input_responses_pdf/generateInputResponsesPdf';
import useGenerateInputResponsesPdf from 'api/input_responses_pdf/useGenerateInputResponsesPdf';
import useInputResponsesPdfJob from 'api/input_responses_pdf/useInputResponsesPdfJob';
import usePhase from 'api/phases/usePhase';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage } from 'utils/cl-intl';

import CoverPageSettings from './components/CoverPageSettings';
import SectionLabel from './components/SectionLabel';
import CoverPreview from './CoverPreview';
import messages from './messages';
import PdfExportStatus from './PdfExportStatus';
import ResponseExportModal from './ResponseExportModal';
import useCoverForm from './useCoverForm';

type Props = {
  projectId: string;
  phaseId: string;
  opened: boolean;
  onClose: () => void;
};

// PDF flavour of the responses export: the shared shell plus the cover page
// settings and live preview.
//
// Unlike the xlsx export, the PDF is rendered by a background job (it takes
// minutes for large phases). Generating starts the job; this modal then drives
// its state off the polled job tracker — so reopening the modal picks an
// ongoing export back up — and downloads the PDF when the job completes.
const InputPdfExportModal = ({
  projectId,
  phaseId,
  opened,
  onClose,
}: Props) => {
  const localize = useLocalize();
  const { data: phase } = usePhase(phaseId);
  const { methods, cover } = useCoverForm({ phaseId, projectId });
  const { mutateAsync: generatePdf } = useGenerateInputResponsesPdf();
  const { data: jobs } = useInputResponsesPdfJob(phaseId);

  // The id of the job whose completion should trigger the download. Always
  // picked up from the polled jobs query (never from the generate response —
  // fetcher does not parse 202 bodies), which also covers resuming an export
  // found on (re)open.
  const [trackedJobId, setTrackedJobId] = useState<string | null>(null);
  const [jobFailed, setJobFailed] = useState(false);

  const latestJob = jobs?.data[0];
  const jobInProgress =
    !!latestJob && latestJob.attributes.completed_at === null;

  const phaseTitle = phase
    ? localize(phase.data.attributes.title_multiloc)
    : '';
  const fileName = `${
    snakeCase(`input responses ${phaseTitle}`) || 'input_responses'
  }.pdf`;

  // Resume tracking an export that is already running (e.g. the modal was
  // closed and reopened mid-export, or another admin started one).
  useEffect(() => {
    if (jobInProgress) {
      setTrackedJobId(latestJob.id);
    }
  }, [jobInProgress, latestJob]);

  // When the tracked job completes, download the result — or surface the
  // failure (the tracker exposes the job errors).
  useEffect(() => {
    if (!trackedJobId || latestJob?.id !== trackedJobId) return;
    if (latestJob.attributes.completed_at === null) return;

    setTrackedJobId(null);

    const failed =
      latestJob.attributes.error_count > 0 ||
      latestJob.attributes.errors.length > 0;
    if (failed) {
      setJobFailed(true);
      return;
    }

    downloadInputResponsesPdfResult({ phaseId, fileName })
      .then(onClose)
      .catch(() => setJobFailed(true));
  }, [trackedJobId, latestJob, phaseId, fileName, onClose]);

  const handleGenerate = async ({
    redactedFieldKeys,
  }: {
    redactedFieldKeys: string[];
  }) => {
    setJobFailed(false);
    await generatePdf({ phaseId, cover, redactedFieldKeys });
  };

  return (
    <FormProvider {...methods}>
      <ResponseExportModal
        phaseId={phaseId}
        opened={opened}
        onClose={onClose}
        title={<FormattedMessage {...messages.pdfPageTitle} />}
        onGenerate={handleGenerate}
        closeOnGenerate={false}
        generateDisabled={jobInProgress}
        statusSlot={
          jobInProgress ? (
            <PdfExportStatus job={latestJob} />
          ) : jobFailed ? (
            <Text color="red600" mt="0px" mb="8px" fontSize="s">
              <FormattedMessage {...messages.exportError} />
            </Text>
          ) : null
        }
        settingsSlot={<CoverPageSettings />}
        previewSlot={
          <>
            <SectionLabel>
              <FormattedMessage {...messages.previewLabel} />
            </SectionLabel>
            <Box
              flex="1 1 0"
              minHeight="0"
              display="flex"
              justifyContent="center"
            >
              <Box
                border={`1px solid ${colors.borderLight}`}
                borderRadius={stylingConsts.borderRadius}
                overflow="hidden"
                h="100%"
                style={{ aspectRatio: '210 / 297', maxWidth: '100%' }}
              >
                <CoverPreview cover={cover} phaseId={phaseId} />
              </Box>
            </Box>
          </>
        }
      />
    </FormProvider>
  );
};

export default InputPdfExportModal;
