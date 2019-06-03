import React, { PureComponent } from 'react';
import { isBoolean } from 'lodash-es';
import ReactSelect from 'react-select';
import { IOption } from 'typings';
import selectStyles, { getSelectStyles } from 'components/UI/Select/styles';

export type Props = {
  id?: string;
  inputId?: string;
  value?: IOption | string | null;
  placeholder?: string | JSX.Element | null;
  options: IOption[] | null;
  autoBlur?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  onChange: (arg: IOption) => void;
  onBlur?: () => void;
  disabled?: boolean;
  borderColor?: string;
};

type State = {};

export default class Select extends PureComponent<Props, State> {

  handleOnChange = (newValue: IOption) => {
    this.props.onChange(newValue || null);
  }

  //  Needed to keep our API compatible with react-select v1
  //  For a native react-select solution, follow this issue:
  //  https://github.com/JedWatson/react-select/issues/2669
  findFullOptionValue = () => {
    const { options, value } = this.props;

    if (typeof value === 'string') {
      return options && options.find((option) => option.value === value);
    } else {
      return value;
    }
  }

  handleOpen = () => {
    const innerForm = document.getElementById('rules-group-inner-form');

    if (innerForm) {
      setTimeout(() => {
        innerForm.scrollTop = innerForm.scrollHeight;
      }, 10);
    }
  }

  emptyArray = [];

  render() {
    const className = this.props['className'];
    const { id, borderColor } = this.props;
    let { value, placeholder, options, autoBlur, clearable, searchable } = this.props;
    const { inputId } = this.props;
    const { disabled } = this.props;
    const styles = borderColor ? getSelectStyles(borderColor) : selectStyles;

    value = this.findFullOptionValue();
    placeholder = (placeholder || '');
    options = (options || this.emptyArray);
    autoBlur = (isBoolean(autoBlur) ? autoBlur : true);
    clearable = (isBoolean(clearable) ? clearable : true);
    searchable = (isBoolean(searchable) ? searchable : false);

    return (
      <ReactSelect
        id={id}
        inputId={inputId}
        className={className}
        isClearable={clearable}
        isSearchable={searchable}
        menuShouldScrollIntoView={false}
        blurInputOnSelect={autoBlur}
        value={value}
        placeholder={placeholder as string}
        options={options}
        onChange={this.handleOnChange}
        onBlur={this.props.onBlur}
        isDisabled={disabled}
        styles={styles}
        onMenuOpen={this.handleOpen}
        menuPlacement="auto"
      />
    );
  }
}
