import React, { useState, useEffect } from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';
import { UserComponent, useNode } from '@craftjs/core';
import { Multiloc } from 'typings';

import useProjectById from 'api/projects/useProjectById';
import useUpdateProject from 'api/projects/useUpdateProject';

import useLocalize from 'hooks/useLocalize';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import LockedHeaderNote from '../LockedHeaderNote';
import messages from '../messages';
import useWidgetProjectId from '../useWidgetProjectId';

// Locked widget rendering the project title as the page heading. Cannot be moved
// or deleted; its settings panel edits the project's `title_multiloc`.
const ProjectTitle: UserComponent = () => {
  const projectId = useWidgetProjectId();
  const localize = useLocalize();
  const padding = useCraftComponentDefaultPadding();
  const { data: project } = useProjectById(projectId);

  if (!project) {
    return null;
  }

  return (
    <Title
      id="e2e-project-page-title"
      color="tenantText"
      variant="h1"
      px={padding}
    >
      {localize(project.data.attributes.title_multiloc)}
    </Title>
  );
};

const ProjectTitleSettings = () => {
  const projectId = useWidgetProjectId();
  const { formatMessage } = useIntl();
  const { data: project } = useProjectById(projectId);
  const { mutate: updateProject } = useUpdateProject();
  const [titleMultiloc, setTitleMultiloc] = useState<Multiloc>({});

  // Keep this craft node selected even while the underlying project refetches.
  useNode();

  useEffect(() => {
    if (project) {
      setTitleMultiloc(project.data.attributes.title_multiloc);
    }
  }, [project?.data.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!project || !projectId) {
    return null;
  }

  const save = () => {
    updateProject({ projectId, title_multiloc: titleMultiloc });
  };

  return (
    <Box my="20px" display="flex" flexDirection="column" gap="16px">
      <InputMultilocWithLocaleSwitcher
        type="text"
        label={formatMessage(messages.projectTitleLabel)}
        valueMultiloc={titleMultiloc}
        onChange={setTitleMultiloc}
        onBlur={save}
        onSelectedLocaleChange={save}
      />
      <LockedHeaderNote />
    </Box>
  );
};

ProjectTitle.craft = {
  related: {
    settings: ProjectTitleSettings,
  },
  rules: {
    canDrag: () => false,
  },
  custom: {
    title: messages.titleWidgetTitle,
    locked: true,
    noPointerEvents: true,
  },
};

export const projectTitleWidgetTitle = messages.titleWidgetTitle;

export default ProjectTitle;
