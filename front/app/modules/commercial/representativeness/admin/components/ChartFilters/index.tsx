import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import ProjectFilter from 'containers/Admin/dashboard/components/filters/ProjectFilter';

// styling
import { colors } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// typings
import { IOption } from 'typings';

interface Props {
  currentProjectFilter?: string;
  onProjectFilter: (filter: IOption) => void;
  noData: boolean;
}

const ChartFilters = ({
  currentProjectFilter,
  onProjectFilter,
  noData,
}: Props) => (
  <Box display="flex" justifyContent="space-between" alignItems="flex-end">
    <ProjectFilter
      currentProjectFilter={currentProjectFilter}
      onProjectFilter={onProjectFilter}
    />
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
