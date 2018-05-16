import * as React from 'react';

import GetCustomFieldOptions, { GetCustomFieldOptionsChildProps } from 'resources/GetCustomFieldOptions';
import { TRule } from '../rules';
import { IOption } from 'typings';

import Select from 'components/UI/Select';

import { injectTFunc } from 'components/T/utils';


type Props = {
  rule: TRule;
  value: string;
  onChange: (string) => void;
  options: GetCustomFieldOptionsChildProps;
  tFunc: any;
};

type State = {};

class CustomFieldOptionValueSelector extends React.PureComponent<Props, State> {

  generateOptions = (): IOption[] => {
    if (this.props.options) {
      return this.props.options.map((option) => (
        {
          value: option.id,
          label: this.props.tFunc(option.attributes.title_multiloc),
        }
      ));
    } else {
      return [];
    }
  }

  handleOnChange = (option: IOption) => {
    this.props.onChange(option.value);
  }

  render() {
    const { value } = this.props;
    return (
      <Select
        value={value}
        options={this.generateOptions()}
        onChange={this.handleOnChange}
        clearable={false}
      />
    );
  }
}

const CustomFieldOptionValueSelectorWithHOC = injectTFunc(CustomFieldOptionValueSelector);

export default (inputProps) => (
  <GetCustomFieldOptions customFieldId={inputProps.rule.customFieldId}>
    {(options) => <CustomFieldOptionValueSelectorWithHOC {...inputProps} options={options} />}
  </GetCustomFieldOptions>
);
