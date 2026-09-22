import React, { useState } from 'react';

import { IProjectData } from 'api/projects/types';

import useNewPhaseDefaults from 'containers/Admin/projects/project/phaseSetup/useNewPhaseDefaults';

import { useIntl } from 'utils/cl-intl';
import Navigate from 'utils/cl-router/Navigate';
import { useSearch } from 'utils/router';

import ProjectWorkspace from '..';
import messages from '../messages';
import PhasePreview from '../Phase/PhasePreview';
import ProjectLeftPanel from '../ProjectLeftPanel';
import SelectMethodModal from '../ProjectSetupPanel/SelectMethodModal';

import NewPhaseWorkspace from './NewPhaseWorkspace';

interface Props {
  project: IProjectData;
}

const NewPhase = ({ project }: Props) => {
  const { formatMessage } = useIntl();
  const newPhaseDefaults = useNewPhaseDefaults();
  const { participation_method, placement } = useSearch({ strict: false });
  const [pickerClosed, setPickerClosed] = useState(false);

  const standalone = placement === 'standalone';
  const participationMethod = standalone
    ? 'native_survey'
    : participation_method;

  if (!participationMethod) {
    if (pickerClosed) {
      return (
        <Navigate
          to="/admin/projects/$projectId"
          params={{ projectId: project.id }}
          replace
        />
      );
    }

    return (
      <>
        <ProjectWorkspace
          project={project}
          leftPanel={<ProjectLeftPanel projectId={project.id} />}
        >
          <PhasePreview projectId={project.id} />
        </ProjectWorkspace>
        <SelectMethodModal
          projectId={project.id}
          opened
          onClose={() => setPickerClosed(true)}
        />
      </>
    );
  }

  if (!newPhaseDefaults) return null;

  return (
    <NewPhaseWorkspace
      key={`${participationMethod}-${standalone}`}
      project={project}
      participationMethod={participationMethod}
      standalone={standalone}
      label={formatMessage(
        standalone ? messages.newSurveyCrumb : messages.newPhaseCrumb
      )}
      initialFormData={newPhaseDefaults(participationMethod, standalone)}
      defaultsForMethod={newPhaseDefaults}
    />
  );
};

export default NewPhase;
