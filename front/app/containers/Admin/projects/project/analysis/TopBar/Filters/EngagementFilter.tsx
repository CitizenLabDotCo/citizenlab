import React from 'react';

import { Box, Select, Input, Label } from '@citizenlab/cl2-component-library';

import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { useSearchParams } from 'react-router-dom';

import { useIntl } from 'utils/cl-intl';
import translations from '../translations';
import { trackEventByName } from 'utils/analytics';
import tracks from '../../tracks';

type EngagementFilterProps = {
  label: string;
  searchParams: {
    from: string;
    to: string;
  };
  id?: string;
};

const EngagementFilter = ({
  label,
  searchParams: { from, to },
  id,
}: EngagementFilterProps) => {
  const { formatMessage } = useIntl();
  const [searchParams] = useSearchParams();

  const selectValue = searchParams.get(to) ? to : from;

  return (
    <>
      <Label htmlFor={id}>{label}</Label>
      <Box display="flex" gap="8px" mb="12px">
        <Box w="50%">
          <Select
            options={[
              {
                label: formatMessage(translations.above),
                value: from,
              },
              {
                label: formatMessage(translations.below),
                value: to,
              },
            ]}
            onChange={({ value }) => {
              const existingValue =
                searchParams.get(from) || searchParams.get(to);
              removeSearchParams([from, to]);
              value && updateSearchParams({ [value]: existingValue || 5 });
            }}
            value={selectValue}
          />
        </Box>
        <Input
          id={id}
          type="number"
          value={searchParams.get(from) || searchParams.get(to)}
          onChange={(value) => {
            removeSearchParams([from, to]);
            value && updateSearchParams({ [selectValue]: value });
            trackEventByName(tracks.engagementFilterUsed.name, {
              extra: {
                type: selectValue,
              },
            });
          }}
        />
      </Box>
    </>
  );
};

export default EngagementFilter;
