import React from 'react';

import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';
import { snakeCase } from 'lodash-es';
import { FormProvider } from 'react-hook-form';

import { generateInputResponsesPdf } from 'api/input_responses_pdf/generateInputResponsesPdf';
import usePhase from 'api/phases/usePhase';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage } from 'utils/cl-intl';

import CoverPageSettings from './components/CoverPageSettings';
import SectionLabel from './components/SectionLabel';
import CoverPreview from './CoverPreview';
import messages from './messages';
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
const InputPdfExportModal = ({
  projectId,
  phaseId,
  opened,
  onClose,
}: Props) => {
  const localize = useLocalize();
  const { data: phase } = usePhase(phaseId);
  const { methods, cover } = useCoverForm({ phaseId, projectId });

  const handleGenerate = async ({
    redactedFieldKeys,
  }: {
    redactedFieldKeys: string[];
  }) => {
    const phaseTitle = phase
      ? localize(phase.data.attributes.title_multiloc)
      : '';
    await generateInputResponsesPdf({
      phaseId,
      cover,
      redactedFieldKeys,
      fileName: `${
        snakeCase(`input responses ${phaseTitle}`) || 'input_responses'
      }.pdf`,
    });
  };

  return (
    <FormProvider {...methods}>
      <ResponseExportModal
        phaseId={phaseId}
        opened={opened}
        onClose={onClose}
        title={<FormattedMessage {...messages.pdfPageTitle} />}
        onGenerate={handleGenerate}
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
