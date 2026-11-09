import React, { useRef, useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import { IUpdatedPhaseProperties, ParticipationMethod } from 'api/phases/types';
import useAddPhase from 'api/phases/useAddPhase';
import usePhases from 'api/phases/usePhases';
import useUpdatePhase from 'api/phases/useUpdatePhase';
import { IProjectData } from 'api/projects/types';

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
import ErrorMessage from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';
import Navigate from 'utils/cl-router/Navigate';

import ProjectWorkspace from '..';
import BuildFields from '../Phase/BuildPanel/BuildFields';
import methodSectionMessages from '../Phase/BuildPanel/BuildFields/MethodSection/messages';
import PlacementCard from '../Phase/BuildPanel/PlacementCard';
import SurveySetupModal, {
  SurveySetupAction,
} from '../Phase/BuildPanel/SurveySetupModal';
import DraftMethodSettings from '../Phase/DraftMethodSettings';
import PhasePreview from '../Phase/PhasePreview';

import messages from './messages';

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
  const pageSave = usePageSave();

  const [participationMethod, setParticipationMethod] = useState(
    initialParticipationMethod
  );
  const [standalone, setStandalone] = useState(initialStandalone);
  const [formData, setFormData] = useState(initialFormData);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<CLErrors | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const savedPhase = useRef<{
    id: string;
    formData: IUpdatedPhaseProperties;
  }>();
  const [saveFailed, setSaveFailed] = useState(false);
  const [surveySetupOpened, setSurveySetupOpened] = useState(false);
  const [destination, setDestination] = useState<{
    phaseId: string;
    surveyAction?: SurveySetupAction;
  }>();

  const files = usePhaseFileAttachments({
    projectId,
    phaseId: undefined,
    savedAttachments: undefined,
    onStage: () => setDirty(true),
  });

  const updateFormData = (newData: Partial<IUpdatedPhaseProperties>) => {
    setDirty(true);
    setFormData((formData) => ({ ...formData, ...newData }));
  };

  const savePhase = async () => {
    const previous = savedPhase.current;
    if (!previous) {
      const { data: phase } = await addPhase({ projectId, ...formData });
      savedPhase.current = { id: phase.id, formData };
      return phase.id;
    }

    // An attachment failure can leave the phase saved while the draft stays open.
    if (previous.formData !== formData) {
      await updatePhase({ ...formData, phaseId: previous.id });
      savedPhase.current = { id: previous.id, formData };
    }
    return previous.id;
  };

  const save = async (reason: SaveReason) => {
    setSaveFailed(false);
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
      setSaveFailed(true);
      throw new Error('Invalid phase');
    }

    try {
      const phaseId = await savePhase();
      await files.save(phaseId);
      setDirty(false);

      if (reason === 'button') {
        pageSave?.leave();
        setDestination({ phaseId });
      }
    } catch (error) {
      setSaveFailed(true);
      setErrors(fileAttachmentErrors(error));
      throw error;
    }
  };

  useRegisterPageSaver('draft', { dirty, save });

  const saveAndOpenSurvey = async (surveyAction: SurveySetupAction) => {
    if (!pageSave || pageSave.saving || files.isUploadingFile) return;

    setDirty(true);
    const failed = await pageSave.saveAll('leave', 'draft');
    setSurveySetupOpened(false);
    if (failed.length > 0 || !savedPhase.current) return;

    pageSave.leave();
    setDestination({ phaseId: savedPhase.current.id, surveyAction });
  };

  if (destination) {
    const params = { projectId, phaseId: destination.phaseId };

    if (destination.surveyAction === 'edit') {
      return (
        <Navigate
          to="/admin/projects/$projectId/phases/$phaseId/survey-form/edit"
          params={params}
          replace
        />
      );
    }

    return (
      <Navigate
        to="/admin/projects/$projectId/phases/$phaseId/setup"
        params={params}
        search={{ survey_action: destination.surveyAction }}
        replace={!!destination.surveyAction}
      />
    );
  }

  return (
    <ProjectWorkspace
      project={project}
      draft={{
        label: formatMessage(
          standalone ? messages.newSurveyCrumb : messages.newPhaseCrumb
        ),
        methodSettings: (
          <DraftMethodSettings
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
            participationMethod === 'native_survey' && (
              <Box>
                <Button
                  buttonStyle="bo-secondary"
                  data-cy="add-draft-survey-questions"
                  boSize="medium"
                  width="100%"
                  onClick={() => setSurveySetupOpened(true)}
                >
                  {formatMessage(methodSectionMessages.addQuestions)}
                </Button>
                {saveFailed && (
                  <ErrorMessage
                    text={formatMessage(messages.addQuestionsSaveError)}
                  />
                )}
              </Box>
            )
          }
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
      <PhasePreview projectId={projectId} />
      {participationMethod === 'native_survey' && (
        <SurveySetupModal
          projectId={projectId}
          opened={surveySetupOpened}
          onClose={() => setSurveySetupOpened(false)}
          draft={{
            onChoose: saveAndOpenSurvey,
            saving: !!pageSave?.saving,
            uploading: files.isUploadingFile,
          }}
        />
      )}
    </ProjectWorkspace>
  );
};

export default NewPhaseWorkspace;
