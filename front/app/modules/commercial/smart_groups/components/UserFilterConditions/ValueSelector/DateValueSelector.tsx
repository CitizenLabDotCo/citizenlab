import React from 'react';
import moment, { Moment } from 'moment';

import { DateInput } from '@citizenlab/cl2-component-library';

type Props = {
  value: string;
  onChange: (string) => void;
};

interface State {}

class DateValueSelector extends React.PureComponent<Props, State> {
  handleOnChange = (moment: Moment) => {
    this.props.onChange(moment.format('YYYY-MM-DD'));
  };

  render() {
    const { value } = this.props;

    return (
      <DateInput
        value={moment(value) || null}
        onChange={this.handleOnChange}
        openOnLeft={true}
      />
    );
  }
}

export default DateValueSelector;
