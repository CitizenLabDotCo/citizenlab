import React from 'react';

import {
  Box,
  Button,
  defaultStyles,
  useBreakpoint,
  colors,
} from '@citizenlab/cl2-component-library';
import { createPortal } from 'react-dom';
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
  const modalPortalElement = document.getElementById('modal-portal');
  const theme = useTheme();
  const isSmallerThanPhone = useBreakpoint('phone');

  return modalPortalElement
    ? createPortal(
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="center"
          w="100%"
          zIndex="1010"
          position="fixed"
          borderRadius="2px"
        >
          <Box
            position="fixed"
            bottom={isSmallerThanPhone ? '0px' : '40px'}
            maxWidth="700px"
            width="100%"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            bgColor={colors.white}
            borderTop={`1px solid ${colors.borderLight}`}
            padding={isSmallerThanPhone ? '16px' : '16px 24px'}
          >
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
            <Box display="flex" justifyContent="center" alignItems="center">
              {hasPreviousPage && (
                <Button
                  onClick={handlePrevious}
                  data-cy="e2e-previous-page"
                  icon="chevron-left"
                  buttonStyle="white"
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
        </Box>,
        modalPortalElement
      )
    : null;
};

export default PageControlButtons;
