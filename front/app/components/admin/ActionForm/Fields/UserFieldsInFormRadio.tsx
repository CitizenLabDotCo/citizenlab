import React from 'react';

import { Box, Radio, Text } from '@citizenlab/cl2-component-library';

import { UserFieldsInFormFrontendDescriptor } from 'api/phases/types';

interface Props {
  user_fields_in_form_frontend_descriptor: UserFieldsInFormFrontendDescriptor;
  onChange: (userFieldsInForm: boolean) => void;
}

const UserFieldsInFormRadio = ({
  user_fields_in_form_frontend_descriptor,
  onChange,
}: Props) => {
  const { value, locked } = user_fields_in_form_frontend_descriptor;

  return (
    <Box pt="16px">
      <Radio
        name="user_fields_in_registration_flow"
        value={false}
        currentValue={value}
        label={
          <Text color="primary" m="0">
            Include demographic questions in{' '}
            <span style={{ fontWeight: 'bold' }}>registration flow</span>
          </Text>
        }
        onChange={onChange}
        disabled={!!locked}
      />
      <Radio
        name="user_fields_in_form"
        value={true}
        currentValue={value}
        label={
          <Text color="primary" m="0">
            Include demographic questions as{' '}
            <span style={{ fontWeight: 'bold' }}>last page of the survey</span>
          </Text>
        }
        onChange={onChange}
        mr="8px"
        disabled={!!locked}
      />
    </Box>
  );
};

export default UserFieldsInFormRadio;
