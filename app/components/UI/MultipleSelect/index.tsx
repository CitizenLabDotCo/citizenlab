import React from 'react';
import { isBoolean } from 'lodash';
import ReactSelect from 'react-select';
import { IOption } from 'typings';
import styled from 'styled-components';
import GetTenant from 'resources/GetTenant';
import { isNilOrError } from 'utils/helperUtils';
import selectStyles from 'components/UI/Select/styles';

const StyledMultipleSelect = styled(ReactSelect)`
  max-width: calc(100% - 30px);
  font-size: 16px;
`;

export type Props = {
  id?: string | undefined;
  value: IOption[] | null | undefined;
  placeholder?: string | JSX.Element | undefined;
  options: IOption[] | null | undefined;
  max?: number;
  autoBlur?: boolean;
  onChange: (arg: IOption[]) => void;
  disabled?: boolean;
};

type State = {};

export class MultipleSelect extends React.PureComponent<Props & {tenantColor: string | null}, State> {
  private emptyArray: never[];
  private customStyle: any = {};

  constructor(props: Props) {
    super(props as any);
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
    const className = this.props['className'];
    const { id } = this.props;
    let { value, placeholder, options, max, autoBlur } = this.props;

    value = (value || this.emptyArray);
    placeholder = (placeholder || '');
    options = (options || this.emptyArray);
    max = (max || undefined);
    autoBlur = (isBoolean(autoBlur) ? autoBlur : false);

    return (
      <StyledMultipleSelect
        id={id}
        className={className}
        isMulti
        searchable
        openOnFocus={false}
        autoBlur={autoBlur}
        backspaceRemoves={false}
        scrollMenuIntoView={false}
        clearable={false}
        value={value}
        placeholder={<span>{placeholder}</span>}
        options={options}
        onChange={this.handleOnChange}
        disabled={this.props.disabled}
        styles={this.customStyle}
      />
    );
  }
}

export default (props: Props) => (
  <GetTenant>
    {(tenant) => (
      <MultipleSelect tenantColor={isNilOrError(tenant) ? null : tenant.attributes.settings.core.color_main} {...props} />
    )}
  </GetTenant>
);
