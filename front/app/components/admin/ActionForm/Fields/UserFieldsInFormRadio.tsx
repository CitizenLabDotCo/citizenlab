import React from 'react';

import { Box, Radio, Text } from '@citizenlab/cl2-component-library';

interface Props {
  userFieldsInForm: boolean;
  onChange: (userFieldsInForm: boolean) => void;
}

const UserFieldsInFormRadio = ({ userFieldsInForm, onChange }: Props) => {
  return (
    <Box pt="16px">
      <Radio
        name="user_fields_in_registration_flow"
        value={false}
        currentValue={userFieldsInForm}
        label={
          <Text color="primary" m="0">
            Include demographic questions in{' '}
            <span style={{ fontWeight: 'bold' }}>registration flow</span>
          </Text>
        }
        onChange={onChange}
      />
      <Radio
        name="user_fields_in_form"
        value={true}
        currentValue={userFieldsInForm}
        label={
          <Text color="primary" m="0">
            Include demographic questions as{' '}
            <span style={{ fontWeight: 'bold' }}>last page of the survey</span>
          </Text>
        }
        onChange={onChange}
        mr="8px"
      />
    </Box>
  );
};

export default UserFieldsInFormRadio;
