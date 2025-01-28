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

import LanguageSelector from 'containers/MainHeader/Components/LanguageSelector';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

import messages from '../../messages';

type PageVariant = 'other' | 'submission' | 'after-submission';

const CY_DATA_VALUES: Record<PageVariant, string> = {
  other: 'e2e-next-page',
  submission: 'e2e-submit-form',
  'after-submission': 'e2e-after-submission',
};

const ICON_VALUES: Record<PageVariant, IconNames> = {
  other: 'chevron-right',
  submission: 'send',
  'after-submission': 'check',
};

const BUTTON_MESSAGES: Record<PageVariant, MessageDescriptor> = {
  other: messages.next,
  submission: messages.submit,
  'after-submission': messages.backToProject,
};

interface Props {
  handleNextAndSubmit: () => void;
  handlePrevious: () => void;
  hasPreviousPage: boolean;
  isLoading: boolean;
  pageVariant: PageVariant;
}

const PageControlButtons = ({
  handleNextAndSubmit,
  handlePrevious,
  hasPreviousPage,
  isLoading,
  pageVariant,
}: Props) => {
  const theme = useTheme();
  const isSmallerThanPhone = useBreakpoint('phone');

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
        {' '}
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
          bgColor={
            pageVariant === 'submission'
              ? theme.colors.tenantSecondary
              : theme.colors.tenantPrimary
          }
          boxShadow={defaultStyles.boxShadow}
          processing={isLoading}
        >
          <FormattedMessage {...BUTTON_MESSAGES[pageVariant]} />
        </Button>
      </Box>
    </Box>
  );
};

export default PageControlButtons;
