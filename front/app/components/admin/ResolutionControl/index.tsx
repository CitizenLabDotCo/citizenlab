import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import Tabs from 'components/UI/Tabs';

export type IResolution = 'day' | 'week' | 'month';

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
          onClick={this.handleOnResolutionChange}
        />
      </Container>
    );
  }
}
