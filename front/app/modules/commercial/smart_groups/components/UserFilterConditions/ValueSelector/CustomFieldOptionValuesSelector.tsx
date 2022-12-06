import React from 'react';
import { IOption } from 'typings';
// hooks
import useUserCustomFieldOptions from 'hooks/useUserCustomFieldOptions';
import { IUserCustomFieldOptionData } from 'services/userCustomFieldOptions';
// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
// i18n
import localize, { InjectedLocalized } from 'utils/localize';
// components
import MultipleSelect from 'components/UI/MultipleSelect';
// typings
import { TRule } from 'modules/commercial/smart_groups/components/UserFilterConditions/rules';

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
  const customFieldOptions = useUserCustomFieldOptions(customFieldId);

  return (
    <CustomFieldOptionValuesSelectorWithHOC
      {...inputProps}
      options={customFieldOptions}
    />
  );
};
