import React from 'react';

import useUserCustomFieldOptions from 'api/user_custom_fields_options/useUserCustomFieldsOptions';

import MultipleSelect from 'components/UI/MultipleSelect';

import localize, { InjectedLocalized } from 'utils/localize';

import { isNilOrError, NilOrError } from 'utils/helperUtils';

import { TRule } from 'modules/commercial/smart_groups/components/UserFilterConditions/rules';
import { IOption } from 'typings';
import { IUserCustomFieldOptionData } from 'api/user_custom_fields_options/types';

type Props = {
  rule: TRule;
  value: string[];
  onChange: (values: string[]) => void;
  options: IUserCustomFieldOptionData[] | NilOrError;
};

interface State {}

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

export default (inputProps: Props) => {
  const customFieldId = inputProps.rule?.['customFieldId'];
  const { data: customFieldOptions } = useUserCustomFieldOptions(customFieldId);

  return (
    <CustomFieldOptionValuesSelectorWithHOC
      {...inputProps}
      options={customFieldOptions?.data}
    />
  );
};
