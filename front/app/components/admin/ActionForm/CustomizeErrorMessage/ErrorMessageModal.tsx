import React, { useState } from 'react';

import {
  Box,
  Title,
  Button,
  Text,
  LocaleSwitcher,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { Multiloc, SupportedLocale } from 'typings';
import { object } from 'yup';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

import accessDeniedMessages from 'containers/Authentication/steps/AccessDenied/messages';

import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import Modal from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';
import useFormatMessageWithLocale from 'utils/cl-intl/useFormatMessageWithLocale';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

import messages from './messages';

interface FormValues {
  access_denied_explanation_multiloc?: Multiloc;
}

interface Props {
  opened: boolean;
  access_denied_explanation_multiloc?: Multiloc;
  onClose: () => void;
  onSubmit: (formValues: FormValues) => Promise<void>;
}

const ErrorMessageModal = ({
  opened,
  access_denied_explanation_multiloc,
  onClose,
  onSubmit,
}: Props) => {
  const [selectedLocale, setSelectedLocale] = useState<SupportedLocale>(
    useLocale()
  );
  const formatMessageWithLocale = useFormatMessageWithLocale();
  const locales = useAppConfigurationLocales();

  const schema = object({
    access_denied_explanation_multiloc: object(),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues: { access_denied_explanation_multiloc },
    resolver: yupResolver(schema),
  });

  const handleSubmit = async (formValues: FormValues) => {
    try {
      await onSubmit(formValues);
      onClose();
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  if (!locales) return null;

  return (
    <Modal
      opened={opened}
      close={onClose}
      niceHeader={true}
      header={
        <Title ml="20px" variant="h3" color="primary">
          <FormattedMessage {...messages.customizeErrorMessage} />
        </Title>
      }
      closeOnClickOutside={false}
      width={'550px'}
    >
      <Box m="20px">
        <Text mt="0px">
          <FormattedMessage {...messages.defaultErrorMessageExplanation} />
        </Text>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Box width="auto">
            <LocaleSwitcher
              selectedLocale={selectedLocale}
              locales={locales}
              onSelectedLocaleChange={(locale: SupportedLocale) =>
                setSelectedLocale(locale)
              }
            />
          </Box>
          <Text fontSize="s">
            {formatMessageWithLocale(
              selectedLocale,
              accessDeniedMessages.youDoNotMeetTheRequirements
            )}
          </Text>
          <Text mb="40px" mt="0px">
            <FormattedMessage {...messages.customizeErrorMessageExplanation} />
          </Text>
        </Box>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSubmit)}>
            <QuillMultilocWithLocaleSwitcher
              label={<FormattedMessage {...messages.alternativeErrorMessage} />}
              name="access_denied_explanation_multiloc"
            />
            <Box display="flex" mt="20px">
              <Button
                buttonStyle="admin-dark"
                type="submit"
                processing={methods.formState.isSubmitting}
              >
                <FormattedMessage {...messages.saveErrorMessage} />
              </Button>
            </Box>
          </form>
        </FormProvider>
      </Box>
    </Modal>
  );
};

export default ErrorMessageModal;
