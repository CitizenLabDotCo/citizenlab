import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Tabs from 'components/UI/Tabs';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

export type IResolution = 'day' | 'week' | 'month';

interface Props {
  value: IResolution;
  onChange: (arg: IResolution) => void;
  className?: string;
}

const ResolutionControl = ({ value, onChange, className }: Props) => {
  const resOptions = [
    {
      name: 'day',
      label: <FormattedMessage {...messages.resolutionday} />,
    },
    {
      name: 'week',
      label: <FormattedMessage {...messages.resolutionweek} />,
    },
    {
      name: 'month',
      label: <FormattedMessage {...messages.resolutionmonth} />,
    },
  ];

  return (
    <Box
      className={className}
      pl="1px" // Compensates for Tabs component's margin-left: -1px on first tab to prevent left border cutoff.
      // We can't remove the -1px margin from Tabs component as it creates seamless borders between tabs
      // and removing it would cause double borders (2px thick) in all other Tabs usages across the app.
    >
      <Tabs
        items={resOptions}
        selectedValue={
          resOptions.find((item) => item.name === value)?.name as string
        }
        onClick={onChange}
      />
    </Box>
  );
};

export default ResolutionControl;
