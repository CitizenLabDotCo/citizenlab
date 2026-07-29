import React, { useEffect, useRef, useState } from 'react';

import {
  Box,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { snakeCase } from 'lodash-es';
import { FormProvider } from 'react-hook-form';

import useGenerateInputResponsesPdf from 'api/input_responses_pdf/useGenerateInputResponsesPdf';
import useInputResponsesPdfJob from 'api/input_responses_pdf/useInputResponsesPdfJob';
import {
  downloadInputResponsesPdfResult,
  isExportInProgressError,
  isPdfExportInProgress,
} from 'api/input_responses_pdf/util';
import useAuthUser from 'api/me/useAuthUser';
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
  const { data: authUser } = useAuthUser();
  const { data: phase } = usePhase(phaseId);
  const { methods, cover } = useCoverForm({ phaseId, projectId });
  const { mutateAsync: generatePdf } = useGenerateInputResponsesPdf();
  const { data: jobs } = useInputResponsesPdfJob(phaseId);

  // Job whose completion triggers the download; picked up from the polled
  // jobs query (fetcher does not parse the generate response's 202 body).
  const [trackedJobId, setTrackedJobId] = useState<string | null>(null);
  const [jobFailed, setJobFailed] = useState(false);
  // Newest job id at Generate-click time: the started job is adopted as the
  // first different id, even if it is first observed already completed.
  const awaitingJobRef = useRef<{ prevJobId: string | null } | null>(null);

  const latestJob = jobs?.data[0];
  const jobInProgress = isPdfExportInProgress(latestJob);

  const phaseTitle = phase
    ? localize(phase.data.attributes.title_multiloc)
    : '';
  const fileName = `${
    snakeCase(`input responses ${phaseTitle}`) || 'input_responses'
  }.pdf`;

  // Track the job started from this modal, or resume one found running
  // (e.g. after reopening the modal mid-export).
  useEffect(() => {
    if (!latestJob) return;

    const awaiting = awaitingJobRef.current;
    if (awaiting) {
      if (latestJob.id !== awaiting.prevJobId) {
        awaitingJobRef.current = null;
        setTrackedJobId(latestJob.id);
      }
      return;
    }

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

    // Only the admin who started the export (and reviewed/consented) may
    // download it; the backend enforces this too.
    const ownerId = latestJob.relationships.owner.data?.id;
    if (!authUser || ownerId !== authUser.data.id) return;

    downloadInputResponsesPdfResult({ phaseId, jobId: latestJob.id, fileName })
      .then(onClose)
      .catch(() => setJobFailed(true));
  }, [trackedJobId, latestJob, phaseId, fileName, onClose, authUser]);

  const handleGenerate = async ({
    redactedFieldKeys,
  }: {
    redactedFieldKeys: string[];
  }) => {
    setJobFailed(false);
    awaitingJobRef.current = { prevJobId: latestJob?.id ?? null };
    try {
      await generatePdf({ phaseId, cover, redactedFieldKeys });
    } catch (error) {
      awaitingJobRef.current = null;
      // An export is already running; the invalidated poll surfaces it instead.
      if (!isExportInProgressError(error)) throw error;
    }
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
