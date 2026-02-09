import React, { PureComponent, FocusEvent, ChangeEvent } from 'react';

import { isString, get, isNumber } from 'lodash-es';
import styled from 'styled-components';
import { Placement } from 'tippy.js';

import {
  defaultInputStyle,
  colors,
  isRtl,
  stylingConsts,
} from '../../utils/styleUtils';
import testEnv from '../../utils/testUtils/testEnv';
import { IOption, InputSize } from '../../utils/typings';
import Icon from '../Icon';
import IconTooltip from '../IconTooltip';
import Label from '../Label';

export const SelectIcon = styled(Icon)`
  fill: #999;
  pointer-events: none;
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
      ${SelectIcon} {
        fill: ${colors.black};
      }
    }

    &:focus {
      ${SelectIcon} {
        fill: ${colors.black};
      }
    }
  }

  &.disabled {
    ${SelectIcon} {
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

export const SelectWrapper = styled.div<{
  mr?: string;
  size?: InputSize;
  height?: string;
}>`
  width: 100%;
  position: relative;
  select {
    width: 100%;
    margin: 0;
    padding-right: 27px;
    cursor: pointer;
    outline: none !important;

    ${({ mr }) => (mr ? `margin-right: ${mr};` : '')}

    ${isRtl`
    padding-right: 0;
    padding-left: 27px;
  `}
    &::-ms-expand {
      display: none;
    }
    ${defaultInputStyle};
    height: ${({ height }) =>
      height ? height : `${stylingConsts.inputHeight}px`} !important;
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
  labelTooltipPlacement?: Placement;
  className?: string;
  size?: InputSize;
  height?: string;
  placeholder?: string;
  mr?: string;
  dataCy?: string;
}

const DEFAULT_VALUE = 'DEFAULT_SELECT_VALUE';
const PLACEHOLDER_VALUE = 'PLACEHOLDER_SELECT_VALUE';

const getSelectedValue = (
  options: IOption[] | null,
  value: any,
  placeholder?: string
) => {
  const selectedValue = options?.find(
    (option) => option.value === value
  )?.value;
  if (selectedValue) return selectedValue;

  return placeholder !== undefined ? PLACEHOLDER_VALUE : DEFAULT_VALUE;
};

class Select extends PureComponent<Props> {
  static defaultProps: DefaultProps = {
    canBeEmpty: false,
  };

  handleOnChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { options, onChange } = this.props;

    // comparing the string versions since event.target.value returns a string even when the value was defined as a number
    const selectedOption = options?.find(
      (option) => option.value?.toString() === event.target.value.toString()
    );
    if (selectedOption) onChange(selectedOption);
    else if (event.target.value === 'DEFAULT_SELECT_VALUE') {
      // Reset the value to undefined if the default value is selected
      onChange({ value: undefined, label: '' });
    }
  };

  handleOnBlur = (event: FocusEvent<HTMLSelectElement>) => {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
      labelTooltipPlacement,
      height,
      size,
      value,
      placeholder,
      mr,
      dataCy,
    } = this.props;

    const safeValue =
      isString(value) || isNumber(value) ? value : get(value, 'value', null);

    const selectedValue = getSelectedValue(options, safeValue, placeholder);

    const showPlaceholder = selectedValue === PLACEHOLDER_VALUE;

    return (
      <Container
        className={`${className} ${disabled ? 'disabled' : 'enabled'}`}
      >
        {label && (
          <Label htmlFor={id}>
            <span>{label}</span>
            {labelTooltipText && (
              <IconTooltip
                content={labelTooltipText}
                placement={labelTooltipPlacement}
              />
            )}
          </Label>
        )}
        <SelectWrapper mr={mr} size={size} height={height}>
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
            data-cy={dataCy}
          >
            {placeholder !== undefined && (
              <option
                value={PLACEHOLDER_VALUE}
                aria-selected={showPlaceholder}
                hidden
                disabled
              >
                {placeholder}
              </option>
            )}

            <option
              value={DEFAULT_VALUE}
              aria-selected={selectedValue === DEFAULT_VALUE}
              // The `canBeEmpty` prop adds an 'empty' option to the select,
              // which doesn't work very well because you can't actually select
              // it.
              // For this reason, usually we implement this 'empty option'
              // in a different way, see e.g. components/UI/ProjectFilter.

              // At the moment, the canBeEmpty prop is not used a lot-
              // it's only used in the JSON form select controls
              // (SingleSelectControl and SingleSelectEnumControl)
              // It's NOT recommended to use it.
              // In the two cases above, it's used because otherwise
              // the select cannot be used with keyboard navigation
              // in Firefox, in some cases, for some unknown reason.
              // It's very likely this keyboard navigation is broken
              // in other places, but at the moment of writing
              // we don't have time to fix it everywhere else.
              //
              // In the future we really need to refactor this component
              // and fix this situation, so that it works properly.
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
          <SelectIcon
            name="chevron-down"
            ariaHidden
            className={`arrow ${disabled ? 'disabled' : 'enabled'}`}
          />
        </SelectWrapper>
      </Container>
    );
  }
}

export default Select;
