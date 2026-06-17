import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  Box,
  Title,
  Text,
  Button,
  Spinner,
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

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';
import { getFullName } from 'utils/textUtils';

import CoverPreview from './CoverPreview';
import messages from './messages';
import ReviewFieldsModal, {
  SurveyFieldWithRedactState,
} from './ReviewFieldsModal';

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
  const formFieldsWithRedactState: SurveyFieldWithRedactState[] = useMemo(
    () =>
      (surveyFields?.data ?? []).map((field) => ({
        key: field.id,
        label: localize(field.attributes.title_multiloc),
        redact: field.attributes.personal_data,
      })),
    [surveyFields, localize]
  );

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
        // Defaults to the current user; they can edit or clear it.
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
        cover: getValues(),
        redactedFieldKeys: Array.from(redactedKeys),
        fileName: `${
          snakeCase(`survey responses ${phaseTitle}`) || 'survey_responses'
        }.pdf`,
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
    <FormProvider {...methods}>
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
          surveyFieldsWithRedactState={formFieldsWithRedactState}
          responseCount={responseCount}
          processing={isGenerating}
          error={error}
          onClose={() => setModalOpen(false)}
          onGenerate={handleGenerate}
        />
      </Box>
    </FormProvider>
  );
};

export default AdminPhaseSurveyPdfExport;
