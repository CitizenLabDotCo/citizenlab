import React from 'react';
import { isBoolean } from 'lodash';
import { AsyncCreatable as ReactSelect } from 'react-select';
import { IOption } from 'typings';
import styled from 'styled-components';

const StyledMultipleSelect = styled(ReactSelect)``;

type Props = {
  value: IOption[] | null;
  placeholder: string;
  asyncOptions: (arg: any) => Promise<IOption[]> | null;
  max?: number;
  autoBlur?: boolean;
  onChange: (arg: IOption[]) => void;
  disabled?: boolean;
};

type State = {};

export default class AsyncMultipleSelect extends React.PureComponent<Props, State> {
  private emptyArray: never[];

  constructor(props) {
    super(props);
    this.emptyArray = [];
  }

  handleOnChange = (newValue: IOption[]) => {
    const { value, max } = this.props;
    const nextValue = (max && newValue && newValue.length > max ? value : newValue);
    this.props.onChange((nextValue || this.emptyArray));
  }

  render() {
    let { value, placeholder, asyncOptions, max, autoBlur } = this.props;

    value = (value || this.emptyArray);
    placeholder = (placeholder || '');
    asyncOptions = (asyncOptions || undefined);
    max = (max || undefined);
    autoBlur = (isBoolean(autoBlur) ? autoBlur : false);

    return (
      <StyledMultipleSelect
        multi={true}
        searchable={true}
        openOnFocus={false}
        autoBlur={autoBlur}
        backspaceRemoves={false}
        scrollMenuIntoView={false}
        clearable={false}
        value={value}
        placeholder={placeholder}
        loadOptions={this.props.asyncOptions}
        onChange={this.handleOnChange}
        disabled={this.props.disabled}
      />
    );
  }
}
