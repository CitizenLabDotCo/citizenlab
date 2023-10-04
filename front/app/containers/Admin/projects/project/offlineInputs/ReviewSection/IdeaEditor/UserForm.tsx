import React, { useState } from 'react';

// components
import {
  Box,
  Input,
  Icon,
  Success,
  Checkbox,
} from '@citizenlab/cl2-component-library';
import AuthorSelect from './AuthorSelect';

// styling
import { colors } from 'utils/styleUtils';

// typings
import { UserFormData } from './typings';
import { SelectedAuthor } from './AuthorSelect/typings';

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
  const [exitingUserId, setExistingUserId] = useState<string>();

  const updateUserFormData = (newData: Partial<UserFormData>) => {
    setUserFormData((oldData) => ({
      ...oldData,
      ...newData,
    }));
  };

  const handleSelect = (selectedAuthor?: SelectedAuthor) => {
    if (!selectedAuthor) {
      updateUserFormData({ newUser: true, email: undefined });
      setExistingUserId(undefined);
      return;
    }

    if (selectedAuthor.newUser) {
      updateUserFormData({ newUser: true, email: selectedAuthor.email });
      setExistingUserId(undefined);
      return;
    }

    updateUserFormData({
      newUser: false,
      email: selectedAuthor.email,
    });
    setExistingUserId(selectedAuthor.id);
  };

  const handleSearch = (searchTerm: string) => {
    setExistingUserId(undefined);
    updateUserFormData({ email: searchTerm, newUser: true });
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
            <AuthorSelect
              selectedAuthor={
                userFormData.newUser === true
                  ? { newUser: true, email: userFormData.email }
                  : {
                      newUser: false,
                      email: userFormData.email,
                      id: exitingUserId ?? undefined,
                    }
              }
              onSelect={handleSelect}
              onSearch={handleSearch}
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
      ) : null}
      <Box mt="20px">
        <Checkbox
          checked={userFormData.consent}
          onChange={() =>
            updateUserFormData({ consent: !userFormData.consent })
          }
          label="User consent"
        />
      </Box>
    </Box>
  );
};

export default UserForm;
