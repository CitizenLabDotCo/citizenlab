import React from 'react';

import { snakeCase } from 'lodash-es';

import { generateInputResponsesXlsx } from 'api/input_responses_xlsx/generateInputResponsesXlsx';
import usePhase from 'api/phases/usePhase';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import ResponseExportModal from './ResponseExportModal';

type Props = {
  phaseId: string;
  opened: boolean;
  onClose: () => void;
};

// XLSX flavour of the responses export: the shared shell as-is — the full data
// dump, minus the fields the admin excludes.
const InputXlsxExportModal = ({ phaseId, opened, onClose }: Props) => {
  const localize = useLocalize();
  const { data: phase } = usePhase(phaseId);

  const handleGenerate = async ({
    redactedFieldKeys,
  }: {
    redactedFieldKeys: string[];
  }) => {
    const phaseTitle = phase
      ? localize(phase.data.attributes.title_multiloc)
      : '';
    await generateInputResponsesXlsx({
      phaseId,
      redactedFieldKeys,
      fileName: `${
        snakeCase(`input responses ${phaseTitle}`) || 'input_responses'
      }.xlsx`,
    });
  };

  return (
    <ResponseExportModal
      phaseId={phaseId}
      opened={opened}
      onClose={onClose}
      title={<FormattedMessage {...messages.xlsxPageTitle} />}
      generateLabel={<FormattedMessage {...messages.generateXlsxButton} />}
      onGenerate={handleGenerate}
    />
  );
};

export default InputXlsxExportModal;
