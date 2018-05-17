import React from 'react';
import GetCustomFieldOptions, { GetCustomFieldOptionsChildProps } from 'resources/GetCustomFieldOptions';
import { TRule } from '../rules';
import { IOption } from 'typings';
import Select from 'components/UI/Select';
import localize, { injectedLocalized } from 'utils/localize';
import { isNilOrError } from 'utils/helperUtils';

type Props = {
  rule: TRule;
  value: string;
  onChange: (string) => void;
  options: GetCustomFieldOptionsChildProps;
  tFunc: any;
};

type State = {};

class CustomFieldOptionValueSelector extends React.PureComponent<Props & injectedLocalized, State> {

  generateOptions = (): IOption[] => {
    const { options, localize } = this.props;

    if (!isNilOrError(options)) {
      return options.map((option) => (
        {
          value: option.id,
          label: localize(option.attributes.title_multiloc),
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

const CustomFieldOptionValueSelectorWithHOC = localize(CustomFieldOptionValueSelector);

export default (inputProps) => (
  <GetCustomFieldOptions customFieldId={inputProps.rule.customFieldId}>
    {(options) => <CustomFieldOptionValueSelectorWithHOC {...inputProps} options={options} />}
  </GetCustomFieldOptions>
);
