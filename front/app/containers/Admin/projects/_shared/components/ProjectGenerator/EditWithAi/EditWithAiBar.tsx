import React, { useState } from 'react';

import { Box, colors, defaultStyles } from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import ProjectGenerator from '..';
import messages from '../messages';

import useCanEditWithAi from './useCanEditWithAi';

type Props = {
  project: IProjectData;
};

// Opens the assistant on the project from under the project preview.
const EditWithAiBar = ({ project }: Props) => {
  const { formatMessage } = useIntl();
  const canEditWithAi = useCanEditWithAi(project);
  const [opened, setOpened] = useState(false);

  if (!canEditWithAi) return null;

  return (
    <Box display="flex" justifyContent="center" px="20px" pb="20px">
      <ButtonWithLink
        type="button"
        buttonStyle="white"
        icon="stars"
        iconColor={colors.teal500}
        textColor={colors.coolGrey600}
        borderColor={colors.grey300}
        borderHoverColor={colors.teal400}
        borderRadius="999px"
        boxShadow={defaultStyles.boxShadowHoverBig}
        boxShadowHover={defaultStyles.boxShadowHoverBig}
        padding="12px 20px"
        minWidth="320px"
        justify="left"
        onClick={() => setOpened(true)}
      >
        {formatMessage(messages.chatToChange)}
      </ButtonWithLink>
      <ProjectGenerator
        opened={opened}
        projectId={project.id}
        onClose={() => setOpened(false)}
      />
    </Box>
  );
};

export default EditWithAiBar;
