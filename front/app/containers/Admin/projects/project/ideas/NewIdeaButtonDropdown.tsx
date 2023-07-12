import React from 'react';

// intl
import { injectIntl } from 'utils/cl-intl';
import messages from '../messages';
import { WrappedComponentProps } from 'react-intl';

// components
import {
  Box,
  Dropdown,
  DropdownListItem,
  Text,
  Icon,
} from '@citizenlab/cl2-component-library';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { colors } from 'utils/styleUtils';
import clHistory from 'utils/cl-router/history';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';

// hooks & services
import useLocalize from 'hooks/useLocalize';
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';

interface Props {
  phases: IPhaseData[] | null;
  project: IProjectData;
  showDropdown: any;
}

const NewIdeaButtonDropdown = ({
  phases,
  project,
  showDropdown,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const DropdownContent = () => {
    const localize = useLocalize();
    if (!isNilOrError(phases)) {
      return (
        <>
          {phases.map((phase, i) => (
            <>
              {getMethodConfig(phase.attributes.participation_method)
                .showInputManager && (
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
              )}
            </>
          ))}
        </>
      );
    }
    return null;
  };

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
      <Dropdown opened={showDropdown} content={<DropdownContent />} />
    </>
  );
};

export default injectIntl(NewIdeaButtonDropdown);
