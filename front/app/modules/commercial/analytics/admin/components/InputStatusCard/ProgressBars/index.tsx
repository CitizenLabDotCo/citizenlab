import React, { useMemo } from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import ProgressBarsGraph from 'components/admin/Graphs/ProgressBars';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

import hookMessages from '../usePostsFeedback/messages';
import { PostFeedback } from '../usePostsFeedback/typings';

import { generateEmptyData } from './generateEmptyData';

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
