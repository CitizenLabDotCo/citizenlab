import React from 'react';
import { isBoolean, isString, isArray } from 'lodash-es';
import ReactSelect from 'react-select';
import { IOption } from 'typings';
import selectStyles from 'components/UI/MultipleSelect/styles';
import { Label } from '@citizenlab/cl2-component-library';

export type Props = {
  id?: string;
  inputId?: string;
  value: IOption[] | null | IOption['value'];
  placeholder?: string | JSX.Element;
  options: IOption[] | null;
  max?: number;
  autoBlur?: boolean;
  onChange: (arg: IOption[]) => void;
  disabled?: boolean;
  className?: string;
  label?: React.ReactNode;
};

interface State {}

export default class MultipleSelect extends React.PureComponent<Props, State> {
  private emptyArray: never[];

  constructor(props: Props) {
    super(props);
    this.emptyArray = [];
  }

  handleOnChange = (newValue: IOption[]) => {
    const { value, max } = this.props;
    const nextValue =
      max && newValue && newValue.length > max ? value : newValue;
    this.props.onChange(nextValue || this.emptyArray);
  };

  //  Needed to keep our API compatible with react-select v1
  //  For a native react-select solution, follow this issue:
  //  https://github.com/JedWatson/react-select/issues/2669
  findFullOptionValue = (value) => {
    if (isString(value)) {
      return (
        this.props.options &&
        this.props.options.find((option) => option.value === value)
      );
    }

    return value;
  };

  findFullOptionValues = () => {
    const { value } = this.props;

    if (isArray(value)) {
      return value.map(this.findFullOptionValue);
    }

    return value;
  };

  render() {
    const { id, className, disabled, label } = this.props;
    let { value, placeholder, options, max, autoBlur } = this.props;
    const { inputId } = this.props;

    value = this.findFullOptionValues();
    placeholder = placeholder || '';
    options = options || this.emptyArray;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    max = max || undefined;
    autoBlur = isBoolean(autoBlur) ? autoBlur : false;

    return (
      <div>
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <ReactSelect
          id={id}
          inputId={inputId}
          className={className}
          isMulti
          isSearchable
          blurInputOnSelect={autoBlur}
          backspaceRemovesValue={false}
          menuShouldScrollIntoView={false}
          isClearable={false}
          value={value}
          placeholder={placeholder}
          options={options}
          onChange={this.handleOnChange}
          isDisabled={disabled}
          styles={selectStyles}
          menuPlacement="auto"
        />
      </div>
    );
  }
}
