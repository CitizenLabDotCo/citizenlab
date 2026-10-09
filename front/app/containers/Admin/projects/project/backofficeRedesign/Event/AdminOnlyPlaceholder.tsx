import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import AdminOnlyNote from 'components/ProjectPageBuilder/Widgets/EmptyState/AdminOnlyNote';
import EmptyStateContainer from 'components/ProjectPageBuilder/Widgets/EmptyState/EmptyStateContainer';

interface Props {
  title: string;
}

// Stands in for an empty part of the event page. Participants never see it.
const AdminOnlyPlaceholder = ({ title }: Props) => (
  <EmptyStateContainer>
    <Text m="0" fontSize="s" fontWeight="semi-bold" color="textSecondary">
      {title}
    </Text>
    <AdminOnlyNote />
  </EmptyStateContainer>
);

export default AdminOnlyPlaceholder;
