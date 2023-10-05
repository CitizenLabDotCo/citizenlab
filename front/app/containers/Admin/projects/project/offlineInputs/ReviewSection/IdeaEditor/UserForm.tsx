import React from 'react';

// components
import {
  Box,
  Input,
  Icon,
  Success,
  Checkbox,
  Text,
} from '@citizenlab/cl2-component-library';
import AuthorInput from './AuthorInput';

// styling
import { colors } from 'utils/styleUtils';

// typings
import { UserFormData } from './typings';
import { SelectedAuthor } from './AuthorInput/typings';

interface Props {
  userFormData: UserFormData;
  setUserFormData: (
    getUserFormData: (oldData: UserFormData) => UserFormData
  ) => void;
}

const BlackLabel = ({ text }: { text: string }) => (
  <span style={{ color: 'rgb(51,51,51)', fontWeight: 600 }}>{text}</span>
);

const UserForm = ({ userFormData, setUserFormData }: Props) => {
  const updateUserFormData = (newData: Partial<UserFormData>) => {
    setUserFormData((oldData) => ({
      ...oldData,
      ...newData,
    }));
  };

  const handleSelect = (selectedAuthor: SelectedAuthor) => {
    if (selectedAuthor.user_state === 'invalid-email') {
      updateUserFormData({
        user_state: 'invalid-email',
        email: selectedAuthor.email,
        user_id: undefined,
      });

      return;
    }

    if (selectedAuthor.user_state === 'new-user') {
      updateUserFormData({
        user_state: 'new-user',
        email: selectedAuthor.email,
        user_id: undefined,
      });
      return;
    }

    updateUserFormData({
      user_state: 'existing-user',
      email: selectedAuthor.email,
      user_id: selectedAuthor.id,
    });
  };

  return (
    <Box
      w="90%"
      borderBottom={`1px solid ${colors.borderLight}`}
      mb="24px"
      pb="24px"
    >
      {userFormData.consent ? (
        <Box>
          <Box>
            <AuthorInput
              selectedAuthor={{
                user_state: userFormData.user_state,
                email: userFormData.email,
                id: userFormData.user_id,
              }}
              onSelect={handleSelect}
            />
          </Box>
          {userFormData.user_state === 'existing-user' && (
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
          {['new-user', 'invalid-email'].includes(userFormData.user_state) && (
            <>
              {userFormData.user_state === 'new-user' && (
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
              )}
              {userFormData.user_state === 'invalid-email' && (
                <Box display="flex" alignItems="center" mt="12px">
                  <Text color="orange" mb="15px">
                    Please enter a valid email address.
                  </Text>
                </Box>
              )}
              <Box mt="20px">
                <Input
                  type="text"
                  value={userFormData.first_name}
                  label={<BlackLabel text="First name" />}
                  onChange={(first_name) => updateUserFormData({ first_name })}
                />
              </Box>
              <Box mt="20px" mb="20px">
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
      ) : null}
      <Box mt="8px">
        <Checkbox
          checked={userFormData.consent}
          onChange={() =>
            updateUserFormData({ consent: !userFormData.consent })
          }
          label="User consent (create user account)"
        />
      </Box>
    </Box>
  );
};

export default UserForm;
