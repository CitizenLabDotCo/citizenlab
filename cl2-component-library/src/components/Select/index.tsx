import React, { PureComponent, FocusEvent, ChangeEvent } from 'react';
import { isString, get, isNumber } from 'lodash-es';
import Icon from '../Icon';
import Label from '../Label';
import IconTooltip from '../IconTooltip';
import { IOption, InputSize } from '../../utils/typings';
import styled from 'styled-components';
import { defaultInputStyle, colors, isRtl } from '../../utils/styleUtils';
import testEnv from '../../utils/testUtils/testEnv';

const Arrow = styled(Icon)`
  fill: #999;
  pointer-events: none;
  transform: rotate(90deg);
  margin: auto;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 11px;

  ${isRtl`
    right: auto;
    left: 11px;
  `}
`;

const Container = styled.div`
  position: relative;
  outline: none !important;

  &.enabled {
    &:hover {
      ${Arrow} {
        fill: ${colors.black};
      }
    }

    &:focus {
      ${Arrow} {
        fill: ${colors.black};
      }
    }
  }

  &.disabled {
    ${Arrow} {
      fill: #666;
    }
  }

  select.placeholder {
    color: ${colors.placeholder};
  }

  select.placeholder > option {
    color: ${colors.textPrimary};
  }
`;

const SelectWrapper = styled.div`
  width: 100%;
  position: relative;
  select {
    width: 100%;
    margin: 0;
    padding-right: 27px;
    cursor: pointer;
    outline: none !important;

    ${isRtl`
    padding-right: 0;
    padding-left: 27px;
  `}
    &::-ms-expand {
      display: none;
    }
    ${defaultInputStyle};
  }
`;

export interface DefaultProps {
  canBeEmpty?: boolean;
}

export interface Props extends DefaultProps {
  id?: string;
  disabled?: boolean;
  onChange: (arg: IOption) => void;
  onBlur?: (event: FocusEvent<HTMLSelectElement>) => void;
  value?: IOption | string | number | null;
  options: IOption[] | null;
  label?: string | JSX.Element | null;
  labelTooltipText?: string | JSX.Element | null;
  className?: string;
  size?: InputSize;
  placeholder?: string;
}

const defaultValue = 'DEFAULT_SELECT_VALUE';
const placeholderValue = 'PLACEHOLDER_SELECT_VALUE';

const getSelectedValue = (
  options: IOption[] | null,
  value: any,
  placeholder?: string
) => {
  const selectedValue = options?.find(
    (option) => option.value === value
  )?.value;
  if (selectedValue) return selectedValue;

  return placeholder !== undefined ? placeholderValue : defaultValue;
};

class Select extends PureComponent<Props> {
  static defaultProps: DefaultProps = {
    canBeEmpty: false,
  };

  handleOnChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { options, onChange } = this.props;

    // comparing the string versions since event.target.value returns a string even when the value was defined as a number
    const selectedOption = options?.find(
      (option) => option.value.toString() === event.target.value.toString()
    );
    if (selectedOption) onChange(selectedOption);
  };

  handleOnBlur = (event: FocusEvent<HTMLSelectElement>) => {
    this.props?.onBlur?.(event);
  };

  render() {
    const {
      id,
      disabled,
      className,
      options,
      canBeEmpty,
      label,
      labelTooltipText,
      size,
      value,
      placeholder,
    } = this.props;
    const safeValue =
      isString(value) || isNumber(value) ? value : get(value, 'value', null);

    const selectedValue = getSelectedValue(options, safeValue, placeholder);

    const showPlaceholder = selectedValue === placeholderValue;

    return (
      <Container
        className={`${className} ${disabled ? 'disabled' : 'enabled'}`}
      >
        {label && (
          <Label htmlFor={id}>
            <span>{label}</span>
            {labelTooltipText && <IconTooltip content={labelTooltipText} />}
          </Label>
        )}
        <SelectWrapper size={size}>
          <select
            id={id}
            disabled={disabled}
            onChange={this.handleOnChange}
            onBlur={this.handleOnBlur}
            className={`${disabled ? 'disabled' : 'enabled'} ${
              showPlaceholder ? 'placeholder' : ''
            }`}
            value={selectedValue}
            data-testid={testEnv('select')}
          >
            {placeholder !== undefined && (
              <option
                value={placeholderValue}
                aria-selected={showPlaceholder}
                hidden
                disabled
              >
                {placeholder}
              </option>
            )}

            <option
              value={defaultValue}
              aria-selected={selectedValue === defaultValue}
              hidden={!canBeEmpty}
              disabled={!canBeEmpty}
            />

            {options &&
              options.length > 0 &&
              options.map((option, index) => (
                <option
                  key={index}
                  value={option.value}
                  aria-selected={selectedValue === option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))}
          </select>
          <Arrow
            name="chevron-right"
            ariaHidden
            className={`arrow ${disabled ? 'disabled' : 'enabled'}`}
          />
        </SelectWrapper>
      </Container>
    );
  }
}

export default Select;
