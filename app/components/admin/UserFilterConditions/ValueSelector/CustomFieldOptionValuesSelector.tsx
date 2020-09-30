import React from 'react';
import GetUserCustomFieldOptions, {
  GetUserCustomFieldOptionsChildProps,
} from 'resources/GetUserCustomFieldOptions';
import { TRule } from '../rules';
import { IOption } from 'typings';
import MultipleSelect from 'components/UI/MultipleSelect';
import localize, { InjectedLocalized } from 'utils/localize';
import { isNilOrError } from 'utils/helperUtils';

type Props = {
  rule: TRule;
  value: string[];
  onChange: (values: string[]) => void;
  options: GetUserCustomFieldOptionsChildProps;
};

type State = {};

class CustomFieldOptionValuesSelector extends React.PureComponent<
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

  handleOnChange = (options: IOption[]) => {
    const optionIds = options.map((o) => o.value);
    this.props.onChange(optionIds);
  };

  render() {
    const { value } = this.props;
    return (
      <MultipleSelect
        value={value}
        options={this.generateOptions()}
        onChange={this.handleOnChange}
      />
    );
  }
}

const CustomFieldOptionValuesSelectorWithHOC = localize(
  CustomFieldOptionValuesSelector
);

export default (inputProps: Props) => (
  <GetUserCustomFieldOptions customFieldId={inputProps.rule?.['customFieldId']}>
    {(options) => (
      <CustomFieldOptionValuesSelectorWithHOC
        {...inputProps}
        options={options}
      />
    )}
  </GetUserCustomFieldOptions>
);
