import React from 'react';

import { Input } from '@citizenlab/cl2-component-library';

type Props = {
  value: string;
  onChange: (numberValue: number) => void;
};

interface State {}

class NumberValueSelector extends React.PureComponent<Props, State> {
  handleOnChange = (value: string) => {
    this.props.onChange(parseInt(value, 10));
  };

  render() {
    const { value } = this.props;
    return <Input type="number" value={value} onChange={this.handleOnChange} />;
  }
}

export default NumberValueSelector;
