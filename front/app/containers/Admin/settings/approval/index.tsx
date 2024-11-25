import React from 'react';

import { IOption, Button, Box } from '@citizenlab/cl2-component-library';

import useUpdateUser from 'api/users/useUpdateUser';
import useUsers from 'api/users/useUsers';

import {
  Section,
  SectionDescription,
  SectionField,
  SectionTitle,
} from 'components/admin/Section';
import MultipleSelect from 'components/UI/MultipleSelect';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const Approval = () => {
  const [addedUsers, setAddedUsers] = React.useState<IOption[]>([]);
  const [removedUsers, setRemovedUsers] = React.useState<IOption[]>([]);
  const { formatMessage } = useIntl();
  const { mutate: updateUser } = useUpdateUser();
  const { data: adminUsers } = useUsers({
    can_admin: true,
  });

  const { data: approvers } = useUsers({
    can_approve: true,
  });

  if (!adminUsers || !approvers) return null;

  const options = adminUsers.data.map((user) => ({
    value: user.id,
    label: `${user.attributes.first_name} ${user.attributes.last_name}`,
  }));

  const selectedOptions = approvers.data.map((user) => ({
    value: user.id,
    label: `${user.attributes.first_name} ${user.attributes.last_name}`,
  }));

  const handleChange = (value: IOption[]) => {
    const removedUsers = selectedOptions.filter(
      (selectedOption) =>
        !value.find((option) => option.value === selectedOption.value)
    );

    const addedUsers = value.filter(
      (option) =>
        !selectedOptions.find(
          (selectedOption) => selectedOption.value === option.value
        )
    );

    setAddedUsers((users) => [...users, ...addedUsers]);
    setRemovedUsers((users) => [...users, ...removedUsers]);
  };

  const handleSave = () => {
    if (removedUsers.length) {
      removedUsers.forEach((user) => {
        updateUser({
          userId: user.value,
          roles: [
            {
              type: 'admin',
              approver: false,
            },
          ],
        });
      });
    }

    if (addedUsers.length) {
      addedUsers.forEach((user) => {
        updateUser({
          userId: user.value,
          roles: [
            {
              type: 'admin',
              approver: true,
            },
          ],
        });
      });
    }

    setAddedUsers([]);
    setRemovedUsers([]);
  };

  return (
    <Box>
      <Section>
        <SectionTitle>{formatMessage(messages.approvalTitle)}</SectionTitle>
        <SectionDescription>
          {formatMessage(messages.approvalSubtitle)}
        </SectionDescription>
        <SectionField>
          <MultipleSelect
            value={selectedOptions}
            onChange={handleChange}
            options={options}
            label={formatMessage(messages.selectApprovers)}
          />
        </SectionField>
        <Box display="flex" mt="20px">
          <Button buttonStyle="admin-dark" onClick={handleSave}>
            {formatMessage(messages.save)}
          </Button>
        </Box>
      </Section>
    </Box>
  );
};

export default Approval;
