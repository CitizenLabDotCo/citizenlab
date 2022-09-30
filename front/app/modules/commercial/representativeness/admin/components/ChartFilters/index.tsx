import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import ProjectFilter from 'containers/Admin/dashboard/components/filters/ProjectFilter';
import Button from 'components/UI/Button';

// styling
import { colors } from 'utils/styleUtils';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

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
