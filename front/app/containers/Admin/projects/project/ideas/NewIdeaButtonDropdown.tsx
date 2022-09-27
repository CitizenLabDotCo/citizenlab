import React from 'react';

// intl
import { injectIntl } from 'utils/cl-intl';
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';

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
import { getMethodConfig } from 'utils/participationMethodUtils';

// hooks & services
import useLocalize from 'hooks/useLocalize';
import { IProjectData } from 'services/projects';
import { IPhaseData } from 'services/phases';

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
}: Props & InjectedIntlProps) => {
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
                  >
                    <span color={colors.text}>
                      {localize(phase.attributes.title_multiloc)}
                    </span>
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
        background={colors.clBlueDark}
        borderRadius="3px"
        height="42px"
        px="16px"
        display="flex"
        id="e2e-new-idea"
      >
        <Icon
          fill="white"
          marginRight="8px"
          width="15px"
          name="idea"
          marginY="auto"
        />
        <Text margin="auto" padding="8px" style={{ color: 'white' }}>
          {formatMessage(messages.addNewInput)}
        </Text>
      </Box>
      <Dropdown opened={showDropdown} content={<DropdownContent />} />
    </>
  );
};

export default injectIntl(NewIdeaButtonDropdown);
