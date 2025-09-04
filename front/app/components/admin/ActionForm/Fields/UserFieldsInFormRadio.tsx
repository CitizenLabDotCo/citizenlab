import React from 'react';

import { Box, Radio, Text } from '@citizenlab/cl2-component-library';

import { PermittedBy } from 'api/phase_permissions/types';

interface Props {
  userFieldsInForm: boolean;
  permitted_by: PermittedBy;
  onChange: (userFieldsInForm: boolean) => void;
}

const UserFieldsInFormRadio = ({
  userFieldsInForm,
  permitted_by,
  onChange,
}: Props) => {
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
        disabled={permitted_by === 'everyone'}
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
