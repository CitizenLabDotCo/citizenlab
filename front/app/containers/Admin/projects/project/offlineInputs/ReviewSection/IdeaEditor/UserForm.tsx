import React from 'react';

// components
import { Box, Input } from '@citizenlab/cl2-component-library';
// import Input from 'components/HookForm/Input';

// typings
import { UserFormData } from './typings';

interface Props {
  userFormData: UserFormData;
  setUserFormData: (newData: Partial<UserFormData>) => void;
}

const UserForm = ({ userFormData, setUserFormData }: Props) => {
  return (
    <Box>
      <Box>
        <Input
          type="email"
          value={userFormData.email}
          label="Email"
          onChange={(email) => setUserFormData({ email })}
        />
      </Box>
      {userFormData.newUser && (
        <>
          <Box mt="12px">
            <Input
              type="text"
              value={userFormData.first_name}
              label="First name"
              onChange={(first_name) => setUserFormData({ first_name })}
            />
          </Box>
          <Box mt="12px">
            <Input
              type="text"
              value={userFormData.last_name}
              label="Last name"
              onChange={(last_name) => setUserFormData({ last_name })}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default UserForm;
