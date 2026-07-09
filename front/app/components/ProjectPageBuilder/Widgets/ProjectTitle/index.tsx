import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';
import { UserComponent, useNode } from '@craftjs/core';
import { Multiloc } from 'typings';

import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import LockedNote from '../LockedNote';
import messages from '../messages';
import useWidgetProjectId from '../useWidgetProjectId';

type Props = {
  title?: Multiloc;
};

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
      <LockedNote message={messages.lockedHeaderNote} />
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
