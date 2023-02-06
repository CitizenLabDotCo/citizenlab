import React from 'react';

import { Input } from '@citizenlab/cl2-component-library';

type Props = {
  value: string;
  onChange: (textValue: string) => void;
};

interface State {}

class TextValueSelector extends React.PureComponent<Props, State> {
  handleOnChange = (value: string) => {
    this.props.onChange(value);
  };

  render() {
    const { value } = this.props;
    return <Input type="text" value={value} onChange={this.handleOnChange} />;
  }
}

export default TextValueSelector;
