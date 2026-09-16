import React, { useEffect, useRef, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import { IUpdatedPhaseProperties, ParticipationMethod } from 'api/phases/types';
import useAddPhase from 'api/phases/useAddPhase';
import usePhases from 'api/phases/usePhases';
import { IProjectData } from 'api/projects/types';

import usePhaseFileAttachments, {
  fileAttachmentErrors,
} from 'containers/Admin/projects/_shared/usePhaseFileAttachments';
import {
  SubmitStateType,
  ValidationErrors,
} from 'containers/Admin/projects/project/phaseSetup/typings';
import validate from 'containers/Admin/projects/project/phaseSetup/validate';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import ProjectWorkspace from '..';
import BackToProjectSetup from '../Phase/BackToProjectSetup';
import BuildFields from '../Phase/BuildPanel/BuildFields';
import SaveBar from '../Phase/BuildPanel/SaveBar';
import DraftPhaseRightPanel from '../Phase/DraftPhaseRightPanel';
import PhasePreview from '../Phase/PhasePreview';

interface Props {
  project: IProjectData;
  participationMethod: ParticipationMethod;
  label: string;
  standalone: boolean;
  initialFormData: IUpdatedPhaseProperties;
  defaultsForMethod: (
    participationMethod: ParticipationMethod
  ) => IUpdatedPhaseProperties;
}

const hasTitle = ({ title_multiloc }: IUpdatedPhaseProperties) =>
  Object.values(title_multiloc ?? {}).some((title) => title.trim() !== '');

// Builds a phase in the browser only. The phase is created in one request once
// the admin saves it with a title and dates, and the build view of the saved
// phase takes over from there.
const NewPhaseWorkspace = ({
  project,
  participationMethod: initialParticipationMethod,
  label,
  standalone,
  initialFormData,
  defaultsForMethod,
}: Props) => {
  const { formatMessage } = useIntl();
  const projectId = project.id;
  const { data: phases } = usePhases(projectId);
  const { mutate: addPhase } = useAddPhase();

  const [participationMethod, setParticipationMethod] = useState(
    initialParticipationMethod
  );
  const [formData, setFormData] = useState(initialFormData);
  const [dirty, setDirty] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitStateType>('enabled');
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<CLErrors | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  // Set once the phase exists, so retrying after a failed attachment upload
  // doesn't create the phase a second time.
  const createdPhaseId = useRef<string>();

  const files = usePhaseFileAttachments({
    projectId,
    phaseId: undefined,
    savedAttachments: undefined,
    onStage: () => setDirty(true),
  });

  useEffect(() => {
    if (!dirty) return;

    window.onbeforeunload = () => true;
    return () => {
      window.onbeforeunload = null;
    };
  }, [dirty]);

  const updateFormData = (newData: Partial<IUpdatedPhaseProperties>) => {
    setDirty(true);
    setSubmitState('enabled');
    setFormData((formData) => ({ ...formData, ...newData }));
  };

  const handleError = (reason: unknown) => {
    setErrors(fileAttachmentErrors(reason));
    setProcessing(false);
    setSubmitState('error');
  };

  const saveAttachmentsAndOpen = (phaseId: string) => {
    files
      .save(phaseId)
      .then(() => {
        setDirty(false);
        clHistory.push(`/admin/projects/${projectId}/phases/${phaseId}/setup`);
      })
      .catch(handleError);
  };

  const handleSave = () => {
    if (processing) return;

    if (createdPhaseId.current) {
      setProcessing(true);
      saveAttachmentsAndOpen(createdPhaseId.current);
      return;
    }

    const { isValidated, errors } = validate(
      formData,
      phases,
      formatMessage,
      undefined,
      standalone
    );

    setValidationErrors(errors);
    if (!isValidated) return;

    setProcessing(true);
    addPhase(
      { projectId, ...formData },
      {
        onSuccess: ({ data: phase }) => {
          createdPhaseId.current = phase.id;
          saveAttachmentsAndOpen(phase.id);
        },
        onError: handleError,
      }
    );
  };

  const canSave = hasTitle(formData) && !!formData.start_at;

  return (
    <ProjectWorkspace
      project={project}
      draft={{
        label,
        rightPanel: (
          <DraftPhaseRightPanel
            formData={formData}
            validationErrors={validationErrors}
            apiErrors={errors}
            onChange={updateFormData}
            setValidationErrors={setValidationErrors}
          />
        ),
      }}
      leftPanel={
        <Box display="flex" flexDirection="column" minHeight="100%">
          <BackToProjectSetup projectId={projectId} />

          <Box display="flex" flexDirection="column" flexGrow={1} minHeight="0">
            <Box flexGrow={1} px="20px" pb="20px">
              <BuildFields
                projectId={projectId}
                participationMethod={participationMethod}
                formData={formData}
                errors={errors}
                validationErrors={validationErrors}
                standalone={standalone}
                files={files}
                surveyMethodSwitch={{
                  // Nothing depends on a phase that isn't saved yet, so the
                  // method can change without asking.
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
            </Box>

            <SaveBar
              status={canSave ? submitState : 'disabled'}
              loading={processing}
              onClick={handleSave}
            />
          </Box>
        </Box>
      }
    >
      <PhasePreview projectId={projectId} />
    </ProjectWorkspace>
  );
};

export default NewPhaseWorkspace;
