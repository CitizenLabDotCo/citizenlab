import React from 'react';
import { isBoolean } from 'lodash';
import ReactSelect from 'react-select';
import { IOption } from 'typings';
import styled from 'styled-components';
import { rgba } from 'polished';

export function customSelectStyles(props) {
  return `
    .rs__control {
      &.rs__control--is-focused,
      &:hover {
        border-color: ${props.theme.colorMain};
        box-shadow: 0 0 0 1px ${props.theme.colorMain};
      }
    }

    .rs__option {
      &.rs__option--is-focused,
      &:hover {
        background: ${rgba(props.theme.colorMain, .1)};
      }

      &.rs__option--is-selected {
        color: black;
        background: ${rgba(props.theme.colorMain, .5)};
      }
    }
  `;
}

const StyledSelect = styled(ReactSelect)`
  ${props => customSelectStyles(props)}
`;

export type Props = {
  id?: string | undefined;
  value?: IOption | string | null | undefined;
  placeholder?: string | JSX.Element | null | undefined;
  options: IOption[] | null;
  autoBlur?: boolean | undefined;
  clearable?: boolean | undefined;
  searchable?: boolean | undefined;
  multi?: boolean | undefined;
  onChange: (arg: IOption) => void;
  onBlur?: () => void;
  disabled?: boolean;
};

type State = {};

export default class Select extends React.PureComponent<Props, State> {
  private emptyArray: never[];

  constructor(props: Props) {
    super(props as any);
    this.emptyArray = [];
  }

  handleOnChange = (newValue: IOption) => {
    this.props.onChange(newValue || null);
  }

  render() {
    const className = this.props['className'];
    const { id } = this.props;
    let { value, placeholder, options, autoBlur, clearable, searchable, multi } = this.props;
    const { disabled } = this.props;

    value = (value || undefined);
    placeholder = (placeholder || '');
    options = (options || this.emptyArray);
    autoBlur = (isBoolean(autoBlur) ? autoBlur : true);
    clearable = (isBoolean(clearable) ? clearable : true);
    searchable = (isBoolean(searchable) ? searchable : false);
    multi = (isBoolean(multi) ? multi : false);

    return (
      <StyledSelect
        id={id}
        className={className}
        classNamePrefix="rs"
        openOnFocus={false}
        clearable={clearable}
        searchable={searchable}
        scrollMenuIntoView={false}
        autoBlur={autoBlur}
        value={value}
        placeholder={placeholder}
        options={options}
        onChange={this.handleOnChange}
        onBlur={this.props.onBlur}
        isMulti={multi}
        disabled={disabled}
      />
    );
  }
}
