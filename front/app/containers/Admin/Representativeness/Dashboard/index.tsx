import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IUserCustomFieldData } from 'api/user_custom_fields/types';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import ChartFilters from 'components/admin/Representativeness/ChartFilters';

import { trackEventByName } from 'utils/analytics';

import ChartCards from './ChartCards';
import EmptyState from './EmptyState';
import Header from './Header';
import tracks from './tracks';
import { hasReferenceData } from './utils';

const hasAnyReferenceData = (userCustomFields: IUserCustomFieldData[]) =>
  userCustomFields.some(hasReferenceData);

const RepresentativenessDashboard = () => {
  const { data: userCustomFields } = useUserCustomFields({
    inputTypes: ['select', 'number'],
  });

  const [currentProjectFilter, setCurrentProjectFilter] = useState<string>();

  const onProjectFilter = ({ value }) => {
    trackEventByName(tracks.filteredOnProject, {
      projectId: value,
    });

    setCurrentProjectFilter(value);
  };

  if (!userCustomFields) {
    return null;
  }

  const anyReferenceData = hasAnyReferenceData(userCustomFields.data);

  return (
    <>
      <Box width="100%" mb="36px">
        <Header />
        <ChartFilters
          projectId={currentProjectFilter}
          onProjectFilter={onProjectFilter}
          noData={!anyReferenceData}
        />
      </Box>

      <Box>
        {anyReferenceData ? (
          <ChartCards projectFilter={currentProjectFilter} />
        ) : (
          <EmptyState />
        )}
      </Box>
    </>
  );
};

export default RepresentativenessDashboard;
