import React, { useMemo } from 'react';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import SSOButtons from './SSOButtons';

// hooks
import useLocale from 'hooks/useLocale';

// i18n
import { useIntl } from 'utils/cl-intl';
import sharedMessages from '../messages';
import messages from './messages';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object, boolean } from 'yup';
import Input from 'components/HookForm/Input';
import Checkbox from 'components/HookForm/Checkbox';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { Status, ErrorCode } from '../../typings';
import { SSOProvider } from 'services/singleSignOn';
import { Locale } from 'typings';

interface Props {
  status: Status;
  error: ErrorCode | null;
  onSubmit: (email: string, locale: Locale) => void;
  onSwitchToSSO: (ssoProvider: SSOProvider) => void;
}

interface FormValues {
  email: string;
  termsAndConditionsAccepted: boolean;
  privacyPolicyAccepted: boolean;
}

const DEFAULT_VALUES: Partial<FormValues> = {
  email: undefined,
  termsAndConditionsAccepted: false,
  privacyPolicyAccepted: false,
};

const EmailSignUp = ({ status, onSubmit, onSwitchToSSO }: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();

  const loading = status === 'pending';

  const schema = useMemo(
    () =>
      object({
        email: string()
          .email(formatMessage(messages.emailFormatError))
          .required(formatMessage(messages.emailMissingError)),
        termsAndConditionsAccepted: boolean().test(
          'Terms and conditions should be accepted',
          (value) => !!value
        ),
        privacyPolicyAccepted: boolean().test(
          'Privacy policy should be accepted',
          (value) => !!value
        ),
      }),
    [formatMessage]
  );

  const methods = useForm({
    mode: 'onBlur',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  if (isNilOrError(locale)) return null;

  const handleSubmit = ({ email }: FormValues) => {
    onSubmit(email, locale);
  };

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <Text mt="0px" mb="32px">
            {formatMessage(messages.enterYourEmailAddress)}
          </Text>
          <Box>
            <Input
              name="email"
              type="email"
              label={formatMessage(messages.email)}
            />
          </Box>
          <Box mt="24px">
            <Checkbox
              name="termsAndConditionsAccepted"
              label="I agree to the terms and conditions"
            />
            <Checkbox
              name="privacyPolicyAccepted"
              label="I agree to the privacy policy"
            />
          </Box>
          <Box w="100%" display="flex" mt="32px">
            <Button
              type="submit"
              width="auto"
              disabled={loading}
              processing={loading}
            >
              {formatMessage(sharedMessages.continue)}
            </Button>
          </Box>
          <SSOButtons onClickSSO={onSwitchToSSO} />
        </form>
      </FormProvider>
    </>
  );
};

export default EmailSignUp;
