import React from 'react';

import {
  Box,
  Button,
  defaultStyles,
  useBreakpoint,
  colors,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import LanguageSelector from 'containers/MainHeader/Components/LanguageSelector';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  handleNextAndSubmit: () => void;
  handlePrevious: () => void;
  hasPreviousPage: boolean;
  currentStep: number;
  isLoading: boolean;
  showSubmit: boolean;
  dataCyValue: string;
}

const PageControlButtons = ({
  handleNextAndSubmit,
  handlePrevious,
  hasPreviousPage,
  currentStep,
  isLoading,
  showSubmit,
  dataCyValue,
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
        {hasPreviousPage && (
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
          data-cy={dataCyValue}
          icon={showSubmit ? 'send' : 'chevron-right'}
          iconPos="right"
          key={currentStep.toString()}
          bgColor={
            showSubmit
              ? theme.colors.tenantSecondary
              : theme.colors.tenantPrimary
          }
          boxShadow={defaultStyles.boxShadow}
          processing={isLoading}
        >
          <FormattedMessage
            {...(showSubmit ? messages.submit : messages.next)}
          />
        </Button>
      </Box>
    </Box>
  );
};

export default PageControlButtons;
