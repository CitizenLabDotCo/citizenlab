import React from 'react';
import { isBoolean } from 'lodash';
import ReactSelect from 'react-select';
import { IOption } from 'typings';
import selectStyles from 'components/UI/Select/styles';

export type Props = {
  id?: string | undefined;
  value?: IOption | string | null | undefined;
  placeholder?: string | JSX.Element | null | undefined;
  options: IOption[] | null;
  autoBlur?: boolean | undefined;
  clearable?: boolean | undefined;
  searchable?: boolean | undefined;
  onChange: (arg: IOption) => void;
  onBlur?: () => void;
  disabled?: boolean;
};

type State = {};

export default class Select extends React.PureComponent<Props, State> {
  private emptyArray: never[];

  constructor(props: Props & {tenantColor: string | null}) {
    super(props as any);
    this.emptyArray = [];
  }

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

  render() {
    const className = this.props['className'];
    const { id } = this.props;
    let { value, placeholder, options, autoBlur, clearable, searchable } = this.props;
    const { disabled } = this.props;

    value = this.findFullOptionValue();
    placeholder = (placeholder || '');
    options = (options || this.emptyArray);
    autoBlur = (isBoolean(autoBlur) ? autoBlur : true);
    clearable = (isBoolean(clearable) ? clearable : true);
    searchable = (isBoolean(searchable) ? searchable : false);

    return (
      <ReactSelect
        id={id}
        className={className}
        isClearable={clearable}
        isSearchable={searchable}
        menuShouldScrollIntoView={false}
        blurInputOnSelect={autoBlur}
        value={value}
        placeholder={placeholder}
        options={options}
        onChange={this.handleOnChange}
        onBlur={this.props.onBlur}
        isDisabled={disabled}
        styles={selectStyles}
      />
    );
  }
}
