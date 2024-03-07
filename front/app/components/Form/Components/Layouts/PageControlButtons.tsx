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

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  handleNextAndSubmit: () => void;
  handlePrevious: () => void;
  hasPreviousPage: boolean;
  currentStep: number;
  isLoading: boolean;
  showSubmit: boolean;
  dataCyValue: string;
  submitText: MessageDescriptor;
}

const PageControlButtons = ({
  handleNextAndSubmit,
  handlePrevious,
  hasPreviousPage,
  currentStep,
  isLoading,
  showSubmit,
  dataCyValue,
  submitText,
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
          zIndex="10000"
          position="fixed"
          borderRadius="2px"
        >
          <Box
            position="fixed"
            bottom={isSmallerThanPhone ? '0px' : '40px'}
            maxWidth="700px"
            width="100%"
            display="flex"
            justifyContent="flex-end"
            bgColor={colors.white}
            borderTop={`1px solid ${colors.borderLight}`}
            padding={isSmallerThanPhone ? '16px' : '16px 24px'}
          >
            <Box display="flex" justifyContent="center" alignItems="center">
              {hasPreviousPage && (
                <Button
                  onClick={handlePrevious}
                  data-cy="e2e-previous-page"
                  icon="chevron-left"
                  buttonStyle="white"
                  marginRight={isSmallerThanPhone ? '0px' : '16px'}
                >
                  <FormattedMessage {...messages.previous} />
                </Button>
              )}
              <Button
                onClick={handleNextAndSubmit}
                data-cy={dataCyValue}
                icon={showSubmit ? undefined : 'chevron-right'}
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
                  {...(showSubmit ? submitText : messages.next)}
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
