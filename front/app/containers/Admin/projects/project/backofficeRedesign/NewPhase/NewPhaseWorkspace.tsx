import React, { useRef, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import { IUpdatedPhaseProperties, ParticipationMethod } from 'api/phases/types';
import useAddPhase from 'api/phases/useAddPhase';
import usePhases from 'api/phases/usePhases';
import { IProjectData } from 'api/projects/types';

import usePhaseFileAttachments, {
  fileAttachmentErrors,
} from 'containers/Admin/projects/_shared/usePhaseFileAttachments';
import { ValidationErrors } from 'containers/Admin/projects/project/phaseSetup/typings';
import validate from 'containers/Admin/projects/project/phaseSetup/validate';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import ProjectWorkspace from '..';
import { SaveReason, useRegisterPhaseSaver } from '../_shared/PhaseSaveContext';
import BackToProjectSetup from '../Phase/BackToProjectSetup';
import BuildFields from '../Phase/BuildPanel/BuildFields';
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
  const { mutateAsync: addPhase } = useAddPhase();

  const [participationMethod, setParticipationMethod] = useState(
    initialParticipationMethod
  );
  const [formData, setFormData] = useState(initialFormData);
  const [dirty, setDirty] = useState(false);
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

  const updateFormData = (newData: Partial<IUpdatedPhaseProperties>) => {
    setDirty(true);
    setFormData((formData) => ({ ...formData, ...newData }));
  };

  const createPhase = async () => {
    if (createdPhaseId.current) return createdPhaseId.current;

    const { isValidated, errors } = validate(
      formData,
      phases,
      formatMessage,
      undefined,
      standalone
    );

    setValidationErrors(errors);
    if (!isValidated) throw new Error('Invalid phase');

    const { data: phase } = await addPhase({ projectId, ...formData });
    createdPhaseId.current = phase.id;
    return phase.id;
  };

  const save = async (reason: SaveReason) => {
    try {
      const phaseId = await createPhase();
      await files.save(phaseId);
      setDirty(false);

      // Leaving goes on to wherever the admin was headed. Saving from the
      // header opens the build view of the new phase.
      if (reason === 'button') {
        clHistory.push(`/admin/projects/${projectId}/phases/${phaseId}/setup`);
      }
    } catch (error) {
      setErrors(fileAttachmentErrors(error));
      throw error;
    }
  };

  useRegisterPhaseSaver('draft', { dirty, save });

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
          </Box>
        </Box>
      }
    >
      <PhasePreview projectId={projectId} />
    </ProjectWorkspace>
  );
};

export default NewPhaseWorkspace;
