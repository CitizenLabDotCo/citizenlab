import React, { useMemo, useRef, useState, useEffect } from 'react';

import {
  Box,
  Title,
  Text,
  Input,
  Toggle,
  Button,
  Spinner,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

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

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';
import { getFullName } from 'utils/textUtils';

import CoverPreview from './CoverPreview';
import messages from './messages';
import ReviewFieldsModal, { PiiField } from './ReviewFieldsModal';

const sanitizeFilename = (name: string) =>
  `${
    name
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase() || 'survey-responses'
  }.pdf`;

const AdminPhaseSurveyPdfExport = () => {
  const { projectId, phaseId } = useParams({ strict: false }) as {
    projectId: string;
    phaseId: string;
  };
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const { data: phase } = usePhase(phaseId);
  const { data: project } = useProjectById(projectId);
  const { data: authUser } = useAuthUser();
  const { data: surveyFields } = useSurveyResponseFields({ phaseId });
  const { data: submissionCount } = useSubmissionCount({ phaseId });

  const responseCount = submissionCount?.data.attributes.totalSubmissions ?? 0;

  // The exact fields the backend will export, in order; registration/personal-
  // data fields are pre-flagged for redaction.
  const detectedFields: PiiField[] = useMemo(
    () =>
      (surveyFields?.data ?? []).map((field) => ({
        key: field.id,
        label: localize(field.attributes.title_multiloc),
        redact: field.attributes.personal_data,
      })),
    [surveyFields, localize]
  );

  // Cover page state, prefilled once from the phase/project/current user.
  const [cover, setCover] = useState<SurveyPdfCover>({
    include: true,
    title: '',
    subtitle: '',
    date: '',
    preparedBy: '',
    notes: '',
  });
  const coverInitialized = useRef(false);
  useEffect(() => {
    if (phase && project && authUser && !coverInitialized.current) {
      coverInitialized.current = true;
      setCover((prev) => ({
        ...prev,
        title: localize(phase.data.attributes.title_multiloc),
        subtitle: localize(project.data.attributes.title_multiloc),
        date: new Date().toLocaleDateString(),
        // Defaults to the current user; they can edit or clear it.
        preparedBy: getFullName(authUser.data) || '',
      }));
    }
  }, [phase, project, authUser, localize]);

  const updateCover = (key: keyof SurveyPdfCover, value: string) =>
    setCover((prev) => ({ ...prev, [key]: value }));

  const [modalOpen, setModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(false);

  const handleGenerate = async (redactedKeys: Set<string>) => {
    setIsGenerating(true);
    setError(false);
    try {
      const phaseTitle = phase
        ? localize(phase.data.attributes.title_multiloc)
        : '';
      await generateSurveyResponsesPdf({
        phaseId,
        cover,
        redactedFieldKeys: Array.from(redactedKeys),
        fileName: sanitizeFilename(`survey-responses-${phaseTitle}`),
      });
      setModalOpen(false);
    } catch {
      setError(true);
    } finally {
      setIsGenerating(false);
    }
  };

  if (phase && phase.data.attributes.participation_method !== 'native_survey') {
    return null;
  }

  const isLoading = !phase || !surveyFields || !submissionCount;

  return (
    <Box maxWidth="1200px">
      <Title variant="h2" as="h1" color="textPrimary" m="0px">
        <FormattedMessage {...messages.pageTitle} />
      </Title>
      <Text fontSize="s" color="textSecondary" mt="4px" mb="24px">
        <FormattedMessage {...messages.pageSubtitle} />
      </Text>

      {isLoading ? (
        <Box display="flex" justifyContent="center" py="40px">
          <Spinner />
        </Box>
      ) : responseCount === 0 ? (
        <Text color="textSecondary">
          <FormattedMessage {...messages.noResponses} />
        </Text>
      ) : (
        <Box display="flex" gap="32px" alignItems="flex-start">
          {/* Left: cover settings + export */}
          <Box flex="1 1 0" minWidth="0" maxWidth="560px">
            <Text color="textSecondary" mb="24px">
              <FormattedMessage
                {...messages.responsesFound}
                values={{ count: responseCount }}
              />
            </Text>

            <Box
              border={`1px solid ${colors.borderLight}`}
              borderRadius={stylingConsts.borderRadius}
              p="20px"
              mb="24px"
            >
              <Box mb="16px">
                <Toggle
                  checked={cover.include}
                  label={formatMessage(messages.includeCoverLabel)}
                  onChange={() =>
                    setCover((prev) => ({ ...prev, include: !prev.include }))
                  }
                />
              </Box>
              {cover.include && (
                <Box display="flex" flexDirection="column" gap="12px">
                  <Input
                    type="text"
                    label={formatMessage(messages.reportTitleLabel)}
                    value={cover.title}
                    onChange={(value) => updateCover('title', value)}
                  />
                  <Input
                    type="text"
                    label={formatMessage(messages.reportSubtitleLabel)}
                    value={cover.subtitle}
                    onChange={(value) => updateCover('subtitle', value)}
                  />
                  <Box display="flex" gap="12px">
                    <Box flex="1">
                      <Input
                        type="text"
                        label={formatMessage(messages.dateLabel)}
                        value={cover.date}
                        onChange={(value) => updateCover('date', value)}
                      />
                    </Box>
                    <Box flex="1">
                      <Input
                        type="text"
                        label={formatMessage(messages.preparedByLabel)}
                        value={cover.preparedBy}
                        onChange={(value) => updateCover('preparedBy', value)}
                      />
                    </Box>
                  </Box>
                  <Input
                    type="text"
                    label={formatMessage(messages.notesLabel)}
                    value={cover.notes}
                    onChange={(value) => updateCover('notes', value)}
                  />
                </Box>
              )}
            </Box>

            <Button
              buttonStyle="admin-dark"
              icon="download"
              onClick={() => {
                setError(false);
                setModalOpen(true);
              }}
            >
              <FormattedMessage {...messages.exportButton} />
            </Button>
          </Box>

          {/* Right: live cover preview (no response data) */}
          <Box
            flex="1 1 0"
            minWidth="0"
            position="sticky"
            top="16px"
            display="flex"
            flexDirection="column"
            gap="8px"
          >
            <Text
              fontSize="s"
              fontWeight="bold"
              color="textSecondary"
              m="0px"
              style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              <FormattedMessage {...messages.previewLabel} />
            </Text>
            <Box
              border={`1px solid ${colors.borderLight}`}
              borderRadius={stylingConsts.borderRadius}
              overflow="hidden"
              style={{ aspectRatio: '210 / 297' }}
            >
              <CoverPreview cover={cover} phaseId={phaseId} />
            </Box>
          </Box>
        </Box>
      )}

      <ReviewFieldsModal
        opened={modalOpen}
        initialFields={detectedFields}
        responseCount={responseCount}
        processing={isGenerating}
        error={error}
        onClose={() => setModalOpen(false)}
        onGenerate={handleGenerate}
      />
    </Box>
  );
};

export default AdminPhaseSurveyPdfExport;
