import React from 'react';

// components
import { Text } from '@citizenlab/cl2-component-library';
import PoliciesMarkup from './PoliciesMarkup';
import Button from 'components/UI/Button';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import sharedMessages from '../messages';
import authProvidersMessages from 'containers/NewAuthModal/steps/AuthProviders/messages';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, boolean } from 'yup';

// typings
import { Status } from '../../typings';

export const ConsentText = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  line-height: 21px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  a {
    color: ${colors.textSecondary};
    font-weight: 400;
    text-decoration: underline;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;

    &:hover {
      color: #000;
      text-decoration: underline;
    }
  }
`;

const DEFAULT_VALUES = {
  termsAndConditionsAccepted: false,
  privacyPolicyAccepted: false,
} as const;

const isTruthy = (value?: boolean) => !!value;

interface Props {
  status: Status;
  onSubmit: () => void;
}

const PoliciesForm = ({ status, onSubmit }: Props) => {
  const { formatMessage } = useIntl();

  const schema = object({
    termsAndConditionsAccepted: boolean().test(
      '',
      formatMessage(authProvidersMessages.tacError),
      isTruthy
    ),
    privacyPolicyAccepted: boolean().test(
      '',
      formatMessage(authProvidersMessages.privacyPolicyNotAcceptedError),
      isTruthy
    ),
  });

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  const loading = status === 'pending';

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Text mt="0px" mb="32px">
          {formatMessage(messages.reviewTheTerms)}
        </Text>
        <PoliciesMarkup />
        <Button
          mt="32px"
          type="submit"
          width="100%"
          disabled={loading}
          processing={loading}
        >
          {formatMessage(sharedMessages.continue)}
        </Button>
      </form>
    </FormProvider>
  );
};

export default PoliciesForm;
