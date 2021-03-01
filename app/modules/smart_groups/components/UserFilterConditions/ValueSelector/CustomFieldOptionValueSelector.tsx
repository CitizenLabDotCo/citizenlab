import React from 'react';
import GetUserCustomFieldOptions, {
  GetUserCustomFieldOptionsChildProps,
} from 'resources/GetUserCustomFieldOptions';
import { TRule } from '../rules';
import { IOption } from 'typings';
import { Select } from 'cl2-component-library';
import localize, { InjectedLocalized } from 'utils/localize';
import { isNilOrError } from 'utils/helperUtils';

type Props = {
  rule: TRule;
  value: string;
  onChange: (string) => void;
  options: GetUserCustomFieldOptionsChildProps;
};

type State = {};

class CustomFieldOptionValueSelector extends React.PureComponent<
  Props & InjectedLocalized,
  State
> {
  generateOptions = (): IOption[] => {
    const { options, localize } = this.props;

    if (!isNilOrError(options)) {
      return options.map((option) => ({
        value: option.id,
        label: localize(option.attributes.title_multiloc),
      }));
    } else {
      return [];
    }
  };

  handleOnChange = (option: IOption) => {
    this.props.onChange(option.value);
  };

  render() {
    const { value } = this.props;
    return (
      <Select
        value={value}
        options={this.generateOptions()}
        onChange={this.handleOnChange}
      />
    );
  }
}

const CustomFieldOptionValueSelectorWithHOC = localize(
  CustomFieldOptionValueSelector
);

export default (inputProps) => (
  <GetUserCustomFieldOptions customFieldId={inputProps.rule?.['customFieldId']}>
    {(options) => (
      <CustomFieldOptionValueSelectorWithHOC
        {...inputProps}
        options={options}
      />
    )}
  </GetUserCustomFieldOptions>
);
