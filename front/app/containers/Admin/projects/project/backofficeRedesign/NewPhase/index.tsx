import React from 'react';

import { IProjectData } from 'api/projects/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import useNewPhaseDefaults from 'containers/Admin/projects/project/phaseSetup/useNewPhaseDefaults';

import { useIntl } from 'utils/cl-intl';
import Navigate from 'utils/cl-router/Navigate';
import { useSearch } from 'utils/router';

import messages from '../messages';

import NewPhaseWorkspace from './NewPhaseWorkspace';

interface Props {
  project: IProjectData;
}

const NewPhase = ({ project }: Props) => {
  const { formatMessage } = useIntl();
  const newPhaseDefaults = useNewPhaseDefaults();
  const { participation_method, placement } = useSearch({ strict: false });
  const spotlightSurveysEnabled = useFeatureFlag({
    name: 'parallel_participation',
  });

  const standalone = spotlightSurveysEnabled && placement === 'standalone';
  const participationMethod = standalone
    ? 'native_survey'
    : participation_method;

  // The method is picked on the project page before a phase is built.
  if (!participationMethod) {
    return (
      <Navigate
        to="/admin/projects/$projectId"
        params={{ projectId: project.id }}
        replace
      />
    );
  }

  if (!newPhaseDefaults) return null;

  return (
    <NewPhaseWorkspace
      // Picking another method starts the phase over.
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
