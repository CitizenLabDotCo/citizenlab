import React, { PureComponent } from 'react';
import { isString, get } from 'lodash-es';
import Icon from 'components/UI/Icon';
import { IOption } from 'typings';
import styled from 'styled-components';
import { defaultInputStyle, colors } from 'utils/styleUtils';

const Arrow = styled(Icon)`
  width: 12px;
  height: 12px;
  fill: #999;
  pointer-events: none;
  transform: rotate(90deg);
  margin: auto;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 11px;
`;

const CustomSelect = styled.select`
  ${defaultInputStyle};
  width: 100%;
  margin: 0;
  padding-top: 11px;
  padding-bottom: 11px;
  padding-right: 27px;
  cursor: pointer;

  &::-ms-expand {
    display: none;
  }
`;

const Container = styled.div`
  position: relative;

  &.enabled {
    &:hover {
      ${Arrow} {
        fill: ${colors.hoveredBorder};
      }
    }

    &:focus {
      ${Arrow} {
        fill: ${colors.focussedBorder};
      }
    }
  }

  &.disabled {
    ${Arrow} {
      fill: #666;
    }
  }
`;

export interface DefaultProps {
  canBeEmpty?: boolean;
}

export interface Props extends DefaultProps {
  id?: string;
  value?: IOption | string | null;
  placeholder?: string | JSX.Element | null;
  options: IOption[] | null;
  onChange: (arg: IOption) => void;
  onBlur?: (event: React.FocusEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  className?: string;
}

interface State {}

export default class Select extends PureComponent<Props, State> {
  static defaultProps: DefaultProps = {
    canBeEmpty: false,
  };

  handleOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (this.props.options) {
      const selectedOption = this.props.options.find(
        (option) => option.value.toString() === event.target.value.toString()
      ) as IOption;
      this.props.onChange(selectedOption);
    }
  };

  handleOnBlur = (event: React.FocusEvent<HTMLSelectElement>) => {
    if (this.props.onBlur) {
      this.props.onBlur(event);
    }
  };

  render() {
    const { id, disabled, className, options, canBeEmpty } = this.props;
    const defaultValue = 'DEFAULT_SELECT_VALUE';
    const value = isString(this.props.value)
      ? this.props.value
      : (get(this.props.value, 'value', null) as string | null);
    const selectedValue = !!(
      options && options.find((option) => option.value === value)
    )
      ? (options.find((option) => option.value === value)?.value as string)
      : defaultValue;

    return (
      <Container
        className={`${className} ${disabled ? 'disabled' : 'enabled'}`}
      >
        <CustomSelect
          id={id}
          disabled={disabled}
          onChange={this.handleOnChange}
          onBlur={this.handleOnBlur}
          className={disabled ? 'disabled' : 'enabled'}
          value={selectedValue}
        >
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
              >
                {option.label}
              </option>
            ))}
        </CustomSelect>
        <Arrow
          name="chevron-right"
          className={`arrow ${disabled ? 'disabled' : 'enabled'}`}
        />
      </Container>
    );
  }
}
