import React, { useMemo } from 'react';

import ProgressBarsGraph from 'components/admin/Graphs/ProgressBars';
import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import hookMessages from '../usePostsFeedback/messages';
import { useIntl } from 'utils/cl-intl';

import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { generateEmptyData } from './generateEmptyData';

import { PostFeedback } from '../usePostsFeedback/typings';

interface Props {
  data: PostFeedback | NilOrError;
  innerRef: React.RefObject<any>;
}

const ProgressBars = ({ data, innerRef }: Props) => {
  const { formatMessage } = useIntl();

  const emptyData = useMemo(
    () =>
      generateEmptyData(
        formatMessage(hookMessages.statusChanged),
        formatMessage(hookMessages.officialUpdate)
      ),
    [formatMessage]
  );

  const { progressBarsData, days } = isNilOrError(data)
    ? { progressBarsData: emptyData, days: '?' }
    : data;

  return (
    <>
      <ProgressBarsGraph
        height={136}
        data={progressBarsData}
        innerRef={innerRef}
      />
      <Box m="0 0 0 0" width="100%">
        <Icon
          name="calendar"
          fill={colors.primary}
          width="13px"
          height="13px"
          mr="11px"
        />
        <Text m="0" color="primary" fontSize="s" display="inline">
          {formatMessage(hookMessages.averageTime, { days })}
        </Text>
      </Box>
    </>
  );
};

export default ProgressBars;
