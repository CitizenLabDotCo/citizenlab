import React, { useEffect, useState } from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

import useCustomFieldsSchema from 'api/custom_fields_json_form_schema/useCustomFieldsSchema';
import { hasRequiredNonLockedFields } from 'api/custom_fields_json_form_schema/utils';
import useAuthUser from 'api/me/useAuthUser';

import useLocale from 'hooks/useLocale';

import {
  AuthenticationData,
  SetError,
} from 'containers/Authentication/typings';

import FormWrapper from 'components/Form/Components/FormWrapper';
import { isValidData, customAjv } from 'components/Form/utils';
import Button from 'components/UI/Button';
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
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showAllErrors, setShowAllErrors] = useState(false);

  useEffect(() => {
    trackEventByName(tracks.signUpCustomFieldsStepEntered);
  }, []);

  const schema =
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    userCustomFieldsSchema?.data.attributes?.json_schema_multiloc[locale];
  const uiSchema =
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    userCustomFieldsSchema?.data.attributes?.ui_schema_multiloc[locale];

  if (!authUser || !userCustomFieldsSchema || !schema || !uiSchema) {
    return null;
  }

  const handleSubmit = async () => {
    if (!isValidData(schema, uiSchema, formData, customAjv)) {
      setShowAllErrors(true);
    } else {
      try {
        await onSubmit(authUser.data.id, formData);
      } catch (e) {
        setError('unknown');
      }
    }
  };

  const allowSkip = !hasRequiredNonLockedFields(userCustomFieldsSchema, locale);

  return (
    <Box
      w="100%"
      pb={smallerThanPhone ? '14px' : '28px'}
      id="e2e-signup-custom-fields-container"
    >
      {/* TODO: Fix this the next time the file is edited. */}
      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
      <FormWrapper formId={uiSchema?.options?.formId}>
        <UserCustomFieldsForm
          authenticationContext={authenticationData.context}
          showAllErrors={showAllErrors}
          setShowAllErrors={setShowAllErrors}
          onChange={setFormData}
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
            onClick={handleSubmit}
          />

          {allowSkip && (
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
      </FormWrapper>
    </Box>
  );
};

export default CustomFields;
