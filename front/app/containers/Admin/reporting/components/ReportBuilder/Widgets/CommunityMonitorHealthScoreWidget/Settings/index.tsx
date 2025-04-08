import React, { useCallback } from 'react';

import { Box, Select } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { IOption } from 'typings';

import { generateYearSelectOptions } from 'containers/Admin/reporting/utils/generateYearSelectOptions';

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

  return (
    <Box display="flex" flexDirection="column" gap="20px" mb="20px">
      <Select
        label={formatMessage(messages.year)}
        options={generateYearSelectOptions(2025)} // Genereates list: 2025 until current year
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
