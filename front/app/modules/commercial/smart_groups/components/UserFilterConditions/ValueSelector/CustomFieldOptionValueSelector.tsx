import React from 'react';

// hooks
import useUserCustomFieldOptions from 'components/UserCustomFields/hooks/useUserCustomFieldOptions';

// components
import { Select } from '@citizenlab/cl2-component-library';

// i18n
import localize, { InjectedLocalized } from 'utils/localize';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import { TRule } from 'modules/commercial/smart_groups/components/UserFilterConditions/rules';
import { IOption } from 'typings';
import { IUserCustomFieldOptionData } from 'components/UserCustomFields/services/userCustomFieldOptions';

type Props = {
  rule: TRule;
  value: string;
  onChange: (string) => void;
  options: IUserCustomFieldOptionData[] | NilOrError;
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
  const customFieldId = inputProps.rule?.['customFieldId'];
  const customFieldOptions = useUserCustomFieldOptions(customFieldId);

  return (
    <CustomFieldOptionValueSelectorWithHOC
      {...inputProps}
      options={customFieldOptions}
    />
  );
};
