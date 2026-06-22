import React, { useMemo, useState } from 'react';

import {
  Box,
  Text,
  Button,
  CheckboxWithLabel,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { snakeCase } from 'lodash-es';
import { FormProvider } from 'react-hook-form';

import usePhase from 'api/phases/usePhase';
import useSurveyResponseFields from 'api/survey_response_fields/useSurveyResponseFields';
import { generateSurveyResponsesPdf } from 'api/survey_responses_pdf/generateSurveyResponsesPdf';

import useLocalize from 'hooks/useLocalize';

import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import CoverPageSettings from './components/CoverPageSettings';
import FieldRedactionList from './components/FieldRedactionList';
import SectionLabel from './components/SectionLabel';
import CoverPreview from './CoverPreview';
import messages from './messages';
import { RedactionField } from './types';
import useCoverForm from './useCoverForm';

type Props = {
  projectId: string;
  phaseId: string;
  opened: boolean;
  onClose: () => void;
};

const SurveyPdfExportModal = ({
  projectId,
  phaseId,
  opened,
  onClose,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const { data: phase } = usePhase(phaseId);
  const { data: surveyFields } = useSurveyResponseFields({ phaseId });

  const { methods, cover } = useCoverForm({ phaseId, projectId });

  const [redactOverrides, setRedactOverrides] = useState<
    Record<string, boolean>
  >({});

  // Personal-data fields are flagged for redaction by default.
  const fields: RedactionField[] = useMemo(
    () =>
      (surveyFields?.data ?? []).map((field) => ({
        key: field.id,
        label: localize(field.attributes.title_multiloc),
        redact: redactOverrides[field.id] ?? field.attributes.personal_data,
      })),
    [surveyFields, localize, redactOverrides]
  );

  const toggleField = (key: string) => {
    const current = fields.find((field) => field.key === key)?.redact ?? false;
    setRedactOverrides((prev) => ({ ...prev, [key]: !current }));
  };

  const [consent, setConsent] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(false);
    try {
      const redactedFieldKeys = fields
        .filter((field) => field.redact)
        .map((field) => field.key);
      const phaseTitle = phase
        ? localize(phase.data.attributes.title_multiloc)
        : '';
      await generateSurveyResponsesPdf({
        phaseId,
        cover,
        redactedFieldKeys,
        fileName: `${
          snakeCase(`survey responses ${phaseTitle}`) || 'survey_responses'
        }.pdf`,
      });
      onClose();
    } catch {
      setError(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      opened={opened}
      close={onClose}
      width={1100}
      header={<FormattedMessage {...messages.pageTitle} />}
      footer={
        <Box display="flex" justifyContent="flex-end" gap="8px" w="100%">
          <Button buttonStyle="secondary-outlined" onClick={onClose}>
            <FormattedMessage {...messages.cancelButton} />
          </Button>
          <Button
            buttonStyle="admin-dark"
            icon="download"
            onClick={handleGenerate}
            processing={isGenerating}
            disabled={!consent || isGenerating}
          >
            <FormattedMessage {...messages.generateButton} />
          </Button>
        </Box>
      }
    >
      <FormProvider {...methods}>
        <Box display="flex" gap="32px" p="24px" h="70vh">
          {/* Left: settings + questions + consent (scrolls) */}
          <Box flex="1 1 0" minWidth="0" h="100%" overflowY="auto" pr="8px">
            <CoverPageSettings />

            <FieldRedactionList fields={fields} onToggleField={toggleField} />

            <CheckboxWithLabel
              checked={consent}
              onChange={() => setConsent((prev) => !prev)}
              label={
                <Text m="0px" fontSize="s" color="textSecondary">
                  {formatMessage(messages.consentLabel)}
                </Text>
              }
            />

            {error && (
              <Text color="red600" mt="12px" mb="0px" fontSize="s">
                <FormattedMessage {...messages.exportError} />
              </Text>
            )}
          </Box>

          {/* Right: live cover preview */}
          <Box
            flex="1 1 0"
            minWidth="0"
            h="100%"
            display="flex"
            flexDirection="column"
            gap="8px"
          >
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
          </Box>
        </Box>
      </FormProvider>
    </Modal>
  );
};

export default SurveyPdfExportModal;
