import React from 'react';

// components
import { Box, Input, Icon, Success } from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

// typings
import { UserFormData } from './typings';

interface Props {
  userFormData: UserFormData;
  setUserFormData: (userFormData: UserFormData) => void;
}

const BlackLabel = ({ text }: { text: string }) => (
  <span style={{ color: 'rgb(51,51,51)', fontWeight: 600 }}>{text}</span>
);

const UserForm = ({ userFormData, setUserFormData }: Props) => {
  const updateUserFormData = (newUserFormData: Partial<UserFormData>) => {
    setUserFormData({
      ...userFormData,
      ...newUserFormData,
    });
  };

  return (
    <Box
      w="90%"
      borderBottom={`1px solid ${colors.borderLight}`}
      mb="24px"
      pb="24px"
    >
      <Box>
        <Input
          type="email"
          value={userFormData.email}
          label={<BlackLabel text="Email" />}
          onChange={(email) => updateUserFormData({ email })}
        />
      </Box>
      {!userFormData.newUser && (
        <Box display="flex" alignItems="center" mt="12px">
          <Icon
            width="40px"
            height="40px"
            name="check-circle"
            fill={colors.success}
          />
          <Success
            text={
              'There is already an account associated with this email. This input will be added to it.'
            }
          />
        </Box>
      )}
      {userFormData.newUser && (
        <>
          <Box display="flex" alignItems="center" mt="12px">
            <Icon
              width="40px"
              height="40px"
              name="plus-circle"
              fill={colors.success}
            />
            <Success
              text={
                'A new account will be created with this email. This input will be added to it.'
              }
            />
          </Box>
          <Box mt="20px">
            <Input
              type="text"
              value={userFormData.first_name}
              label={<BlackLabel text="First name" />}
              onChange={(first_name) => updateUserFormData({ first_name })}
            />
          </Box>
          <Box mt="20px">
            <Input
              type="text"
              value={userFormData.last_name}
              label={<BlackLabel text="Last name" />}
              onChange={(last_name) => updateUserFormData({ last_name })}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default UserForm;
