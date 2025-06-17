import React from 'react';

import {
  Box,
  Button,
  defaultStyles,
  useBreakpoint,
  colors,
  IconNames,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';
import { Multiloc } from 'typings';

import useAuthUser from 'api/me/useAuthUser';
import { IPhaseData } from 'api/phases/types';
import { getInputTerm } from 'api/phases/utils';

import useLocalize from 'hooks/useLocalize';

import LanguageSelector from 'containers/MainHeader/Components/LanguageSelector';

import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import messages from '../../messages';

type PageVariant = 'other' | 'submission' | 'after-submission';

const CY_DATA_VALUES: Record<PageVariant, string> = {
  other: 'e2e-next-page',
  submission: 'e2e-submit-form',
  'after-submission': 'e2e-after-submission',
};

const ICON_VALUES: Record<PageVariant, IconNames | undefined> = {
  other: 'chevron-right',
  submission: 'send',
  'after-submission': undefined,
};

const BUTTON_MESSAGES: Record<PageVariant, MessageDescriptor> = {
  other: messages.next,
  submission: messages.submit,
  'after-submission': messages.backToProject,
};

const inputTermMessages: Record<string, MessageDescriptor> = {
  idea: messages.viewYourIdea,
  option: messages.viewYourOption,
  project: messages.viewYourProject,
  question: messages.viewYourQuestion,
  issue: messages.viewYourIssue,
  contribution: messages.viewYourContribution,
  proposal: messages.viewYourProposal,
  petition: messages.viewYourPetition,
  initiative: messages.viewYourInitiative,
};

interface Props {
  handleNextAndSubmit: () => void;
  handlePrevious: () => void;
  hasPreviousPage: boolean;
  isLoading: boolean;
  pageVariant: PageVariant;
  phases: IPhaseData[] | undefined;
  currentPhase: IPhaseData | undefined;
  pageButtonLabelMultiloc?: Multiloc;
}

const PageControlButtons = ({
  handleNextAndSubmit,
  handlePrevious,
  hasPreviousPage,
  isLoading,
  pageVariant,
  phases,
  pageButtonLabelMultiloc,
  currentPhase,
}: Props) => {
  const theme = useTheme();
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const isSmallerThanPhone = useBreakpoint('phone');
  const { data: authUser } = useAuthUser();
  const isUserAdmin = authUser && isAdmin(authUser);

  const getButtonMessage = () => {
    if (pageVariant !== 'after-submission') {
      return formatMessage(BUTTON_MESSAGES[pageVariant]);
    }

    const customLabel = localize(pageButtonLabelMultiloc);
    if (customLabel) {
      return customLabel;
    }

    const participationMethod = currentPhase?.attributes.participation_method;

    if (participationMethod === 'common_ground') {
      // We redirect admins to the input manager to easily manage inputs
      // and users to their own input.
      const messageKey = isUserAdmin
        ? messages.backToInputManager
        : messages.viewYourInput;
      return formatMessage(messageKey);
    }

    if (participationMethod === 'native_survey') {
      return formatMessage(messages.backToProject);
    }

    const inputTerm = getInputTerm(phases, currentPhase);
    return formatMessage(inputTermMessages[inputTerm]);
  };

  return (
    <Box
      width="100%"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      bgColor={colors.white}
      px={isSmallerThanPhone ? '16px' : '24px'}
      py={'16px'}
    >
      <Box>
        {/* We wrap it in a Box here to maintain the spacing and keep the next buttons right-aligned when the language selector is empty, preventing the need to move the locale check logic here. */}
        <LanguageSelector
          dropdownClassName={'open-upwards'}
          useDefaultTop={false}
          mobileRight="auto"
          mobileLeft="auto"
          right="auto"
          afterSelection={() => {
            window.location.reload();
          }}
        />
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center">
        {hasPreviousPage && pageVariant !== 'after-submission' && (
          <Button
            onClick={handlePrevious}
            data-cy="e2e-previous-page"
            icon="chevron-left"
            buttonStyle="primary-outlined"
            marginRight={isSmallerThanPhone ? '8px' : '16px'}
          >
            <FormattedMessage {...messages.previous} />
          </Button>
        )}
        <Button
          onClick={handleNextAndSubmit}
          data-cy={CY_DATA_VALUES[pageVariant]}
          icon={ICON_VALUES[pageVariant]}
          iconPos="right"
          bgColor={theme.colors.tenantPrimary}
          boxShadow={defaultStyles.boxShadow}
          processing={isLoading}
        >
          {getButtonMessage()}
        </Button>
      </Box>
    </Box>
  );
};

export default PageControlButtons;
