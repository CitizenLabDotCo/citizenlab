import React, { useState } from 'react';

import { IProjectData } from 'api/projects/types';
import useProjects from 'api/projects/useProjects';
import { IUserData } from 'api/users/types';

import useLocalize, { Localize } from 'hooks/useLocalize';

import MultipleSelect from 'components/UI/MultipleSelect';

import { useIntl } from 'utils/cl-intl';
import { IProjectModeratorRole } from 'utils/permissions/roles';

import messages from '../messages';

import AssignButton from './AssignButton';

const getOptions = (
  localize: Localize,
  alreadyModeratorString: string,
  projects?: IProjectData[],
  roles?: IUserData['attributes']['roles']
) => {
  if (!projects || !roles) return undefined;

  const projectsUserModerates = new Set(
    roles
      .filter(
        (role): role is IProjectModeratorRole =>
          role.type === 'project_moderator'
      )
      .map((role) => role.project_id)
  );

  const options = projects.map((project) => {
    const userIsModerator = projectsUserModerates.has(project.id);
    const projectName = localize(project.attributes.title_multiloc);
    const label = userIsModerator
      ? `${projectName} (${alreadyModeratorString})`
      : projectName;

    return {
      value: project.id,
      label,
      disabled: userIsModerator,
    };
  });

  return options;
};

interface Props {
  user: IUserData;
  onClose: () => void;
  onAssign: () => Promise<void>;
  onExceedsSeats: () => void;
}

const Projects = ({ user, onClose, onAssign, onExceedsSeats }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: projects } = useProjects({
    publicationStatuses: ['published', 'archived', 'draft'],
  });

  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  const options =
    getOptions(
      localize,
      formatMessage(messages.alreadyManager),
      projects?.data,
      user.attributes.roles
    ) || [];
  return (
    <>
      <MultipleSelect
        value={selectedProjects}
        options={options}
        onChange={(selectedOptions) => {
          setSelectedProjects(selectedOptions.map((option) => option.value));
        }}
        label={formatMessage(messages.selectProjects)}
        placeholder={formatMessage(messages.selectPlaceholder)}
      />
      <AssignButton
        disabled={selectedProjects.length === 0}
        user={user}
        onClose={onClose}
        onAssign={onAssign}
        onExceedsSeats={onExceedsSeats}
      />
    </>
  );
};

export default Projects;
