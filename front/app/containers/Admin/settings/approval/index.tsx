import React from 'react';

import useUsers from 'api/users/useUsers';

import MultipleSelect from 'components/UI/MultipleSelect';

const Approval = () => {
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

  return (
    <div>
      <MultipleSelect
        value={selectedOptions}
        onChange={(value) => console.log(value)}
        options={options}
        label="Select approvers"
      />
    </div>
  );
};

export default Approval;
