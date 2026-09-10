import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import usePhases from 'api/phases/usePhases';
import useProjectPageLayout from 'api/project_page_layout/useProjectPageLayout';
import { IProjectData } from 'api/projects/types';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import { HeaderDropdownName } from '../HeaderDropdown';
import messages from '../messages';
import PanelHeading from '../PanelHeading';
import SelectMethodModal from '../SelectMethodModal';

import StepRow, { Step } from './StepRow';

interface Props {
  project: IProjectData;
  onOpenSettings: () => void;
  onOpenDropdown: (dropdown: HeaderDropdownName) => void;
}

const GetStarted = ({ project, onOpenSettings, onOpenDropdown }: Props) => {
  const { formatMessage } = useIntl();
  const projectId = project.id;
  const { data: phases } = usePhases(projectId);
  const { data: layout } = useProjectPageLayout(projectId);

  const [methodModalOpened, setMethodModalOpened] = useState(false);

  const goneThrough = project.attributes.completed_setup_steps ?? [];

  const steps: Step[] = [
    {
      name: 'page',
      label: messages.stepEditProjectPage,
      done: layout?.data.attributes.enabled === true,
      onClick: () =>
        clHistory.push(`/admin/project-page-builder/projects/${projectId}`),
    },
    {
      name: 'settings',
      label: messages.stepConfigureProjectSettings,
      done: goneThrough.includes('settings'),
      onClick: onOpenSettings,
    },
    {
      name: 'timeline',
      label: messages.stepAddPhaseOrSurvey,
      done: (phases?.data.length ?? 0) > 0,
      onClick: () => setMethodModalOpened(true),
    },
    {
      name: 'share',
      label: messages.stepSharePrivateLink,
      done: goneThrough.includes('share'),
      onClick: () => onOpenDropdown('share'),
    },
    {
      name: 'publish',
      label: messages.stepPublishProject,
      done: project.attributes.publication_status === 'published',
      onClick: () => onOpenDropdown('publish'),
    },
  ];

  const doneCount = steps.filter((step) => step.done).length;

  return (
    <Box>
      <PanelHeading
        title={formatMessage(messages.getStarted)}
        meta={formatMessage(messages.stepsDone, {
          done: doneCount,
          total: steps.length,
        })}
      />

      <Box display="flex" flexDirection="column">
        {steps.map((step, index) => (
          <StepRow
            key={step.name}
            step={step}
            isLast={index === steps.length - 1}
          />
        ))}
      </Box>

      <SelectMethodModal
        opened={methodModalOpened}
        onClose={() => setMethodModalOpened(false)}
      />
    </Box>
  );
};

export default GetStarted;
