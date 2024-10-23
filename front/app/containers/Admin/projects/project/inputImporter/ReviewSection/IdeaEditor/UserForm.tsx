import React from 'react';

import {
  Box,
  Input,
  Icon,
  Success,
  CheckboxWithLabel,
  Error,
  colors,
} from '@citizenlab/cl2-component-library';

import { isUserFormDataValid } from 'containers/Admin/projects/project/inputImporter/ReviewSection/IdeaEditor/utils';

import { useIntl } from 'utils/cl-intl';

import AuthorInput from './AuthorInput';
import { SelectedAuthor } from './AuthorInput/typings';
import messages from './messages';
import { UserFormData } from './typings';

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
  const { formatMessage } = useIntl();

  const updateUserFormData = (newData: Partial<UserFormData>) => {
    setUserFormData((oldData) => {
      const updatedData = {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        ...(oldData ? oldData : userFormData),
        ...newData,
      };
      if (updatedData.user_state !== 'existing-user') {
        // Change the state if the form is now valid
        updatedData.user_state = isUserFormDataValid(updatedData)
          ? 'new-imported-user'
          : 'no-user';
      }
      return updatedData;
    });
  };

  const handleSelect = (selectedAuthor: SelectedAuthor) => {
    if (selectedAuthor.user_state === 'no-user') {
      updateUserFormData({
        user_state: 'no-user',
        email: undefined,
        user_id: undefined,
      });
      return;
    }

    if (selectedAuthor.user_state === 'new-imported-user') {
      updateUserFormData({
        user_state: 'new-imported-user',
        email: selectedAuthor.email,
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
          {userFormData.user_state === 'new-imported-user' && (
            <Box display="flex" alignItems="center" mb="12px">
              <Icon
                width="40px"
                height="40px"
                name="plus-circle"
                fill={colors.success}
              />
              <Success
                text={formatMessage(messages.aNewAccountWillBeCreated)}
              />
            </Box>
          )}
          {userFormData.user_state === 'existing-user' && (
            <Box display="flex" alignItems="center" mb="12px">
              <Icon
                width="40px"
                height="40px"
                name="check-circle"
                fill={colors.success}
              />
              <Success text={formatMessage(messages.thereIsAlreadyAnAccount)} />
            </Box>
          )}
          {userFormData.user_state === 'no-user' && (
            <Box display="flex" alignItems="center" mb="12px">
              <Error text={formatMessage(messages.pleaseEnterValidUser)} />
            </Box>
          )}
          <Box>
            <AuthorInput
              selectedAuthor={{
                user_state: userFormData.user_state,
                email: userFormData.email,
                first_name: userFormData.first_name,
                last_name: userFormData.last_name,
                id: userFormData.user_id,
              }}
              onSelect={handleSelect}
            />
          </Box>
          {['new-imported-user', 'no-user'].includes(
            userFormData.user_state
          ) && (
            <>
              <Box mt="20px">
                <Input
                  type="text"
                  value={userFormData.first_name}
                  label={
                    <BlackLabel text={formatMessage(messages.firstName)} />
                  }
                  onChange={(first_name) => updateUserFormData({ first_name })}
                />
              </Box>
              <Box mt="20px" mb="20px">
                <Input
                  type="text"
                  value={userFormData.last_name}
                  label={<BlackLabel text={formatMessage(messages.lastName)} />}
                  onChange={(last_name) => updateUserFormData({ last_name })}
                />
              </Box>
            </>
          )}
        </Box>
      ) : null}
      <Box mt="8px">
        <CheckboxWithLabel
          checked={userFormData.consent}
          onChange={() =>
            updateUserFormData({ consent: !userFormData.consent })
          }
          label={formatMessage(messages.userConsent)}
        />
      </Box>
    </Box>
  );
};

export default UserForm;
