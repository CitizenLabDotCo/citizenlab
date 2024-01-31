import React, { useState } from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';
import useAuthUser from 'api/me/useAuthUser';

// typings
import { IUserCustomFieldData } from 'api/user_custom_fields/types';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Header from './Header';
import ChartFilters from '../../components/ChartFilters';
import EmptyState from './EmptyState';
import ChartCards from './ChartCards';

// utils
import { hasReferenceData } from './utils';
import { isAdmin } from 'utils/permissions/roles';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

const hasAnyReferenceData = (userCustomFields: IUserCustomFieldData[]) =>
  userCustomFields.some(hasReferenceData);

const RepresentativenessDashboard = () => {
  const { data: authUser } = useAuthUser();

  const { data: userCustomFields } = useUserCustomFields({
    inputTypes: ['select', 'number'],
  });

  const [currentProjectFilter, setCurrentProjectFilter] = useState<string>();

  const onProjectFilter = ({ value }) => {
    trackEventByName(tracks.filteredOnProject.name, {
      extra: { projectId: value },
    });

    setCurrentProjectFilter(value);
  };

  if (!userCustomFields || !authUser || !isAdmin(authUser)) {
    return null;
  }

  const anyReferenceData = hasAnyReferenceData(userCustomFields.data);

  return (
    <>
      <Box width="100%" mb="36px">
        <Header />
        <ChartFilters
          currentProjectFilter={currentProjectFilter}
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

const RepresentativenessDashboardFeatureFlagWrapper = () => {
  const representativenessActive = useFeatureFlag({
    name: 'representativeness',
  });

  if (!representativenessActive) {
    return null;
  }

  return <RepresentativenessDashboard />;
};

export default RepresentativenessDashboardFeatureFlagWrapper;
