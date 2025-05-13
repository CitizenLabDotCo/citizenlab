import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import ProjectFilter from 'containers/Admin/dashboard/components/filters/ProjectFilter';

import Button from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  projectId?: string;
  onProjectFilter: (filter: IOption) => void;
  noData: boolean;
}

const ChartFilters = ({ projectId, onProjectFilter, noData }: Props) => (
  <Box display="flex" justifyContent="space-between" alignItems="flex-end">
    <ProjectFilter projectId={projectId} onProjectFilter={onProjectFilter} />
    {!noData && (
      <Button
        linkTo="/admin/dashboard/representation/edit-base-data"
        text={<FormattedMessage {...messages.editBaseData} />}
        bgColor={colors.teal}
      />
    )}
  </Box>
);

export default ChartFilters;
