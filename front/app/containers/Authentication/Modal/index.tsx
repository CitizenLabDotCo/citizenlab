import React from 'react';

import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocalize from 'hooks/useLocalize';

import T from 'components/T';
import Error from 'components/UI/Error';
import Modal from 'components/UI/Modal';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { useIntl, FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import {
  getHeaderMessage,
  HELPER_TEXT_KEYS,
  ERROR_CODE_MESSAGES,
} from '../messageUtils';
import TextButton from '../steps/_components/TextButton';
import useSteps from '../useSteps';

import CurrentStep from './CurrentStep';

const AuthModal = () => {
  const {
    currentStep,
    state,
    loading,
    error,
    authenticationData,
    transition,
    setError,
  } = useSteps();

  const { data: appConfiguration } = useAppConfiguration();
  const theme = useTheme();

  const smallerThanPhone = useBreakpoint('phone');
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const closable = currentStep !== 'closed' && currentStep !== 'success';

  const {
    context: { action },
  } = authenticationData;
  const headerMessage = getHeaderMessage(currentStep, action);

  const handleClose = () => {
    if (!closable) return;
    transition(currentStep, 'CLOSE')();
  };

  const marginX = smallerThanPhone ? '16px' : '32px';

  const helperTextKey = HELPER_TEXT_KEYS[currentStep];
  const helperText = helperTextKey
    ? appConfiguration?.data.attributes.settings.core[helperTextKey]
    : undefined;

  const localizedHelperText = localize(helperText);

  const showHelperText =
    helperText && localizedHelperText && localizedHelperText.length > 0;

  return (
    <Modal
      zIndex={10000001}
      width="580px"
      opened={currentStep !== 'closed'}
      close={handleClose}
      hideCloseButton={!closable}
      closeOnClickOutside={false}
      header={
        headerMessage ? (
          <Title variant="h3" as="h1" mt="0px" mb="0px" ml={marginX}>
            {formatMessage(headerMessage)}
          </Title>
        ) : undefined
      }
      niceHeader
    >
      <Box id="e2e-authentication-modal" px={marginX} py="32px" w="100%">
        {error && (
          <Box mb="16px">
            <Error
              text={
                <FormattedMessage
                  {...ERROR_CODE_MESSAGES[error]}
                  values={{
                    br: <br />,
                    createAnAccountLink: (
                      <TextButton
                        onClick={
                          currentStep === 'email:password'
                            ? transition(currentStep, 'GO_BACK')
                            : undefined
                        }
                      >
                        {formatMessage(messages.createAnAccountLink)}
                      </TextButton>
                    ),
                  }}
                />
              }
            />
          </Box>
        )}
        {showHelperText && (
          <Box mb="20px">
            <QuillEditedContent
              textColor={theme.colors.tenantText}
              fontSize="base"
            >
              <T value={helperText} supportHtml />
            </QuillEditedContent>
          </Box>
        )}
        <CurrentStep
          currentStep={currentStep}
          state={state}
          loading={loading}
          authenticationData={authenticationData}
          transition={transition}
          setError={setError}
        />
      </Box>
    </Modal>
  );
};

export default AuthModal;
