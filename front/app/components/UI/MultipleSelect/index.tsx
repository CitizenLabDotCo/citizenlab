import React from 'react';

import { Label } from '@citizenlab/cl2-component-library';
import ReactSelect from 'react-select';
import { IOption } from 'typings';

import selectStyles from 'components/UI/MultipleSelect/styles';

export type Props = {
  id?: string;
  inputId?: string;
  value: IOption[] | null | IOption['value'];
  placeholder?: string | JSX.Element;
  options: IOption[] | null;
  autoBlur?: boolean;
  onChange: (arg: IOption[]) => void;
  disabled?: boolean;
  className?: string;
  label?: React.ReactNode;
  isSearchable?: boolean;
};

interface State {}

export default class MultipleSelect extends React.PureComponent<Props, State> {
  private emptyArray: never[];

  constructor(props: Props) {
    super(props);
    this.emptyArray = [];
  }

  handleOnChange = (newValue: IOption[]) => {
    this.props.onChange(newValue || this.emptyArray);
  };

  //  Needed to keep our API compatible with react-select v1
  //  For a native react-select solution, follow this issue:
  //  https://github.com/JedWatson/react-select/issues/2669
  findFullOptionValue = (value) => {
    if (typeof value === 'string') {
      return (
        this.props.options &&
        this.props.options.find((option) => option.value === value)
      );
    }

    return value;
  };

  findFullOptionValues = () => {
    const { value } = this.props;

    if (Array.isArray(value)) {
      return value.map(this.findFullOptionValue);
    }

    return value;
  };

  render() {
    const { id, className, disabled, label, isSearchable = true } = this.props;
    let { value, placeholder, options, autoBlur } = this.props;
    const { inputId } = this.props;

    value = this.findFullOptionValues();
    placeholder = placeholder || '';
    options = options || this.emptyArray;
    autoBlur = typeof autoBlur === 'boolean' ? autoBlur : false;

    return (
      <div>
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <ReactSelect
          id={id}
          inputId={inputId}
          className={className}
          isMulti
          isSearchable={isSearchable}
          blurInputOnSelect={autoBlur}
          backspaceRemovesValue={false}
          menuShouldScrollIntoView={false}
          isClearable={false}
          value={value}
          placeholder={placeholder}
          options={options}
          onChange={this.handleOnChange}
          isDisabled={disabled}
          styles={selectStyles()}
          menuPosition="fixed"
          menuPlacement="auto"
          hideSelectedOptions
        />
      </div>
    );
  }
}
