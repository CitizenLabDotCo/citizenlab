import * as React from 'react';
import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const IntervalButton: any = styled.button`
  font-size: 16px;
  padding: 1rem 1.5rem;
  color: #000000;
  background: #E1E1E1;
  opacity: ${(props: any) => props.active ? 1 : 0.27};
  margin-right: 2px;
  cursor: pointer;
  outline: none;

  &:first-child {
    border-radius: 5px 0 0 5px;
  }
  &:last-child {
    border-radius: 0 5px 5px 0;
    margin-right: 0;
  }
  &:hover {
    opacity: 1;
  }

`;

type Props = {
  value: string,
  onChange: (string) => void,
};

export default class IntervalControl extends React.PureComponent<Props> {

  change = (interval) => () => {
    this.props.onChange(interval);
  }

  render() {
    const { value } = this.props;
    const intervals = ['week', 'month', 'year'];
    return (
      <Container>
        {intervals.map((interval) =>
          <IntervalButton
            key={interval}
            active={value === interval}
            onClick={this.change(interval)}
          >
            <FormattedMessage {...messages[interval]} />
          </IntervalButton>
        )}
      </Container>
    );
  }
}
