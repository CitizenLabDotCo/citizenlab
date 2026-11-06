import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import { format } from 'date-fns';

import useLocale from 'hooks/useLocale';

import { getLocale } from 'components/admin/DatePickers/_shared/locales';

import { TimelineScale, monthStarts, position } from './timelineScale';

type Props = {
  scale: TimelineScale;
};

const TimelineMonths = ({ scale }: Props) => {
  const locale = getLocale(useLocale());

  return (
    <Box display="flex" justifyContent="flex-end" pr="17px" aria-hidden>
      <Box position="relative" width="200px" height="18px">
        {monthStarts(scale).map((month) => {
          const { left } = position(scale, {
            from: month.getTime(),
            to: month.getTime(),
          });

          return (
            <Box
              key={month.getTime()}
              position="absolute"
              top="0"
              left={`${left}%`}
              pl="4px"
              borderLeft={`1px solid ${colors.grey300}`}
            >
              <Text m="0px" fontSize="xs" color="textSecondary">
                {format(month, 'MMM', { locale })}
              </Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default TimelineMonths;
