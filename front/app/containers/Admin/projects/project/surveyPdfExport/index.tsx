import React, { useEffect, useMemo, useRef, useState } from 'react';

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

import { IFlatCustomField } from 'api/custom_fields/types';
import useCustomFields from 'api/custom_fields/useCustomFields';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';
import { ISurveySubmissionData } from 'api/survey_submissions/types';
import useInfiniteSurveySubmissions from 'api/survey_submissions/useInfiniteSurveySubmissions';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import {
  buildSurveyResponsesPdf,
  generateSurveyResponsesPdf,
  PdfCover,
} from './generateSurveyResponsesPdf';
import messages from './messages';
import { detectPiiFields } from './piiDetection';
import ReviewFieldsModal from './ReviewFieldsModal';

// Input types that don't represent an answerable survey question and are
// skipped when collecting fields to export.
const NON_ANSWER_INPUT_TYPES: ReadonlySet<string> = new Set(['page']);

// How long to wait after the last edit before rebuilding the cover preview.
const PREVIEW_DEBOUNCE_MS = 600;

const sanitizeFilename = (name: string) =>
  name
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase() || 'survey-responses';

const AdminPhaseSurveyPdfExport = () => {
  const { projectId, phaseId } = useParams({ strict: false }) as {
    projectId: string;
    phaseId: string;
  };
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const { data: phase } = usePhase(phaseId);
  const { data: project } = useProjectById(projectId);
  const { data: customFields } = useCustomFields({ phaseId });

  const {
    data: submissionsData,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: isLoadingSubmissions,
  } = useInfiniteSurveySubmissions({ phaseId });

  // Eagerly load every page so the export contains all responses.
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const responses: ISurveySubmissionData[] = useMemo(
    () => submissionsData?.pages.flatMap((page) => page.data) ?? [],
    [submissionsData]
  );

  // The survey questions, in form order.
  const answerableFields: IFlatCustomField[] = useMemo(
    () =>
      (customFields ?? [])
        .filter(
          (field) =>
            !field.code &&
            field.enabled !== false &&
            !NON_ANSWER_INPUT_TYPES.has(field.input_type)
        )
        .sort((a, b) => a.ordering - b.ordering),
    [customFields]
  );

  // Fields flagged by name (pre-selected for redaction in the review modal).
  const detectedFields = useMemo(
    () =>
      detectPiiFields(
        answerableFields.map((field) => ({
          key: field.key,
          label: localize(field.title_multiloc),
        }))
      ),
    [answerableFields, localize]
  );

  // Cover page state, prefilled once from the phase/project.
  const [cover, setCover] = useState<PdfCover>({
    include: true,
    title: '',
    subtitle: '',
    date: '',
    preparedBy: '',
    notes: '',
  });
  const coverInitialized = useRef(false);
  useEffect(() => {
    if (phase && project && !coverInitialized.current) {
      coverInitialized.current = true;
      setCover((prev) => ({
        ...prev,
        title: localize(phase.data.attributes.title_multiloc),
        subtitle: localize(project.data.attributes.title_multiloc),
        date: new Date().toLocaleDateString(),
      }));
    }
  }, [phase, project, localize]);

  const updateCover = (key: keyof PdfCover, value: string) =>
    setCover((prev) => ({ ...prev, [key]: value }));

  const [modalOpen, setModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const localizeOption = (field: IFlatCustomField, optionKey: string) => {
    const option = field.options?.find((o) => o.key === optionKey);
    return option ? localize(option.title_multiloc) : optionKey;
  };

  const formatValue = (
    field: IFlatCustomField,
    submission: ISurveySubmissionData
  ): string => {
    const values = submission.attributes.custom_field_values;
    const raw = values[field.key];

    let base = '';
    if (raw !== null && raw !== undefined && raw !== '') {
      switch (field.input_type) {
        case 'select':
          base = localizeOption(field, raw);
          break;
        case 'multiselect':
        case 'multiselect_image':
          base = Array.isArray(raw)
            ? raw.map((key) => localizeOption(field, key)).join(', ')
            : String(raw);
          break;
        case 'ranking':
          base = Array.isArray(raw)
            ? raw
                .map(
                  (key, index) => `${index + 1}. ${localizeOption(field, key)}`
                )
                .join('\n')
            : String(raw);
          break;
        // Geographic and file answers aren't represented in this text export.
        case 'point':
        case 'line':
        case 'polygon':
        case 'file_upload':
        case 'shapefile_upload':
        case 'files':
        case 'image_files':
          base = '';
          break;
        default:
          base = String(raw);
      }
    }

    const relatedAnswer =
      values[`${field.key}_other`] || values[`${field.key}_follow_up`];
    if (relatedAnswer) {
      base = base ? `${base} — ${relatedAnswer}` : String(relatedAnswer);
    }

    return base;
  };

  const handleGenerate = async (redactedKeys: Set<string>) => {
    setIsGenerating(true);
    try {
      const includedFields = answerableFields.filter(
        (field) => !redactedKeys.has(field.key)
      );

      const respondents = responses.map((submission, index) => ({
        label: formatMessage(messages.respondentLabel, { number: index + 1 }),
        date: submission.attributes.created_at
          ? new Date(submission.attributes.created_at).toLocaleDateString()
          : undefined,
        answers: includedFields.map((field) => ({
          question: localize(field.title_multiloc),
          answer: formatValue(field, submission),
        })),
      }));

      const phaseTitle = phase
        ? localize(phase.data.attributes.title_multiloc)
        : '';

      await generateSurveyResponsesPdf({
        cover,
        respondents,
        fileName: sanitizeFilename(`survey-responses-${phaseTitle}`),
        labels: {
          noAnswer: formatMessage(messages.noAnswer),
          footer: formatMessage(messages.pdfFooter, {
            count: responses.length,
          }),
        },
      });
      setModalOpen(false);
    } finally {
      setIsGenerating(false);
    }
  };

  // Live cover preview: render the *actual* cover page from the same generator
  // (cover only — no response data, so no PII) to a blob URL, so the preview is
  // identical to the downloaded cover. Debounced + keyed on the cover content.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewUrlRef = useRef<string | null>(null);

  const previewSignature = useMemo(
    () => JSON.stringify({ cover, count: responses.length }),
    [cover, responses.length]
  );

  useEffect(() => {
    if (responses.length === 0 || !cover.include) return undefined;
    let cancelled = false;
    setPreviewLoading(true);
    const timer = setTimeout(async () => {
      const doc = await buildSurveyResponsesPdf({
        cover,
        respondents: [],
        coverOnly: true,
        fileName: 'cover',
        labels: {
          noAnswer: formatMessage(messages.noAnswer),
          footer: formatMessage(messages.pdfFooter, {
            count: responses.length,
          }),
        },
      });
      if (cancelled) return;
      const url = URL.createObjectURL(doc.output('blob'));
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = url;
      setPreviewUrl(url);
      setPreviewLoading(false);
    }, PREVIEW_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewSignature]);

  // Revoke the last blob URL on unmount.
  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    []
  );

  if (phase && phase.data.attributes.participation_method !== 'native_survey') {
    return null;
  }

  const isLoading = !phase || !customFields || isLoadingSubmissions;

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
      ) : responses.length === 0 ? (
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
                values={{ count: responses.length }}
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
              onClick={() => setModalOpen(true)}
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
              position="relative"
              border={`1px solid ${colors.borderLight}`}
              borderRadius={stylingConsts.borderRadius}
              overflow="hidden"
              background={colors.grey100}
              style={{ aspectRatio: '210 / 297' }}
            >
              {!cover.include ? (
                <Box
                  h="100%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  p="24px"
                >
                  <Text color="textSecondary" textAlign="center" m="0px">
                    <FormattedMessage {...messages.coverDisabledPreview} />
                  </Text>
                </Box>
              ) : (
                <>
                  {previewUrl && (
                    <iframe
                      title={formatMessage(messages.previewLabel)}
                      src={`${previewUrl}#toolbar=0&navpanes=0&view=Fit`}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                    />
                  )}
                  {(previewLoading || !previewUrl) && (
                    <Box
                      position="absolute"
                      top="0"
                      left="0"
                      w="100%"
                      h="100%"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      style={{ background: 'rgba(255, 255, 255, 0.6)' }}
                    >
                      <Spinner />
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Box>
        </Box>
      )}

      <ReviewFieldsModal
        opened={modalOpen}
        initialFields={detectedFields}
        responseCount={responses.length}
        processing={isGenerating}
        onClose={() => setModalOpen(false)}
        onGenerate={handleGenerate}
      />
    </Box>
  );
};

export default AdminPhaseSurveyPdfExport;
