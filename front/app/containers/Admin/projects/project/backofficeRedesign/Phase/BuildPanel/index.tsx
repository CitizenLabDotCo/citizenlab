import React, { useState } from 'react';

import { useForm } from 'react-hook-form';
import { CLErrors } from 'typings';

import { IFileAttachmentData } from 'api/file_attachments/types';
import { IPhaseData, IUpdatedPhaseProperties } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import useUpdatePhase from 'api/phases/useUpdatePhase';
import { isTimelinePhase } from 'api/phases/utils';

import useFeatureFlag from 'hooks/useFeatureFlag';

import usePhaseFileAttachments, {
  fileAttachmentErrors,
} from 'containers/Admin/projects/_shared/usePhaseFileAttachments';
import { SurveyMethod } from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/SurveyMethodChoices';
import { validateDates } from 'containers/Admin/projects/project/phaseSetup/validate';

import LanguageChecksContext, {
  useLanguageChecks,
} from 'components/admin/MultilocFields/LanguageChecksContext';
import { useRegisterPageSaver } from 'components/admin/PageSaveContext';
import { usePhasePreviewPublisher } from 'components/admin/PhasePreview/DraftContext';

import { useIntl } from 'utils/cl-intl';

import BuildFields from './BuildFields';
import styles from './BuildPanel.module.css';
import SwitchSurveyMethodModal from './SwitchSurveyMethodModal';
import useSurveyMethodLocks from './useSurveyMethodLocks';
import 'design-system/tokens.css';

interface Props {
  projectId: string;
  phase: IPhaseData;
  savedAttachments: IFileAttachmentData[];
}

const BuildPanel = ({ projectId, phase, savedAttachments }: Props) => {
  const { formatMessage } = useIntl();
  const { data: phases } = usePhases(projectId);
  const { mutateAsync: updatePhase } = useUpdatePhase();

  const {
    watch,
    setValue,
    getValues,
    reset,
    setError,
    clearErrors,
    formState: { isDirty, errors: formErrors },
  } = useForm<{ phase: IUpdatedPhaseProperties }>({
    defaultValues: { phase: phase.attributes },
  });
  const formData = watch('phase');
  const [filesChanged, setFilesChanged] = useState(false);
  const [errors, setErrors] = useState<CLErrors | null>(null);
  const [pendingSurveyMethod, setPendingSurveyMethod] =
    useState<SurveyMethod | null>(null);
  const surveyMethodLocks = useSurveyMethodLocks(phase);
  const draftDescriptionEnabled = useFeatureFlag({
    name: 'draft_phase_description',
  });

  const files = usePhaseFileAttachments({
    projectId,
    phaseId: phase.id,
    savedAttachments,
    onStage: () => setFilesChanged(true),
  });

  // Detached phases skip the timeline rules: their dates may overlap and stay
  // open-ended.
  const standalone = !isTimelinePhase(phase);

  const preview = usePhasePreviewPublisher('build', phase.id);

  const { checks, checkLanguages } = useLanguageChecks();

  const updateFormData = (newData: Partial<IUpdatedPhaseProperties>) => {
    preview.publish(newData);
    setErrors((errors) =>
      errors
        ? Object.fromEntries(
            Object.entries(errors).filter(([field]) => !(field in newData))
          )
        : null
    );
    setValue(
      'phase',
      { ...getValues('phase'), ...newData },
      { shouldDirty: true }
    );
  };

  const save = async () => {
    const values = getValues('phase');
    const languagesDone = checkLanguages();
    const { isValidated, errors: dateErrors } = validateDates(
      values,
      phases,
      formatMessage,
      phase.id,
      standalone
    );

    if (!isValidated) {
      setError('root.dates', { message: dateErrors.phaseDateError });
      throw new Error('Invalid phase dates');
    }
    if (!languagesDone) throw new Error('Languages left to translate');

    try {
      const response = await updatePhase({
        phaseId: phase.id,
        title_multiloc: values.title_multiloc,
        start_at: values.start_at,
        end_at: values.end_at,
        input_term: values.input_term,
        ...(phase.attributes.participation_method === 'survey'
          ? {
              survey_service: values.survey_service,
              survey_embed_url: values.survey_embed_url,
            }
          : {}),
        ...(phase.attributes.participation_method === 'document_annotation'
          ? {
              document_annotation_embed_url:
                values.document_annotation_embed_url,
            }
          : {}),
        // A draft description publishes on its own; sending the loaded value
        // would undo a publish made since.
        ...(draftDescriptionEnabled
          ? {}
          : { description_multiloc: values.description_multiloc }),
      });
      reset({ phase: response.data.attributes });
      preview.clear();
      await files.save(phase.id);
      setErrors(null);
      setFilesChanged(false);
    } catch (reason) {
      setErrors(fileAttachmentErrors(reason));
      throw reason;
    }
  };

  useRegisterPageSaver('build', { dirty: isDirty || filesChanged, save });

  return (
    <LanguageChecksContext.Provider value={checks}>
      <div className={styles.panel}>
        <div className={styles.fields}>
          <BuildFields
            projectId={projectId}
            phaseId={phase.id}
            participationMethod={phase.attributes.participation_method}
            formData={formData}
            errors={errors}
            validationErrors={{
              phaseDateError: formErrors.root?.dates.message,
            }}
            standalone={standalone}
            files={files}
            surveyMethodSwitch={{
              disabledReasons: surveyMethodLocks,
              onSelect: setPendingSurveyMethod,
            }}
            onChange={updateFormData}
            onDatesChange={(dates) => {
              clearErrors('root.dates');
              updateFormData(dates);
            }}
          />
        </div>

        <SwitchSurveyMethodModal
          phase={phase}
          method={pendingSurveyMethod}
          onClose={() => setPendingSurveyMethod(null)}
        />
      </div>
    </LanguageChecksContext.Provider>
  );
};

export default BuildPanel;
