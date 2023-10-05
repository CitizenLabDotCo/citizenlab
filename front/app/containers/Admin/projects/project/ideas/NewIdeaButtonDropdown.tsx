import React from 'react';

// components
import {
  Box,
  Dropdown,
  DropdownListItem,
  Text,
  Icon,
} from '@citizenlab/cl2-component-library';

// utils
import { colors } from 'utils/styleUtils';
import clHistory from 'utils/cl-router/history';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';

// i18n
import { useIntl } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';
import messages from '../messages';

// typings
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';

interface Props {
  phases: IPhaseData[] | null;
  project: IProjectData;
  showDropdown: any;
}

const NewIdeaButtonDropdown = ({ phases, project, showDropdown }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Box
        color="white"
        background={colors.primary}
        borderRadius="3px"
        height="44px"
        px="16px"
        display="flex"
        id="e2e-new-idea"
        role="button"
        alignItems="center"
      >
        <Icon fill="white" marginRight="8px" name="idea" marginY="auto" />
        <Text
          mt="0"
          mb="0"
          padding="0"
          style={{ color: 'white' }}
          id="e2e-add-an-input"
        >
          {formatMessage(messages.addNewInput)}
        </Text>
      </Box>
      <Dropdown
        opened={showDropdown}
        content={<DropdownContent phases={phases} project={project} />}
      />
    </>
  );
};

interface DropdownContentProps {
  phases: IPhaseData[] | null;
  project: IProjectData;
}

const DropdownContent = ({ phases, project }: DropdownContentProps) => {
  const localize = useLocalize();

  if (!phases) return null;

  return (
    <>
      {phases.map((phase, i) => {
        const methodConfig = getMethodConfig(
          phase.attributes.participation_method
        );
        if (!methodConfig.showInputManager) return null;

        return (
          <DropdownListItem key={i}>
            <Box
              onClick={() => {
                clHistory.push(
                  `/projects/${project.attributes.slug}/ideas/new?phase_id=${phase.id}`
                );
              }}
              id={`e2e-phase-${phase.id}`}
            >
              <Text mt="0" mb="0" textAlign="left">
                {localize(phase.attributes.title_multiloc)}
              </Text>
            </Box>
          </DropdownListItem>
        );
      })}
    </>
  );
};

export default NewIdeaButtonDropdown;
