import React, { useState } from 'react';
import moment, { Moment } from 'moment';

// hooks
import { useIntl } from 'utils/cl-intl';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import ChartFilters from 'containers/Admin/dashboard/overview/ChartFilters';
import Charts from './Charts';
import Warning from 'components/UI/Warning';

// utils
import { getSensibleResolution } from 'containers/Admin/dashboard/overview/getSensibleResolution';

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import { IOption } from 'typings';

import messages from './messages';

interface Props {
  uniqueVisitorDataDate: Moment;
}

const VisitorsOverview = ({ uniqueVisitorDataDate }: Props) => {
  const [startAtMoment, setStartAtMoment] = useState<Moment | null | undefined>(
    uniqueVisitorDataDate
  );
  const [endAtMoment, setEndAtMoment] = useState<Moment | null>(moment());
  const [projectId, setProjectId] = useState<string | undefined>();
  const [resolution, setResolution] = useState<IResolution>('month');
  const { formatMessage } = useIntl();

  const handleChangeTimeRange = (
    startAtMoment: Moment | null,
    endAtMoment: Moment | null
  ) => {
    const resolution = getSensibleResolution(startAtMoment, endAtMoment);
    setStartAtMoment(startAtMoment);
    setEndAtMoment(endAtMoment);
    setResolution(resolution);
  };

  const handleProjectFilter = ({ value }: IOption) => {
    setProjectId(value);
  };

  if (!uniqueVisitorDataDate) {
    return null;
  }

  return (
    <>
      <Box width="100%">
        <ChartFilters
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          currentProjectFilter={projectId}
          resolution={resolution}
          onChangeTimeRange={handleChangeTimeRange}
          onProjectFilter={handleProjectFilter}
          onChangeResolution={setResolution}
          showAllTime={false}
          minDate={uniqueVisitorDataDate}
        />
      </Box>
      <Box p="10px">
        <Warning>
          <Text color="primary" m="0px">
            {formatMessage(messages.dateInfo, {
              date: uniqueVisitorDataDate.format('LL'),
            })}
          </Text>
        </Warning>
      </Box>

      <Charts
        projectId={projectId}
        startAtMoment={startAtMoment}
        endAtMoment={endAtMoment}
        resolution={resolution}
      />
    </>
  );
};

export default VisitorsOverview;
