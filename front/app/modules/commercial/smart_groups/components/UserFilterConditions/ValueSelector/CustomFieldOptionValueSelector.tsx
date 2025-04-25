import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';
import { TRule } from 'modules/commercial/smart_groups/components/UserFilterConditions/rules';
import { IOption } from 'typings';

import { ICustomFieldOptionData } from 'api/custom_field_options/types';
import useCustomFieldOptions from 'api/custom_field_options/useCustomFieldOptions';

import { isNilOrError, NilOrError } from 'utils/helperUtils';
import localize, { InjectedLocalized } from 'utils/localize';

type Props = {
  rule: TRule;
  value: string;
  onChange: (customFieldOptionValue: string) => void;
  options: ICustomFieldOptionData[] | NilOrError;
};

interface State {}

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

export default (inputProps: Props) => {
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const customFieldId = inputProps.rule?.['customFieldId'];
  const { data: customFieldOptions } = useCustomFieldOptions(customFieldId);

  return (
    <CustomFieldOptionValueSelectorWithHOC
      {...inputProps}
      options={customFieldOptions?.data}
    />
  );
};
