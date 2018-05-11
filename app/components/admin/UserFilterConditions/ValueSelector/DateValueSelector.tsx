import * as React from 'react';
import moment, { Moment } from 'moment';

import DateInput from 'components/UI/DateInput';

type Props = {
  value: string;
  onChange: (string) => void;
};

type State = {};

class DateValueSelector extends React.PureComponent<Props, State> {

  handleOnChange = (moment: Moment) => {
    this.props.onChange(moment.format('YYYY-MM-DD'));
  }

  render() {
    const { value } = this.props;

    return (
      <DateInput
        value={moment(value)}
        onChange={this.handleOnChange}
      />
    );
  }
}

export default DateValueSelector;
