import React, { useEffect, FormEvent } from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

import useCustomFieldsSchema from 'api/custom_fields_json_form_schema/useCustomFieldsSchema';
import { hasRequiredFields } from 'api/custom_fields_json_form_schema/utils';
import useAuthUser from 'api/me/useAuthUser';

import useLocale from 'hooks/useLocale';

import {
  AuthenticationData,
  SetError,
} from 'containers/Authentication/typings';

import Button from 'components/UI/Button';
import UserCustomFieldsForm from 'components/UserCustomFieldsForm';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';

import tracks from '../../tracks';

import messages from './messages';

interface Props {
  authenticationData: AuthenticationData;
  loading: boolean;
  setError: SetError;
  onSubmit: (id: string, formData: Record<string, any>) => Promise<void>;
  onSkip: () => void;
}

const CustomFields = ({
  authenticationData,
  loading,
  setError,
  onSubmit,
  onSkip,
}: Props) => {
  const { data: authUser } = useAuthUser();
  const locale = useLocale();
  const { data: userCustomFieldsSchema } = useCustomFieldsSchema(
    authenticationData.context
  );
  const smallerThanPhone = useBreakpoint('phone');
  const { formatMessage } = useIntl();

  useEffect(() => {
    trackEventByName(tracks.signUpCustomFieldsStepEntered);
  }, []);

  if (isNilOrError(authUser) || isNilOrError(userCustomFieldsSchema)) {
    return null;
  }

  const handleSubmit = async ({
    formData,
  }: {
    formData: Record<string, any>;
  }) => {
    try {
      await onSubmit(authUser.data.id, formData);
    } catch (e) {
      setError('unknown');
    }
  };

  const handleOnSubmitButtonClick = (event: FormEvent) => {
    event.preventDefault();
    eventEmitter.emit('customFieldsSubmitEvent');
  };

  if (isNilOrError(locale)) return null;

  return (
    <Box
      w="100%"
      pb={smallerThanPhone ? '14px' : '28px'}
      id="e2e-signup-custom-fields-container"
    >
      <UserCustomFieldsForm
        authUser={authUser.data}
        authenticationContext={authenticationData.context}
        onSubmit={handleSubmit}
      />

      <Box
        display="flex"
        flexDirection={smallerThanPhone ? 'column' : undefined}
        alignItems={smallerThanPhone ? 'stretch' : 'center'}
        justifyContent={smallerThanPhone ? 'center' : 'space-between'}
      >
        <Button
          id="e2e-signup-custom-fields-submit-btn"
          processing={loading}
          disabled={loading}
          text={formatMessage(messages.continue)}
          onClick={handleOnSubmitButtonClick}
        />

        {!hasRequiredFields(userCustomFieldsSchema, locale) && (
          <Button
            id="e2e-signup-custom-fields-skip-btn"
            buttonStyle="text"
            padding="0"
            textDecoration="underline"
            textDecorationHover="underline"
            processing={loading}
            onClick={onSkip}
            mt={smallerThanPhone ? '20px' : undefined}
            mb={smallerThanPhone ? '16px' : undefined}
          >
            {formatMessage(messages.skip)}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CustomFields;
