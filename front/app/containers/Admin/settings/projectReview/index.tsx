import React, { useEffect, useState } from 'react';

import {
  IOption,
  Button,
  Box,
  Spinner,
} from '@citizenlab/cl2-component-library';

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
import { getFullName } from 'utils/textUtils';

import messages from './messages';

const ProjectReview = () => {
  const { formatMessage } = useIntl();

  const [selectedUsers, setSelectedUsers] = useState<IOption[]>([]);
  const { mutate: updateUser, isLoading } = useUpdateUser();
  const { data: adminUsers } = useUsers({
    can_admin: true,
  });
  const { data: projectReviewers } = useUsers({
    project_reviewer: true,
  });

  useEffect(() => {
    if (projectReviewers) {
      setSelectedUsers(
        projectReviewers.data.map((user) => ({
          value: user.id,
          label: getFullName(user),
        }))
      );
    }
  }, [projectReviewers]);

  if (!adminUsers || !projectReviewers) return <Spinner />;

  const options = adminUsers.data.map((user) => ({
    value: user.id,
    label: getFullName(user),
  }));

  const handleChange = (value: IOption[]) => {
    setSelectedUsers(value);
  };

  const handleSave = () => {
    const currentUsers: string[] = selectedUsers.map((user) => user.value);

    const addedUsers = currentUsers.filter(
      (userId) => !projectReviewers.data.find((user) => user.id === userId)
    );

    const removedUsers = projectReviewers.data
      .map((user) => user.id)
      .filter((userId) => !currentUsers.includes(userId));

    addedUsers.forEach((userId) => {
      updateUser({
        userId,
        roles: [
          {
            type: 'admin',
            project_reviewer: true,
          },
        ],
      });
    });

    removedUsers.forEach((userId) => {
      updateUser({
        userId,
        roles: [
          {
            type: 'admin',
            project_reviewer: false,
          },
        ],
      });
    });
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
            value={selectedUsers}
            onChange={handleChange}
            options={options}
            label={formatMessage(messages.selectApprovers)}
          />
        </SectionField>
        <Box display="flex" mt="20px">
          <Button
            buttonStyle="admin-dark"
            onClick={handleSave}
            processing={isLoading}
          >
            {formatMessage(messages.save)}
          </Button>
        </Box>
      </Section>
    </Box>
  );
};

export default ProjectReview;
