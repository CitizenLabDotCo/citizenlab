import React from 'react';

import { Input } from 'cl2-component-library';

type Props = {
  value: string;
  onChange: (string) => void;
};

type State = {};

class TextValueSelector extends React.PureComponent<Props, State> {
  handleOnChange = (value) => {
    this.props.onChange(value);
  };

  render() {
    const { value } = this.props;
    return <Input type="text" value={value} onChange={this.handleOnChange} />;
  }
}

export default TextValueSelector;
