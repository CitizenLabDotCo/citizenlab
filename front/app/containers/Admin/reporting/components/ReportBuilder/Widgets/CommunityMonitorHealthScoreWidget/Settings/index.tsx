import React, { useCallback } from 'react';

import { Box, Select } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { IOption } from 'typings';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import { Props } from '../typings';

const Settings = () => {
  const {
    actions: { setProp },
    quarter,
    year,
  } = useNode<Props>((node) => ({
    quarter: node.data.props.quarter,
    year: node.data.props.year,
  }));

  const { formatMessage } = useIntl();

  const setQuarter = useCallback(
    (quarter: IOption) => {
      setProp((props: Props) => {
        props.quarter = quarter.value;
      });
    },
    [setProp]
  );

  const setYear = useCallback(
    (year: IOption) => {
      setProp((props: Props) => {
        props.year = year.value;
      });
    },
    [setProp]
  );

  const generateYearOptions = () => {
    // Start at 2025, and go up to present
    const currentYear = new Date().getFullYear();

    const years: IOption[] = [];

    for (let i = 2025; i <= currentYear; i++) {
      years.push({ value: i.toString(), label: i.toString() });
    }
    return years;
  };

  return (
    <Box display="flex" flexDirection="column" gap="20px" mb="20px">
      <Select
        label={formatMessage(messages.year)}
        options={generateYearOptions()}
        value={year}
        onChange={setYear}
      />

      <Select
        label={formatMessage(messages.quarter)}
        options={[
          { value: '1', label: formatMessage(messages.quarterOne) },
          { value: '2', label: formatMessage(messages.quarterTwo) },
          { value: '3', label: formatMessage(messages.quarterThree) },
          { value: '4', label: formatMessage(messages.quarterFour) },
        ]}
        value={quarter}
        onChange={setQuarter}
      />
    </Box>
  );
};

export default Settings;
