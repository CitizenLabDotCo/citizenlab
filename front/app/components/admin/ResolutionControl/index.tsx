import React from 'react';

import styled from 'styled-components';

import Tabs from 'components/UI/Tabs';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

export type IResolution = 'day' | 'week' | 'month';

const Container = styled.div``;

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
    <Container className={className}>
      <Tabs
        items={resOptions}
        selectedValue={
          resOptions.find((item) => item.name === value)?.name as string
        }
        onClick={onChange}
      />
    </Container>
  );
};

export default ResolutionControl;
