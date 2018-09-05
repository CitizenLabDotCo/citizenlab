import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { colors, fontSizes } from 'utils/styleUtils';
import { rgba } from 'polished';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const IntervalButton = styled.button`
  font-size: ${fontSizes.base}px;
  padding: 1rem 1.5rem;
  background: ${colors.adminContentBackground};
  border: solid 1px #e4e4e4;
  cursor: pointer;
  outline: none;

  &.active {
    background: ${rgba(colors.adminTextColor, .1)};
  }

  &:first-child {
    border-radius: 5px 0 0 5px;
  }

  &:last-child {
    border-radius: 0 5px 5px 0;
    margin-right: 0;
  }

  &:hover, &:focus {
    background: ${rgba(colors.adminTextColor, .2)};
  }
`;

type Props = {
  value: 'weeks' | 'months' | 'years';
  onChange: (arg: 'weeks' | 'months' | 'years') => void;
};

export default class IntervalControl extends React.PureComponent<Props> {
  change = (interval: 'weeks' | 'months' | 'years') => () => {
    this.props.onChange(interval);
  }

  render() {
    const { value } = this.props;
    const intervals: ['weeks', 'months', 'years'] = ['weeks', 'months', 'years'];

    return (
      <Container>
        {intervals.map((interval) =>
          <IntervalButton
            key={interval}
            className={`${value === interval && 'active'}`}
            onClick={this.change(interval)}
          >
            <FormattedMessage {...messages[interval.substring(0, interval.length - 1)]} />
          </IntervalButton>
        )}
      </Container>
    );
  }
}
