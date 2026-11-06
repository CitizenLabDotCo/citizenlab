import React, { useState } from 'react';

import { bo } from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import ProjectGenerator from '..';
import messages from '../messages';

import useCanEditWithAi from './useCanEditWithAi';

type Props = {
  project: IProjectData;
};

const EditWithAiButton = ({ project }: Props) => {
  const { formatMessage } = useIntl();
  const canEditWithAi = useCanEditWithAi(project);
  const [opened, setOpened] = useState(false);

  if (!canEditWithAi) return null;

  return (
    <>
      <ButtonWithLink
        type="button"
        buttonStyle="bo-secondary"
        height={bo.buttonMedium.height}
        padding={bo.buttonMedium.padding}
        fontSize={bo.buttonMedium.fontSize}
        iconSize={bo.buttonMedium.iconSize}
        icon="stars"
        onClick={() => setOpened(true)}
      >
        {formatMessage(messages.editWithAi)}
      </ButtonWithLink>
      <ProjectGenerator
        opened={opened}
        projectId={project.id}
        onClose={() => setOpened(false)}
      />
    </>
  );
};

export default EditWithAiButton;
