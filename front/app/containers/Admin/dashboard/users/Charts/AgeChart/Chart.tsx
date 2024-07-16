import React from 'react';

import messages from 'containers/Admin/dashboard/messages';

import BarChart from 'components/admin/Graphs/BarChart';
import { DEFAULT_BAR_CHART_MARGIN } from 'components/admin/Graphs/styling';

import { useIntl } from 'utils/cl-intl';

import { AgeSerie } from './typings';

interface Props {
  data: AgeSerie;
  innerRef?: React.RefObject<any>;
}

const Chart = ({ data, innerRef }: Props) => {
  const { formatMessage } = useIntl();
  const unitName = formatMessage(messages.users);

  return (
    <BarChart
      data={data}
      innerRef={innerRef}
      margin={DEFAULT_BAR_CHART_MARGIN}
      mapping={{
        category: 'name',
        length: 'value',
      }}
      bars={{ name: unitName }}
      labels
      tooltip
    />
  );
};

export default Chart;
