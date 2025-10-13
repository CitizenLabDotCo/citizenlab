import React, { useEffect, useState } from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import usePermissionsCustomFields from 'api/permissions_custom_fields/usePermissionsCustomFields';

import {
  AuthenticationData,
  SetError,
} from 'containers/Authentication/typings';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import UserCustomFieldsForm from 'components/UserCustomFields';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

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
  // setError,
  // onSubmit,
  onSkip,
}: Props) => {
  const { data: authUser } = useAuthUser();
  // const locale = useLocale();
  const { data: customFields } = usePermissionsCustomFields(
    authenticationData.context
  );
  const smallerThanPhone = useBreakpoint('phone');
  const { formatMessage } = useIntl();
  const [_formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    trackEventByName(tracks.signUpCustomFieldsStepEntered);
  }, []);

  if (!authUser || !customFields) {
    return null;
  }

  const handleSubmit = async () => {
    // if (!customAjv.validate(schema, formData)) {
    //   setShowAllErrors(true);
    // } else {
    //   try {
    //     await onSubmit(authUser.data.id, formData);
    //   } catch (e) {
    //     setError('unknown');
    //   }
    // }
  };
  const allowSkip =
    !customFields.some((field) => field.required) &&
    !customFields.some((field) => field.constraints?.locked === true);

  return (
    <Box
      w="100%"
      pb={smallerThanPhone ? '14px' : '28px'}
      id="e2e-signup-custom-fields-container"
    >
      <UserCustomFieldsForm
        authenticationContext={authenticationData.context}
        onChange={setFormData}
      />

      <Box
        display="flex"
        flexDirection={smallerThanPhone ? 'column' : undefined}
        alignItems={smallerThanPhone ? 'stretch' : 'center'}
        justifyContent={smallerThanPhone ? 'center' : 'space-between'}
      >
        <ButtonWithLink
          id="e2e-signup-custom-fields-submit-btn"
          processing={loading}
          disabled={loading}
          text={formatMessage(messages.continue)}
          onClick={handleSubmit}
        />

        {allowSkip && (
          <ButtonWithLink
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
          </ButtonWithLink>
        )}
      </Box>
      {/* </FormWrapper> */}
    </Box>
  );
};

export default CustomFields;
