import React from 'react';
import { isBoolean } from 'lodash';
import ReactSelect from 'react-select';
import { IOption } from 'typings';
import selectStyles from 'components/UI/Select/styles';

export type Props = {
  id?: string | undefined;
  inputId?: string;
  value: IOption[] | null | undefined;
  placeholder?: string | JSX.Element | undefined;
  options: IOption[] | null;
  max?: number;
  autoBlur?: boolean;
  onChange: (arg: IOption[]) => void;
  disabled?: boolean;
};

type State = {};

export default class MultipleSelect extends React.PureComponent<Props, State> {
  private emptyArray: never[];

  constructor(props: Props) {
    super(props as any);
    this.emptyArray = [];
  }

  handleOnChange = (newValue: IOption[]) => {
    const { value, max } = this.props;
    const nextValue = (max && newValue && newValue.length > max ? value : newValue);
    this.props.onChange((nextValue || this.emptyArray));
  }

  //  Needed to keep our API compatible with react-select v1
  //  For a native react-select solution, follow this issue:
  //  https://github.com/JedWatson/react-select/issues/2669
  findFullOptionValue = (value) => {
    if (typeof value === 'string') {
      return this.props.options && this.props.options.find((option) => option.value === value);
    } else {
      return value;
    }
  }

  findFullOptionValues = () => {
    const { value } = this.props;
    if (value instanceof Array) {
      return value.map(this.findFullOptionValue);
    } else {
      return value;
    }
  }

  render() {
    const className = this.props['className'];
    const { id } = this.props;
    let { value, placeholder, options, max, autoBlur } = this.props;
    const { inputId } = this.props;

    value = this.findFullOptionValues();
    placeholder = (placeholder || '');
    options = (options || this.emptyArray);
    max = (max || undefined);
    autoBlur = (isBoolean(autoBlur) ? autoBlur : false);

    return (
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
        placeholder={<span>{placeholder}</span>}
        options={options}
        onChange={this.handleOnChange}
        isDisabled={this.props.disabled}
        styles={selectStyles}
      />
    );
  }
}
