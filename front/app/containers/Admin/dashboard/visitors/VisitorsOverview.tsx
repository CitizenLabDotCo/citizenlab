import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment, { Moment } from 'moment';
import { IOption } from 'typings';

import ChartFilters from 'containers/Admin/dashboard/overview/ChartFilters';
import { getSensibleResolution } from 'containers/Admin/dashboard/overview/getSensibleResolution';

import { IResolution } from 'components/admin/ResolutionControl';

import { useIntl } from 'utils/cl-intl';

import { START_DATE_SESSION_DATA_COLLECTION } from '../constants';

import Charts from './Charts';
import messages from './messages';

interface Props {
  defaultStartDate: Moment;
}

const VisitorsOverview = ({ defaultStartDate }: Props) => {
  const [startAtMoment, setStartAtMoment] = useState<Moment | null | undefined>(
    defaultStartDate
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
          minDate={moment(START_DATE_SESSION_DATA_COLLECTION)}
          // Filtering visitor data by project is not allowed because the data is not available. For more details, refer to: https://www.notion.so/govocal/Gent-is-struggling-to-access-the-data-on-their-visitor-dashboard-cecae17322a24ccdb4bd938a511159cc?d=78857b76019144ee97b6bd8de960ead1
          showProjectFilter={false}
          timeControlTooltip={formatMessage(messages.visitorDataBanner)}
        />
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
