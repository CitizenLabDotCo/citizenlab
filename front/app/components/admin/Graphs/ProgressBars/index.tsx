import React from 'react';

// components
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import { NoDataContainer } from 'components/admin/GraphWrappers';
import { OneSideRoundedBar, CustomizedLabel } from './components';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { isEmpty } from 'lodash-es';

// typings
import { Props } from './typings';

const ProgressBars = <Row,>({
  data,
  width,
  height,
  emptyContainerContent,
}: Props<Row>) => {
  const noData = isNilOrError(data) || data.every(isEmpty) || data.length <= 0;

  if (noData) {
    return (
      <NoDataContainer>
        {emptyContainerContent ? (
          <>{emptyContainerContent}</>
        ) : (
          <FormattedMessage {...messages.noData} />
        )}
      </NoDataContainer>
    );
  }

  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart
        data={data}
        layout="vertical"
        stackOffset="expand"
        barSize={8}
        margin={{ bottom: 0 }}
      >
        <XAxis hide type="number" />
        <YAxis width={0} type="category" dataKey="name" />
        <Bar
          dataKey="value"
          stackId="a"
          fill="#044D6C"
          isAnimationActive={false}
          shape={(props) => <OneSideRoundedBar {...props} side="left" />}
        >
          <LabelList dataKey="label" data={data} content={CustomizedLabel} />
        </Bar>
        <Bar
          dataKey="total"
          stackId="a"
          fill="#E0E0E0"
          isAnimationActive={false}
          shape={(props) => <OneSideRoundedBar {...props} side="right" />}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ProgressBars;
