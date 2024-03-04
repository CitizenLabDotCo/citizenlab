import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import ChartFilters from 'containers/Admin/dashboard/overview/ChartFilters';
import { getSensibleResolution } from 'containers/Admin/dashboard/overview/getSensibleResolution';
import moment, { Moment } from 'moment';
import { IOption } from 'typings';

import { IResolution } from 'components/admin/ResolutionControl';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

import Charts from './Charts';
import messages from './messages';

interface Props {
  uniqueVisitorDataDate: Moment | undefined;
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
    return <Text>{formatMessage(messages.noData)}</Text>;
  }

  return (
    <>
      <Box width="100%">
        <ChartFilters
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          projectId={projectId}
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
            {formatMessage(messages.cookieBannerUpdatedInfo)}
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
