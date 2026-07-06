import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';
import { UserComponent, useNode } from '@craftjs/core';
import { Multiloc } from 'typings';

import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import LockedHeaderNote from '../LockedHeaderNote';
import messages from '../messages';
import useWidgetProjectId from '../useWidgetProjectId';

type Props = {
  // Unsaved edit of the project's `title_multiloc`; committed to the project
  // and stripped from the layout on Save (see projectAttributeDrafts.ts).
  title?: Multiloc;
};

// Locked widget rendering the project title as the page heading. Cannot be moved
// or deleted; its settings panel edits the project's `title_multiloc`.
const ProjectTitle: UserComponent<Props> = ({ title: draftTitle }) => {
  const projectId = useWidgetProjectId();
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const padding = useCraftComponentDefaultPadding();
  const { data: project } = useProjectById(projectId);

  if (!project) {
    return null;
  }

  const title = localize(draftTitle ?? project.data.attributes.title_multiloc);

  return (
    <Title
      id="e2e-project-page-title"
      color="tenantText"
      variant="h1"
      px={padding}
    >
      {title || formatMessage(messages.untitledProject)}
    </Title>
  );
};

const ProjectTitleSettings = () => {
  const projectId = useWidgetProjectId();
  const { formatMessage } = useIntl();
  const { data: project } = useProjectById(projectId);
  const {
    actions: { setProp },
    draftTitle,
  } = useNode((node) => ({
    draftTitle: node.data.props.title as Multiloc | undefined,
  }));

  if (!project || !projectId) {
    return null;
  }

  const titleMultiloc = draftTitle ?? project.data.attributes.title_multiloc;

  const handleChange = (value: Multiloc) => {
    setProp((props: Props) => {
      props.title = value;
    });
  };

  return (
    <Box my="20px" display="flex" flexDirection="column" gap="16px">
      <InputMultilocWithLocaleSwitcher
        type="text"
        label={formatMessage(messages.projectTitleLabel)}
        valueMultiloc={titleMultiloc}
        onChange={handleChange}
      />
      <LockedHeaderNote />
    </Box>
  );
};

ProjectTitle.craft = {
  props: {},
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

export default ProjectTitle;
