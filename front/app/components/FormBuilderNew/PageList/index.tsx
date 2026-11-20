import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import { useBuilder } from '../context';
import messages from '../messages';
import { getDisplayGroups, getPageGroups } from '../utils';

import PageCard from './PageCard';

const PageList = () => {
  const { formatMessage } = useIntl();
  const { fields, userPage } = useBuilder();
  const groups = getDisplayGroups(getPageGroups(fields), userPage);

  return (
    <Box px="12px" data-cy="e2e-form-builder-new-page-list">
      <Title
        variant="h6"
        as="h2"
        color="textSecondary"
        mt="8px"
        mb="12px"
        style={{ textTransform: 'uppercase' }}
      >
        {formatMessage(messages.pages)}
      </Title>
      {groups.map((group, pageIndex) => (
        <PageCard key={group.page.id} group={group} pageIndex={pageIndex} />
      ))}
    </Box>
  );
};

export default PageList;
