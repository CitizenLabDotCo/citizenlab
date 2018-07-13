import React from 'react';
import { isBoolean } from 'lodash';
import { AsyncCreatable as ReactSelect } from 'react-select';
import { IOption } from 'typings';
import GetTenant from 'resources/GetTenant';
import { isNilOrError } from 'utils/helperUtils';
import selectStyles from 'components/UI/Select/styles';

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

export class AsyncMultipleSelect extends React.PureComponent<Props & {tenantColor: string | null}, State> {
  private emptyArray: never[];
  private customStyle: any = {};

  constructor(props) {
    super(props);
    this.emptyArray = [];
  }

  componentDidUpdate(prevProps) {
    if (this.props.tenantColor && !prevProps.tenantColor) {
      const { tenantColor } = this.props;
      this.customStyle = selectStyles(tenantColor);
    }
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
      <ReactSelect
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
        style={this.customStyle}
      />
    );
  }
}

export default (props: Props) => (
  <GetTenant>
    {(tenant) => (
      <AsyncMultipleSelect tenantColor={isNilOrError(tenant) ? null : tenant.attributes.settings.core.color_main} {...props} />
    )}
  </GetTenant>
);
