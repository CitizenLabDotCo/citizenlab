import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  Box,
  Text,
  Button,
  Badge,
  CheckboxWithLabel,
  Toggle as PlainToggle,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { snakeCase } from 'lodash-es';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import useAuthUser from 'api/me/useAuthUser';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';
import useSubmissionCount from 'api/submission_count/useSubmissionCount';
import useSurveyResponseFields from 'api/survey_response_fields/useSurveyResponseFields';
import {
  generateSurveyResponsesPdf,
  SurveyPdfCover,
} from 'api/survey_responses_pdf/generateSurveyResponsesPdf';

import useLocalize from 'hooks/useLocalize';

import Input from 'components/HookForm/Input';
import Toggle from 'components/HookForm/Toggle';
import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import CoverPreview from './CoverPreview';
import messages from './messages';

type Props = {
  projectId: string;
  phaseId: string;
  opened: boolean;
  onClose: () => void;
};

type ReviewField = { key: string; label: string; redact: boolean };

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Text
    fontSize="s"
    fontWeight="bold"
    color="textSecondary"
    m="0px"
    style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
  >
    {children}
  </Text>
);

const SurveyPdfExportModal = ({
  projectId,
  phaseId,
  opened,
  onClose,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const { data: phase } = usePhase(phaseId);
  const { data: project } = useProjectById(projectId);
  const { data: authUser } = useAuthUser();
  const { data: surveyFields } = useSurveyResponseFields({ phaseId });
  const { data: submissionCount } = useSubmissionCount({ phaseId });

  const responseCount = submissionCount?.data.attributes.totalSubmissions ?? 0;

  // The exact fields the backend will export, registration/personal-data ones
  // pre-flagged for redaction.
  const detectedFields: ReviewField[] = useMemo(
    () =>
      (surveyFields?.data ?? []).map((field) => ({
        key: field.id,
        label: localize(field.attributes.title_multiloc),
        redact: field.attributes.personal_data,
      })),
    [surveyFields, localize]
  );

  // Working copy of the redaction state, initialized once the fields load.
  const [fields, setFields] = useState<ReviewField[]>([]);
  const fieldsInitialized = useRef(false);
  useEffect(() => {
    if (surveyFields && !fieldsInitialized.current) {
      fieldsInitialized.current = true;
      setFields(detectedFields);
    }
  }, [surveyFields, detectedFields]);

  const toggleField = (key: string) =>
    setFields((prev) =>
      prev.map((field) =>
        field.key === key ? { ...field, redact: !field.redact } : field
      )
    );

  const flaggedCount = fields.filter((field) => field.redact).length;

  // Cover page form, prefilled once from the phase/project/current user.
  const methods = useForm<SurveyPdfCover>({
    defaultValues: {
      include: true,
      title: '',
      subtitle: '',
      date: '',
      preparedBy: '',
      notes: '',
    },
  });
  const { control, reset, getValues } = methods;

  const coverInitialized = useRef(false);
  useEffect(() => {
    if (phase && project && authUser && !coverInitialized.current) {
      coverInitialized.current = true;
      reset({
        include: true,
        title: localize(phase.data.attributes.title_multiloc),
        subtitle: localize(project.data.attributes.title_multiloc),
        date: new Date().toLocaleDateString(),
        preparedBy: getFullName(authUser.data) || '',
        notes: '',
      });
    }
  }, [phase, project, authUser, localize, reset]);

  // Live cover values driving the preview (stable object — only changes on edit).
  const include = useWatch({ control, name: 'include' });
  const title = useWatch({ control, name: 'title' });
  const subtitle = useWatch({ control, name: 'subtitle' });
  const date = useWatch({ control, name: 'date' });
  const preparedBy = useWatch({ control, name: 'preparedBy' });
  const notes = useWatch({ control, name: 'notes' });
  const cover = useMemo<SurveyPdfCover>(
    () => ({ include, title, subtitle, date, preparedBy, notes }),
    [include, title, subtitle, date, preparedBy, notes]
  );

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
        cover: getValues(),
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
          {/* Left: cover settings + registration questions + consent (scrolls) */}
          <Box flex="1 1 0" minWidth="0" h="100%" overflowY="auto" pr="8px">
            {/* Cover page settings */}
            <Box mb="8px">
              <SectionLabel>
                <FormattedMessage {...messages.coverSectionTitle} />
              </SectionLabel>
            </Box>
            <Text color="textSecondary" mt="0px" mb="20px">
              <FormattedMessage
                {...messages.responsesFound}
                values={{ count: responseCount }}
              />
            </Text>
            <Box mb="24px">
              <Box mb="16px">
                <Toggle
                  name="include"
                  label={formatMessage(messages.includeCoverLabel)}
                />
              </Box>
              {include && (
                <Box display="flex" flexDirection="column" gap="12px">
                  <Input
                    type="text"
                    name="title"
                    label={formatMessage(messages.reportTitleLabel)}
                  />
                  <Input
                    type="text"
                    name="subtitle"
                    label={formatMessage(messages.reportSubtitleLabel)}
                  />
                  <Box display="flex" gap="12px">
                    <Box flex="1">
                      <Input
                        type="text"
                        name="date"
                        label={formatMessage(messages.dateLabel)}
                      />
                    </Box>
                    <Box flex="1">
                      <Input
                        type="text"
                        name="preparedBy"
                        label={formatMessage(messages.preparedByLabel)}
                      />
                    </Box>
                  </Box>
                  <Input
                    type="text"
                    name="notes"
                    label={formatMessage(messages.notesLabel)}
                  />
                </Box>
              )}
            </Box>

            {/* Registration / survey questions to include or redact */}
            <Box mb="4px">
              <SectionLabel>
                <FormattedMessage {...messages.fieldReviewSectionTitle} />
              </SectionLabel>
            </Box>
            <Text color="textSecondary" mt="0px" mb="12px">
              {flaggedCount > 0 ? (
                <FormattedMessage
                  {...messages.fieldReviewWithFlags}
                  values={{ flaggedCount }}
                />
              ) : (
                <FormattedMessage {...messages.fieldReviewNoFlags} />
              )}
            </Text>

            <Box display="flex" flexDirection="column" mb="24px">
              {fields.map((field) => (
                <Box
                  key={field.key}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  gap="12px"
                  py="8px"
                  borderTop={`1px solid ${colors.borderLight}`}
                >
                  <Box display="flex" alignItems="center" gap="10px">
                    <PlainToggle
                      checked={!field.redact}
                      onChange={() => toggleField(field.key)}
                    />
                    <Text m="0px" color="textSecondary">
                      {field.label}
                    </Text>
                  </Box>
                  <Badge
                    color={field.redact ? colors.red600 : colors.success}
                    className="inverse"
                  >
                    {field.redact
                      ? formatMessage(messages.excludeStatus)
                      : formatMessage(messages.includeStatus)}
                  </Badge>
                </Box>
              ))}
            </Box>

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

          {/* Right: live cover preview (fits the available height, never scrolls) */}
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
