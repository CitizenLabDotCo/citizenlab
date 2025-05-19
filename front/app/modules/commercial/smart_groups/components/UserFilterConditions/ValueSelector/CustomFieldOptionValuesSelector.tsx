import React from 'react';

import { TRule } from 'modules/commercial/smart_groups/components/UserFilterConditions/rules';
import { IOption } from 'typings';

import { ICustomFieldOptionData } from 'api/custom_field_options/types';
import useCustomFieldOptions from 'api/custom_field_options/useCustomFieldOptions';

import MultipleSelect from 'components/UI/MultipleSelect';

import { isNilOrError, NilOrError } from 'utils/helperUtils';
import localize, { InjectedLocalized } from 'utils/localize';

type Props = {
  rule: TRule;
  value: string[];
  onChange: (values: string[]) => void;
  options: ICustomFieldOptionData[] | NilOrError;
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
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const customFieldId = inputProps.rule?.['customFieldId'];
  const { data: customFieldOptions } = useCustomFieldOptions(customFieldId);

  return (
    <CustomFieldOptionValuesSelectorWithHOC
      {...inputProps}
      options={customFieldOptions?.data}
    />
  );
};
