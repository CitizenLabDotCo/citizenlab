import React from 'react';

import { IOption } from '@citizenlab/cl2-component-library';

import useUpdateUser from 'api/users/useUpdateUser';
import useUsers from 'api/users/useUsers';

import MultipleSelect from 'components/UI/MultipleSelect';

const Approval = () => {
  const { mutate: updateUser } = useUpdateUser();
  const { data: adminUsers } = useUsers({
    can_admin: true,
  });

  const { data: approvers } = useUsers({
    can_approve: true,
  });

  if (!adminUsers) return null;

  const options = adminUsers.data.map((user) => ({
    value: user.id,
    label: `${user.attributes.first_name} ${user.attributes.last_name}`,
  }));

  const selectedOptions = approvers?.data.map((user) => ({
    value: user.id,
    label: `${user.attributes.first_name} ${user.attributes.last_name}`,
  }));

  const handleChange = (value: IOption[]) => {
    const removedUsers = (selectedOptions || []).filter(
      (selectedOption) =>
        !value.find((option) => option.value === selectedOption.value)
    );

    const addedUsers = value.filter(
      (option) =>
        !selectedOptions?.find(
          (selectedOption) => selectedOption.value === option.value
        )
    );

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
  };

  return (
    <div>
      <MultipleSelect
        value={selectedOptions}
        onChange={handleChange}
        options={options}
        label="Select approvers"
      />
    </div>
  );
};

export default Approval;
