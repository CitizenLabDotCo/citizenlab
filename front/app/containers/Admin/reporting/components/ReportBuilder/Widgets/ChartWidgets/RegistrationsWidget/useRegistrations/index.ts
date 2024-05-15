import { useState, useMemo } from 'react';

import moment from 'moment';

import { useRegistrations as useRegistrationsData } from 'api/graph_data_units';
import { RegistrationsProps } from 'api/graph_data_units/requestTypes';

import { parseTimeSeries } from 'components/admin/GraphCards/RegistrationsCard/useRegistrations/parse';

export default function useRegistrations({
  start_at,
  end_at,
  resolution = 'month',
  ...props
}: RegistrationsProps) {
  const [currentResolution, setCurrentResolution] = useState(resolution);

  const { data: analytics } = useRegistrationsData(
    {
      start_at,
      end_at,
      resolution,
      ...props,
    },
    {
      onSuccess: () => setCurrentResolution(resolution),
    }
  );

  const timeSeries = useMemo(() => {
    return analytics?.data
      ? parseTimeSeries(
          analytics.data.attributes[0],
          start_at ? moment(start_at) : null,
          end_at ? moment(end_at) : null,
          currentResolution
        )
      : null;
  }, [analytics, start_at, end_at, currentResolution]);

  return { timeSeries, currentResolution };
}
