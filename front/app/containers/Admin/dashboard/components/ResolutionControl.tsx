import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { IResolution } from '..';
import Tabs from 'components/UI/Tabs';

const Container = styled.div``;

interface Props {
  value: IResolution;
  onChange: (arg: IResolution) => void;
  className?: string;
}

export default class ResolutionControl extends PureComponent<Props> {
  handleOnResolutionChange = (resolution: IResolution) => {
    this.props.onChange(resolution);
  };

  render() {
    const { value, className } = this.props;
    const resOptions = [
      {
        value: 'day',
        label: <FormattedMessage {...messages.resolutionday} />,
      },
      {
        value: 'week',
        label: <FormattedMessage {...messages.resolutionweek} />,
      },
      {
        value: 'month',
        label: <FormattedMessage {...messages.resolutionmonth} />,
      },
    ];

    return (
      <Container className={className}>
        <Tabs
          items={resOptions}
          selectedValue={
            resOptions.find((item) => item.value === value)?.value as string
          }
          onClick={this.handleOnResolutionChange}
        />
      </Container>
    );
  }
}
