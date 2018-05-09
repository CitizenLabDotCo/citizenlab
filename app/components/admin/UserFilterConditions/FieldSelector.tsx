import * as React from 'react';
// import styled from 'styled-components';

import Select from 'components/UI/Select';
import { IOption } from 'typings';
import { TRule, staticRuleTypes } from './rules';

import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

export interface FieldDescriptor {
  ruleType?: TRule['ruleType'];
  customFieldId?: string;
}

type Props = {
  field: FieldDescriptor;
  onChange: (FieldDescriptor: FieldDescriptor) => void;
};

type State = {};

class FieldSelector extends React.PureComponent<Props & InjectedIntlProps, State> {

  generateOptions = (): IOption[] => {
    return staticRuleTypes.map((ruleType) => (
      {
        value: this.descriptorToOptionValue({ ruleType }),
        label: this.props.intl.formatMessage(messages[`field_${ruleType}`]),
      }
    ));
  }

  handleOnChange = (option: IOption) => {
    this.props.onChange(this.optionValueToDescriptor(option.value));
  }

  descriptorToOptionValue = (fieldDescriptor: FieldDescriptor) => {
    return fieldDescriptor.ruleType;
  }

  optionValueToDescriptor = (value) => {
    return { ruleType: value };
  }

  render() {
    const { field } = this.props;
    return (
      <Select
        options={this.generateOptions()}
        onChange={this.handleOnChange}
        value={this.descriptorToOptionValue(field)}
      />
    );
  }
}

export default injectIntl(FieldSelector);
