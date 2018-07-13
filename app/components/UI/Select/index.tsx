import React from 'react';
import { isBoolean } from 'lodash';
import ReactSelect from 'react-select';
import { IOption } from 'typings';
import GetTenant from 'resources/GetTenant';
import { isNilOrError } from 'utils/helperUtils';
import selectStyles from 'components/UI/Select/styles';

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

export class Select extends React.PureComponent<Props & {tenantColor: string | null}, State> {
  private emptyArray: never[];
  private customStyle: any = {};

  constructor(props: Props & {tenantColor: string | null}) {
    super(props as any);
    this.emptyArray = [];
  }

  componentDidUpdate(prevProps) {
    if (this.props.tenantColor && !prevProps.tenantColor) {
      const { tenantColor } = this.props;
      this.customStyle = selectStyles(tenantColor);
    }
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
      <ReactSelect
        id={id}
        className={className}
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
        styles={this.customStyle}
      />
    );
  }
}

export default (props: Props) => (
  <GetTenant>
    {(tenant) => (
      <Select tenantColor={isNilOrError(tenant) ? null : tenant.attributes.settings.core.color_main} {...props} />
    )}
  </GetTenant>
);
