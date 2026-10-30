import React, { useRef, useState } from 'react';

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

import {
  SaveReason,
  useRegisterPageSaver,
} from 'components/admin/PageSaveContext';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import ProjectWorkspace from '..';
import messages from '../messages';
import BuildFields from '../Phase/BuildPanel/BuildFields';
import PlacementCard from '../Phase/BuildPanel/PlacementCard';
import DraftMethodSettings from '../Phase/DraftMethodSettings';
import PhasePreview from '../Phase/PhasePreview';

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

    const { data: phase } = await addPhase({ projectId, ...formData });
    createdPhaseId.current = phase.id;
    return phase.id;
  };

  const save = async (reason: SaveReason) => {
    if (!createdPhaseId.current) {
      const { isValidated, errors } = validate(
        formData,
        phases,
        formatMessage,
        undefined,
        standalone
      );

      setValidationErrors(errors);
      if (!isValidated) throw new Error('Invalid phase');
    }

    try {
      const phaseId = await createPhase();
      await files.save(phaseId);
      setDirty(false);

      if (reason === 'button') {
        clHistory.push(`/admin/projects/${projectId}/phases/${phaseId}/setup`);
      }
    } catch (error) {
      setErrors(fileAttachmentErrors(error));
      throw error;
    }
  };

  useRegisterPageSaver('draft', { dirty, save });

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
    </ProjectWorkspace>
  );
};

export default NewPhaseWorkspace;
