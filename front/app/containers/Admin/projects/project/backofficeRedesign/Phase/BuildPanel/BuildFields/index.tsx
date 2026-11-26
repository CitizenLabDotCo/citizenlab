import React, { ReactNode, useState } from 'react';

import { CLErrors } from 'typings';

import Banner from 'design-system/Banner';
import Text from 'design-system/Text';

import { IUpdatedPhaseProperties, ParticipationMethod } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import AttachmentsCard from 'containers/Admin/projects/_shared/components/AttachmentsCard';
import PanelHeading from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelHeading';
import usePhaseFileAttachments from 'containers/Admin/projects/_shared/usePhaseFileAttachments';
import { PhaseDates as Dates } from 'containers/Admin/projects/project/phaseSetup/components/PhaseDatePicker';
import { isSurveyMethod } from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/SurveyMethodChoices';
import phaseSetupMessages from 'containers/Admin/projects/project/phaseSetup/messages';
import { ValidationErrors } from 'containers/Admin/projects/project/phaseSetup/typings';

import LanguageGroup from 'components/admin/MultilocFields/LanguageGroup';
import fieldMessages from 'components/admin/MultilocFields/messages';
import MultilocTitleField from 'components/admin/MultilocFields/MultilocTitleField';
import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';
import useLanguageGroup from 'components/admin/MultilocFields/useLanguageGroup';

import { useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { useSearch } from 'utils/router';

import SurveySetupModal from '../SurveySetupModal';

import styles from './BuildFields.module.css';
import DescriptionField from './DescriptionField';
import DocumentUrlCard from './DocumentUrlCard';
import InputTermCard from './InputTermCard';
import messages from './messages';
import MethodSection from './MethodSection';
import PhaseDates from './PhaseDates';
import setupTitle from './setupTitle';
import SurveyMethodSection, { SurveyMethodSwitch } from './SurveyMethodSection';

const USES_INPUT_TERM: ParticipationMethod[] = ['ideation', 'proposals'];

interface Props {
  projectId: string;
  /** Absent while the phase isn't saved yet. */
  phaseId?: string;
  participationMethod: ParticipationMethod;
  formData: IUpdatedPhaseProperties;
  errors: CLErrors | null;
  validationErrors: ValidationErrors;
  standalone: boolean;
  files: ReturnType<typeof usePhaseFileAttachments>;
  surveyMethodSwitch: SurveyMethodSwitch;
  draftQuestionsAction?: ReactNode;
  onChange: (newData: Partial<IUpdatedPhaseProperties>) => void;
  onDatesChange: (dates: Dates) => void;
}

const BuildFields = ({
  projectId,
  phaseId,
  participationMethod,
  formData,
  errors,
  validationErrors,
  standalone,
  files,
  surveyMethodSwitch,
  draftQuestionsAction,
  onChange,
  onDatesChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const apiErrorText = useApiErrorText();
  const draftDescriptionEnabled = useFeatureFlag({
    name: 'draft_phase_description',
  });
  // A draft description publishes on its own, with its own switcher.
  const descriptionInGroup = !(draftDescriptionEnabled && phaseId);
  const group = useLanguageGroup([
    {
      value: formData.title_multiloc,
      name: formatMessage(fieldMessages.title),
      required: true,
    },
    ...(descriptionInGroup
      ? [
          {
            value: formData.description_multiloc,
            name: formatMessage(fieldMessages.description),
          },
        ]
      : []),
  ]);
  const baseError = apiErrorText(errors?.base);
  const { survey_action } = useSearch({ strict: false });
  const [surveySetupOpened, setSurveySetupOpened] = useState(false);

  const surveyOptionsShown = !standalone && isSurveyMethod(participationMethod);

  return (
    <div className={styles.fields}>
      <div className={styles.header}>
        <Text as="h2" variant="uiStrong" tone="primary">
          {formatMessage(setupTitle(participationMethod))}
        </Text>
      </div>

      <div className={styles.sections}>
        <div className={styles.details}>
          <PhaseDates
            participationMethod={participationMethod}
            formData={formData}
            errors={errors}
            validationErrors={validationErrors}
            standalone={standalone}
            onChange={onDatesChange}
          />
          <LanguageGroup
            group={group}
            aria-label={formatMessage(messages.phaseContentLanguage)}
          >
            <div className={styles.group}>
              <div className="intercom-admin-phase-name">
                <MultilocTitleField
                  id="phase-build-panel-title"
                  locale={group.selectedLocale}
                  aria-label={formatMessage(phaseSetupMessages.titleLabel)}
                  placeholder={group.placeholder(
                    messages.phaseTitleInLanguage,
                    messages.phaseTitle
                  )}
                  valueMultiloc={formData.title_multiloc}
                  onChange={(title_multiloc) => onChange({ title_multiloc })}
                  errorMessage={apiErrorText(errors?.title_multiloc)}
                />
              </div>

              <DescriptionField
                projectId={projectId}
                phaseId={phaseId}
                locale={group.selectedLocale}
                placeholder={group.placeholder(
                  messages.addDescriptionInLanguage,
                  messages.addDescription
                )}
                value={formData.description_multiloc}
                errors={errors}
                onChange={(description_multiloc) =>
                  onChange({ description_multiloc })
                }
              />
            </div>
          </LanguageGroup>
          <AttachmentsCard
            id="phase-build-panel-file-uploader"
            title={formatMessage(messages.attachments)}
            files={files}
            errors={errors}
          />
        </div>

        <div className={styles.group}>
          {USES_INPUT_TERM.includes(participationMethod) && (
            <>
              <PanelHeading
                label={formatMessage(
                  participationMethod === 'proposals'
                    ? messages.proposalsAndParticipantData
                    : messages.ideasAndParticipantData
                )}
              />
              <InputTermCard
                value={formData.input_term}
                onChange={(input_term) => onChange({ input_term })}
              />
            </>
          )}

          {participationMethod === 'voting' && phaseId && (
            <PanelHeading
              label={formatMessage(messages.optionsAndParticipantData)}
            />
          )}

          {participationMethod === 'document_annotation' && (
            <DocumentUrlCard
              value={formData.document_annotation_embed_url}
              errors={errors}
              onChange={(document_annotation_embed_url) =>
                onChange({ document_annotation_embed_url })
              }
            />
          )}

          {surveyOptionsShown && (
            <SurveyMethodSection
              projectId={projectId}
              phaseId={phaseId}
              selected={participationMethod}
              surveyService={formData.survey_service}
              surveyEmbedUrl={formData.survey_embed_url}
              errors={errors}
              onExternalSurveyChange={onChange}
              disabledReasons={surveyMethodSwitch.disabledReasons}
              onSelect={surveyMethodSwitch.onSelect}
              draftQuestionsAction={draftQuestionsAction}
              onAddQuestions={() => setSurveySetupOpened(true)}
            />
          )}

          <MethodSection
            projectId={projectId}
            participationMethod={participationMethod}
            phaseId={phaseId}
            inputTerm={formData.input_term}
            formInSurveyOptions={surveyOptionsShown}
            draftQuestionsAction={draftQuestionsAction}
          />
        </div>

        {baseError && <Banner tone="error">{baseError}</Banner>}
      </div>

      {phaseId && participationMethod === 'native_survey' && (
        <SurveySetupModal
          projectId={projectId}
          phaseId={phaseId}
          opened={surveySetupOpened}
          onClose={() => setSurveySetupOpened(false)}
          initialAction={survey_action}
          onCloseAction={() => {
            if (survey_action) removeSearchParams(['survey_action']);
          }}
        />
      )}
    </div>
  );
};

export default BuildFields;
