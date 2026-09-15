import React, { FormEvent, useEffect, useRef, useState } from 'react';

import { Box, Title, colors } from '@citizenlab/cl2-component-library';
import { CLErrors, Multiloc, SupportedLocale } from 'typings';

import useFileAttachments from 'api/file_attachments/useFileAttachments';
import { IPhase, IUpdatedPhaseProperties } from 'api/phases/types';
import useAddPhase from 'api/phases/useAddPhase';
import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';
import useUpdatePhase from 'api/phases/useUpdatePhase';
import { getPhaseLandingTab, isTimelinePhase } from 'api/phases/utils';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useContainerWidthAndHeight from 'hooks/useContainerWidthAndHeight';
import useFeatureFlag from 'hooks/useFeatureFlag';

import usePhaseFileAttachments, {
  fileAttachmentErrors,
} from 'containers/Admin/projects/_shared/usePhaseFileAttachments';

import {
  Section,
  SectionField,
  SubSectionTitle,
} from 'components/admin/Section';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import Error from 'components/UI/Error';
import FileRepositorySelectAndUpload from 'components/UI/FileRepositorySelectAndUpload';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import {
  FormattedMessage,
  MessageDescriptor,
  useFormatMessageWithLocale,
  useIntl,
} from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { useParams, useSearch } from 'utils/router';
import { defaultAdminCardPadding } from 'utils/styleConstants';

import DateSetup from './components/DateSetup';
import PhaseParticipationConfig from './components/PhaseParticipationConfig';
import {
  ideationDefaultConfig,
  nativeSurveyDefaultConfig,
} from './components/PhaseParticipationConfig/utils/participationMethodConfigs';
import messages from './messages';
import { SubmitStateType, ValidationErrors } from './typings';
import validate from './validate';

const localizedDefaults = (
  message: MessageDescriptor,
  tenantLocales: SupportedLocale[],
  formatMessageWithLocale: (
    locale: SupportedLocale,
    message: MessageDescriptor
  ) => string
): Multiloc =>
  tenantLocales.reduce<Multiloc>((acc, locale) => {
    acc[locale] = formatMessageWithLocale(locale, message);
    return acc;
  }, {});

interface Props {
  projectId: string;
  phase: IPhase | undefined;
  standaloneSurvey?: boolean;
}

const AdminPhaseEdit = ({ projectId, phase, standaloneSurvey }: Props) => {
  const phaseId = phase?.data.id;
  const { data: phaseFileAttachments } = useFileAttachments({
    attachable_id: phaseId,
    attachable_type: 'Phase',
  });
  const { data: phases } = usePhases(projectId);
  const { mutate: addPhase } = useAddPhase();
  const { mutate: updatePhase } = useUpdatePhase();
  const [errors, setErrors] = useState<CLErrors | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [submitState, setSubmitState] = useState<SubmitStateType>('disabled');
  const files = usePhaseFileAttachments({
    projectId,
    phaseId,
    savedAttachments: phaseFileAttachments?.data,
    onStage: () => setSubmitState('enabled'),
  });
  const [formData, setFormData] = useState<IUpdatedPhaseProperties>();
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const { formatMessage } = useIntl();
  const formatMessageWithLocale = useFormatMessageWithLocale();
  const { width, containerRef } = useContainerWidthAndHeight();
  const tenantLocales = useAppConfigurationLocales();

  // Detached phases skip the timeline rules (dates may overlap and stay
  // open-ended) and keep their fixed participation method.
  const standalone = phase ? !isTimelinePhase(phase.data) : standaloneSurvey;

  const standaloneSeededRef = useRef(false);

  useEffect(() => {
    // Whenever the selected phase changes, we reset the form data.
    // If no phase is selected, we initialize the form data with default values.
    if (phase) {
      setFormData(phase.data.attributes);
      return;
    }

    if (standaloneSurvey) {
      if (
        standaloneSeededRef.current ||
        !tenantLocales ||
        !formatMessageWithLocale
      ) {
        return;
      }

      setFormData({
        ...nativeSurveyDefaultConfig,
        placement_type: 'standalone',
        native_survey_title_multiloc: localizedDefaults(
          messages.defaultSurveyTitleLabel,
          tenantLocales,
          formatMessageWithLocale
        ),
        native_survey_button_multiloc: localizedDefaults(
          messages.defaultSurveyCTALabel,
          tenantLocales,
          formatMessageWithLocale
        ),
      });
      standaloneSeededRef.current = true;
      return;
    }

    standaloneSeededRef.current = false;
    setFormData(ideationDefaultConfig);
  }, [phase, standaloneSurvey, tenantLocales, formatMessageWithLocale]);

  if (!formatMessageWithLocale) return null;

  const handlePhaseParticipationConfigChange = (
    participationContextConfig: IUpdatedPhaseProperties
  ) => {
    const surveyCTALabel =
      tenantLocales &&
      localizedDefaults(
        messages.defaultSurveyCTALabel,
        tenantLocales,
        formatMessageWithLocale
      );

    const surveyTitle =
      tenantLocales &&
      localizedDefaults(
        messages.defaultSurveyTitleLabel,
        tenantLocales,
        formatMessageWithLocale
      );

    setSubmitState('enabled');
    // Important to keep the order of the spread operators
    setFormData((formData) => ({
      ...formData,
      ...participationContextConfig,
      ...(participationContextConfig.participation_method === 'native_survey' &&
        !formData?.native_survey_button_multiloc &&
        !phase?.data.attributes.native_survey_button_multiloc && {
          native_survey_button_multiloc: surveyCTALabel,
        }),
      ...(participationContextConfig.participation_method === 'native_survey' &&
        !formData?.native_survey_title_multiloc &&
        !phase?.data.attributes.native_survey_title_multiloc && {
          native_survey_title_multiloc: surveyTitle,
        }),
    }));
  };

  const updateFormData = (newData: Partial<IUpdatedPhaseProperties>) => {
    setSubmitState('enabled');
    setFormData((formData) => ({
      ...formData,
      ...newData,
    }));
  };

  const handleTitleMultilocOnChange = (title_multiloc: Multiloc) => {
    updateFormData({ title_multiloc });
  };

  const handleOnSubmit = async (event: FormEvent<any>) => {
    event.preventDefault();
    if (!formData) return;

    const { isValidated, errors } = validate(
      formData,
      phases,
      formatMessage,
      phase?.data.id,
      standalone
    );

    setValidationErrors(errors);

    if (isValidated) {
      save(formData);
    }
  };

  const handleError = (error: { errors: CLErrors }) => {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    setErrors(error.errors || null);
    setProcessing(false);
    setSubmitState('error');
  };

  const handleSaveResponse = async (
    response: IPhase,
    redirectAfterSave: boolean
  ) => {
    const phaseResponse = response.data;
    const phaseId = phaseResponse.id;

    try {
      await files.save(phaseId);
    } catch (reason) {
      setErrors(fileAttachmentErrors(reason));
      setProcessing(false);
      setSubmitState('error');
      return;
    }

    setProcessing(false);
    setErrors(null);
    setSubmitState('success');

    if (redirectAfterSave) {
      const redirectTab = getPhaseLandingTab(phaseResponse);
      window.scrollTo(0, 0);
      clHistory.push(
        `/admin/projects/${projectId}/phases/${phaseId}/${redirectTab}${window.location.search}`
      );
    } else {
      setFormData(response.data.attributes);
    }
  };

  const save = async (formData: IUpdatedPhaseProperties) => {
    if (processing) return;
    setProcessing(true);

    if (phase) {
      updatePhase(
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        {
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          phaseId: phase?.data.id,
          ...formData,
        },
        {
          onSuccess: (response) => {
            handleSaveResponse(response, false);
          },
          onError: handleError,
        }
      );
    } else if (projectId) {
      addPhase(
        {
          projectId,
          ...formData,
        },
        {
          onSuccess: (response) => {
            handleSaveResponse(response, true);
          },
          onError: handleError,
        }
      );
    }
  };

  if (!formData) return null;

  return (
    <Box ref={containerRef}>
      <Title variant="h3" color="primary">
        {phase && <FormattedMessage {...messages.editPhaseTitle} />}
        {!phase && (
          <FormattedMessage
            {...(standalone ? messages.newSurveyTitle : messages.newPhaseTitle)}
          />
        )}
      </Title>
      <form onSubmit={handleOnSubmit}>
        <Section>
          <SectionField>
            <SubSectionTitle>
              <FormattedMessage {...messages.titleLabel} />
            </SubSectionTitle>
            <InputMultilocWithLocaleSwitcher
              id="title"
              type="text"
              valueMultiloc={formData.title_multiloc}
              placeholder={
                phaseId
                  ? undefined
                  : formatMessage(messages.phaseTitlePlaceholder)
              }
              onChange={handleTitleMultilocOnChange}
              className="intercom-admin-phase-name"
            />
            <Error apiErrors={errors && errors.title_multiloc} />
          </SectionField>
          <DateSetup
            formData={formData}
            errors={errors}
            validationErrors={validationErrors}
            standalone={standalone}
            setSubmitState={setSubmitState}
            setFormData={setFormData}
            setValidationErrors={setValidationErrors}
          />
          <PhaseParticipationConfig
            phase={phase}
            formData={formData}
            validationErrors={validationErrors}
            apiErrors={errors}
            onChange={handlePhaseParticipationConfigChange}
            setValidationErrors={setValidationErrors}
            hideMethodPicker={standalone}
          />
          <SectionField>
            <SubSectionTitle>
              <FormattedMessage {...messages.uploadAttachments} />
            </SubSectionTitle>
            <FileRepositorySelectAndUpload
              id="project-timeline-edit-form-file-uploader"
              onFileAdd={files.uploadFile}
              onFileRemove={files.removeFile}
              onFileReorder={files.reorderFiles}
              onFileAttach={files.attachFile}
              fileAttachments={files.attachments}
              enableDragAndDrop
              apiErrors={errors}
              maxSizeMb={10}
              isUploadingFile={files.isUploadingFile}
            />
          </SectionField>

          {/* TODO: Fix this the next time the file is edited. */}
          {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
          {errors && errors.project && (
            <SectionField>
              <Error apiErrors={errors.project} />
            </SectionField>
          )}
          {/* TODO: Fix this the next time the file is edited. */}
          {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
          {errors && errors.base && (
            <SectionField>
              <Error apiErrors={errors.base} />
            </SectionField>
          )}
        </Section>

        <Box
          position="fixed"
          borderTop={`1px solid ${colors.divider}`}
          bottom="0"
          w={`calc(${width}px + ${defaultAdminCardPadding * 2}px)`}
          ml={`-${defaultAdminCardPadding}px`}
          background={colors.white}
          display="flex"
          justifyContent="flex-start"
        >
          <Box
            py="8px"
            px={`${defaultAdminCardPadding}px`}
            className="intercom-phase-save-button"
          >
            <SubmitWrapper
              loading={processing}
              status={submitState}
              messages={{
                buttonSave: messages.saveChangesLabel,
                buttonSuccess: messages.saveSuccessLabel,
                messageError: messages.saveErrorMessage,
                messageSuccess: messages.saveSuccessMessage,
              }}
            />
          </Box>
        </Box>
      </form>
    </Box>
  );
};

const AdminPhaseEditWrapper = () => {
  const { projectId, phaseId } = useParams({ strict: false });
  const { placement } = useSearch({ strict: false });
  const { data: phase } = usePhase(phaseId);
  const spotlightSurveysEnabled = useFeatureFlag({
    name: 'parallel_participation',
  });
  if (!projectId) return null;

  const phaseLoading = phaseId && phase?.data.id !== phaseId;
  if (phaseLoading) return null;

  return (
    <AdminPhaseEdit
      projectId={projectId}
      phase={phaseId ? phase : undefined}
      standaloneSurvey={spotlightSurveysEnabled && placement === 'standalone'}
    />
  );
};

export default AdminPhaseEditWrapper;
