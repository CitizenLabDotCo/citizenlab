import React from 'react';

import { Box, Select, Input, Label } from '@citizenlab/cl2-component-library';
import messages from '../messages';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { useSearchParams } from 'react-router-dom';
import { useIntl } from 'utils/cl-intl';

type EngagementFilterProps = {
  label: string;
  searchParams: {
    from: string;
    to: string;
  };
};

const EngagementFilter = ({
  label,
  searchParams: { from, to },
}: EngagementFilterProps) => {
  const { formatMessage } = useIntl();
  const [searchParams] = useSearchParams();

  const selectValue = searchParams.get(to) ? to : from;

  return (
    <>
      <Label>{label}</Label>
      <Box display="flex" gap="8px" mb="12px">
        <Box w="50%">
          <Select
            id="select"
            options={[
              {
                label: formatMessage(messages.above),
                value: from,
              },
              {
                label: formatMessage(messages.below),
                value: to,
              },
            ]}
            onChange={({ value }) => {
              removeSearchParams([from, to]);
              value && updateSearchParams({ [value]: 5 });
            }}
            value={selectValue}
          />
        </Box>
        <Input
          type="number"
          value={searchParams.get(from) || searchParams.get(to)}
          onChange={(value) => {
            removeSearchParams([from, to]);
            value && updateSearchParams({ [selectValue]: value });
          }}
        />
      </Box>
    </>
  );
};

export default EngagementFilter;
