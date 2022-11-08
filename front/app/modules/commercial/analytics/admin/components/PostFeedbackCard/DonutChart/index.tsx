import React from 'react';

// components
import PieChart from 'components/admin/Graphs/PieChart';
import CenterLabel from './CenterLabel';

// styling
import { colors } from 'components/admin/Graphs/styling';

// i18n
import messages from '../../../hooks/usePostsFeedback/messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import { PostFeedback } from '../../../hooks/usePostsFeedback/typings';

interface Props {
  data: PostFeedback | NilOrError;
  innerRef: React.RefObject<any>;
}

const EMPTY_DATA = [{ value: 1, name: '' }];

const DonutChart = ({ data, innerRef }: Props) => {
  const { formatMessage } = useIntl();
  const pieCenterLabel = formatMessage(messages.feedbackGiven);

  if (isNilOrError(data) || data.pieData.length === 0) {
    return (
      <PieChart
        data={EMPTY_DATA}
        height={200}
        mapping={{
          angle: 'value',
          name: 'name',
          fill: () => colors.gridColor,
        }}
        pie={{ innerRadius: '85%' }}
        centerLabel={({ viewBox: { cy } }) => (
          <CenterLabel y={cy - 5} value="-%" label={pieCenterLabel} />
        )}
      />
    );
  }

  const { pieData, pieCenterValue } = data;

  return (
    <PieChart
      data={pieData}
      height={200}
      mapping={{
        angle: 'value',
        name: 'name',
        fill: ({ row: { color } }) => color,
      }}
      pie={{
        innerRadius: '85%',
      }}
      centerLabel={({ viewBox: { cy } }) => (
        <CenterLabel y={cy - 5} value={pieCenterValue} label={pieCenterLabel} />
      )}
      innerRef={innerRef}
    />
  );
};

export default DonutChart;
