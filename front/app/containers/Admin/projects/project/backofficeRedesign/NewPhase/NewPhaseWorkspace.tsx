import React, { useRef, useState } from 'react';

import { CLErrors } from 'typings';

import Button from 'design-system/Button';

import {
  IUpdatedPhaseProperties,
  ParticipationMethod,
  SetupReviewCard,
} from 'api/phases/types';
import useAddPhase from 'api/phases/useAddPhase';
import usePhases from 'api/phases/usePhases';
import useReviewSetupCard from 'api/phases/useReviewSetupCard';
import useUpdatePhase from 'api/phases/useUpdatePhase';
import { IProjectData } from 'api/projects/types';

import { DraftSetupReviewContext } from 'containers/Admin/projects/_shared/components/SetupReview';
import usePhaseFileAttachments, {
  fileAttachmentErrors,
} from 'containers/Admin/projects/_shared/usePhaseFileAttachments';
import { ValidationErrors } from 'containers/Admin/projects/project/phaseSetup/typings';
import validate from 'containers/Admin/projects/project/phaseSetup/validate';

import {
  SaveReason,
  usePageSave,
  useRegisterPageSaver,
} from 'components/admin/PageSaveContext';

import { useIntl } from 'utils/cl-intl';
import Navigate from 'utils/cl-router/Navigate';

import ProjectWorkspace from '..';
import BuildFields from '../Phase/BuildPanel/BuildFields';
import methodSectionMessages from '../Phase/BuildPanel/BuildFields/MethodSection/messages';
import buildPanelStyles from '../Phase/BuildPanel/BuildPanel.module.css';
import PlacementCard from '../Phase/BuildPanel/PlacementCard';
import SurveySetupModal, {
  SurveySetupAction,
} from '../Phase/BuildPanel/SurveySetupModal';
import DraftMethodSettings, {
  SetupSettingsAction,
} from '../Phase/DraftMethodSettings';
import PhasePreview from '../Phase/PhasePreview';

import messages from './messages';
import SavedInputForm from './SavedInputForm';
import 'design-system/tokens.css';

interface Props {
  project: IProjectData;
  participationMethod: ParticipationMethod;
  standalone: boolean;
  initialFormData: IUpdatedPhaseProperties;
  defaultsForMethod: (
    participationMethod: ParticipationMethod
  ) => IUpdatedPhaseProperties;
}

const NewPhaseWorkspace = ({
  project,
  participationMethod: initialParticipationMethod,
  standalone: initialStandalone,
  initialFormData,
  defaultsForMethod,
}: Props) => {
  const { formatMessage } = useIntl();
  const projectId = project.id;
  const { data: phases } = usePhases(projectId);
  const { mutateAsync: addPhase } = useAddPhase();
  const { mutateAsync: updatePhase } = useUpdatePhase();
  const { mutateAsync: reviewSetupCard } = useReviewSetupCard();
  const pageSave = usePageSave();

  const [participationMethod, setParticipationMethod] = useState(
    initialParticipationMethod
  );
  const [standalone, setStandalone] = useState(initialStandalone);
  const [formData, setFormData] = useState(initialFormData);
  const [reviewedCards, setReviewedCards] = useState<SetupReviewCard[]>([]);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<CLErrors | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const savedPhase = useRef<{
    id: string;
    formData: IUpdatedPhaseProperties;
    reviewedCards: SetupReviewCard[];
  }>();
  const [surveySetupOpened, setSurveySetupOpened] = useState(false);
  const [destination, setDestination] = useState<{
    phaseId: string;
    action?: SurveySetupAction | 'input' | SetupSettingsAction;
  }>();

  const files = usePhaseFileAttachments({
    projectId,
    phaseId: undefined,
    savedAttachments: undefined,
    onStage: () => setDirty(true),
  });

  const updateFormData = (newData: Partial<IUpdatedPhaseProperties>) => {
    setDirty(true);
    setErrors((errors) =>
      errors
        ? Object.fromEntries(
            Object.entries(errors).filter(([field]) => !(field in newData))
          )
        : null
    );
    setFormData((formData) => ({ ...formData, ...newData }));
  };

  const savePhase = async () => {
    const previous = savedPhase.current;
    if (!previous) {
      const { data: phase } = await addPhase({
        projectId,
        ...formData,
        reviewed_setup_cards: reviewedCards,
      });
      savedPhase.current = { id: phase.id, formData, reviewedCards };
      return phase.id;
    }

    // An attachment failure can leave the phase saved while the draft stays open.
    if (previous.formData !== formData) {
      await updatePhase({ ...formData, phaseId: previous.id });
    }
    // Updating a phase doesn't take reviewed cards.
    for (const card of reviewedCards) {
      if (!previous.reviewedCards.includes(card)) {
        await reviewSetupCard({ phaseId: previous.id, card });
      }
    }
    savedPhase.current = { id: previous.id, formData, reviewedCards };
    return previous.id;
  };

  const save = async (reason: SaveReason) => {
    setErrors(null);

    const { isValidated, errors } = validate(
      formData,
      phases,
      formatMessage,
      savedPhase.current?.id,
      standalone
    );

    setValidationErrors(errors);
    if (!isValidated) {
      throw new Error('Invalid phase');
    }

    try {
      const phaseId = await savePhase();
      await files.save(phaseId);
      setDirty(false);

      if (reason === 'button') setDestination({ phaseId });
    } catch (error) {
      setErrors(fileAttachmentErrors(error));
      throw error;
    }
  };

  useRegisterPageSaver('draft', { dirty, save });

  const saveAndOpenAction = async (
    action: SurveySetupAction | 'input' | SetupSettingsAction
  ) => {
    if (!pageSave || pageSave.saving || files.isUploadingFile) return;

    setDirty(true);
    const failed = await pageSave.saveAll('leave', 'draft');
    setSurveySetupOpened(false);
    if (failed.length > 0 || !savedPhase.current) return;

    pageSave.leave();
    setDestination({ phaseId: savedPhase.current.id, action });
  };

  // The header button also saves the other panels. The saved phase only opens
  // once none of them has changes left, so a failed one keeps its edits.
  const settled = !pageSave?.dirty && !pageSave?.saving;

  if (destination && (destination.action || settled)) {
    const params = { projectId, phaseId: destination.phaseId };

    if (destination.action === 'input') {
      return (
        <SavedInputForm projectId={projectId} phaseId={destination.phaseId} />
      );
    }

    if (destination.action === 'edit') {
      return (
        <Navigate
          to="/admin/projects/$projectId/phases/$phaseId/survey-form/edit"
          params={params}
          replace
        />
      );
    }

    if (
      destination.action === 'access' ||
      destination.action === 'notifications' ||
      destination.action === 'moderation'
    ) {
      return (
        <Navigate
          to="/admin/projects/$projectId/phases/$phaseId/setup"
          params={params}
          search={{ setup_action: destination.action }}
          replace
        />
      );
    }

    return (
      <Navigate
        to="/admin/projects/$projectId/phases/$phaseId/setup"
        params={params}
        search={{ survey_action: destination.action }}
        replace={!!destination.action}
      />
    );
  }

  return (
    <DraftSetupReviewContext.Provider
      value={{
        reviewed: reviewedCards,
        onReview: (card) => {
          setDirty(true);
          setReviewedCards((cards) => [...new Set([...cards, card])]);
        },
      }}
    >
      <ProjectWorkspace
        project={project}
        draft={{
          inputTerm: formData.input_term,
          label: formatMessage(
            standalone ? messages.newSurveyCrumb : messages.newPhaseCrumb
          ),
          methodSettings: (
            <DraftMethodSettings
              surveyPlacement={
                // Only the platform's own survey can run outside the timeline.
                participationMethod === 'native_survey' && (
                  <PlacementCard
                    name="new-survey-placement"
                    value={standalone ? 'standalone' : 'on_timeline'}
                    onChange={(placement_type) => {
                      setStandalone(placement_type === 'standalone');
                      setValidationErrors({});
                      updateFormData({ placement_type });
                    }}
                  />
                )
              }
              onOpenSetting={saveAndOpenAction}
              saving={!!pageSave?.saving}
              uploading={files.isUploadingFile}
              formData={formData}
              validationErrors={validationErrors}
              apiErrors={errors}
              onChange={updateFormData}
              setValidationErrors={setValidationErrors}
            />
          ),
        }}
        sidePanel={
          <BuildFields
            projectId={projectId}
            participationMethod={participationMethod}
            formData={formData}
            errors={errors}
            validationErrors={validationErrors}
            standalone={standalone}
            files={files}
            draftQuestionsAction={
              ['native_survey', 'ideation', 'proposals'].includes(
                participationMethod
              ) && (
                <div className={buildPanelStyles.fullWidth}>
                  <Button
                    variant="secondary"
                    data-cy={
                      participationMethod === 'native_survey'
                        ? 'add-draft-survey-questions'
                        : 'add-draft-input-questions'
                    }
                    isPending={
                      participationMethod !== 'native_survey' &&
                      !!pageSave?.saving
                    }
                    isDisabled={
                      participationMethod !== 'native_survey' &&
                      files.isUploadingFile
                    }
                    onPress={() => {
                      if (participationMethod === 'native_survey') {
                        setSurveySetupOpened(true);
                      } else {
                        saveAndOpenAction('input');
                      }
                    }}
                  >
                    {formatMessage(methodSectionMessages.addQuestions)}
                  </Button>
                </div>
              )
            }
            surveyMethodSwitch={{
              onSelect: (method) => {
                setParticipationMethod(method);
                updateFormData(defaultsForMethod(method));
              },
            }}
            onChange={updateFormData}
            onDatesChange={(dates) => {
              setValidationErrors((errors) => ({
                ...errors,
                phaseDateError: undefined,
              }));
              updateFormData(dates);
            }}
          />
        }
      >
        <PhasePreview projectId={projectId} draft={formData} />
        {participationMethod === 'native_survey' && (
          <SurveySetupModal
            projectId={projectId}
            opened={surveySetupOpened}
            onClose={() => setSurveySetupOpened(false)}
            draft={{
              onChoose: saveAndOpenAction,
              saving: !!pageSave?.saving,
              uploading: files.isUploadingFile,
            }}
          />
        )}
      </ProjectWorkspace>
    </DraftSetupReviewContext.Provider>
  );
};

export default NewPhaseWorkspace;
