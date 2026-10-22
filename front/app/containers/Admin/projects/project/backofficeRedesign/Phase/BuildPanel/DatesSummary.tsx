import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import useLocale from 'hooks/useLocale';

import { formatDateRange } from 'containers/Admin/projects/project/projectPage/phaseRowUtils';

import { getLocale } from 'components/admin/DatePickers/_shared/locales';
import pickerMessages from 'components/admin/DatePickers/DatePhasePicker/messages';

import { useIntl } from 'utils/cl-intl';

interface Props {
  startAt: string;
  endAt: string | null | undefined;
}

const DatesSummary = ({ startAt, endAt }: Props) => {
  const { formatMessage } = useIntl();
  const dateLocale = getLocale(useLocale());

  return (
    <Box
      display="flex"
      alignItems="center"
      gap="6px"
      height="22px"
      px="10px"
      background={colors.grey200}
      // A pill, so the radius is a shape rather than the card radius.
      borderRadius="999px"
    >
      <Icon
        name="calendar"
        width="14px"
        height="14px"
        fill={colors.coolGrey700}
      />
      <Text
        as="span"
        m="0"
        fontSize="xs"
        fontWeight="semi-bold"
        color="coolGrey700"
        whiteSpace="nowrap"
      >
        {formatDateRange(
          startAt,
          endAt ?? null,
          dateLocale,
          formatMessage(pickerMessages.openEnded)
        )}
      </Text>
    </Box>
  );
};

export default DatesSummary;
