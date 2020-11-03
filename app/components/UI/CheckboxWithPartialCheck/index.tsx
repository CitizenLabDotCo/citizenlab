import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { colors, fontSizes, isRtl } from 'utils/styleUtils';
import { Icon } from 'cl2-component-library';
import { get } from 'lodash-es';
// https://www.w3.org/TR/2016/WD-wai-aria-practices-1.1-20160317/examples/checkbox/checkbox-2.html

const Container = styled.div<{ size: string }>`
  display: flex;
  align-items: center;
  cursor: pointer;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  &.hasNoLabel {
    flex: 0 0 ${({ size }) => parseInt(size, 10) + 2}px;
    width: ${({ size }) => parseInt(size, 10) + 2}px;
    height: ${({ size }) => parseInt(size, 10) + 2}px;
  }

  label {
    cursor: pointer;
  }

  &.disabled {
    cursor: not-allowed;
    label {
      cursor: not-allowed;
    }
  }
`;

const CustomInputWrapper = styled.div<{
  checked: boolean | 'mixed';
  size: string;
}>`
  position: relative;
  flex: 0 0 ${({ size }) => parseInt(size, 10)}px;
  width: ${({ size }) => parseInt(size, 10)}px;
  height: ${({ size }) => parseInt(size, 10)}px;
  color: #fff;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  border: solid 1px ${colors.separationDark};
  border-radius: ${(props) => props.theme.borderRadius};
  background: ${(props) => (props.checked ? colors.clGreen : '#fff')};
  border-color: ${(props) => (props.checked ? colors.clGreen : '#aaa')};
  box-shadow: inset 0px 1px 1px rgba(0, 0, 0, 0.15);

  &:hover {
    border-color: ${(props) =>
      props.checked === 'mixed'
        ? colors.clBlueLightest
        : props.checked
        ? colors.clGreen
        : '#333'};
  }
`;

const CheckmarkIcon = styled(Icon)`
  fill: #fff;
  width: 15px;
`;

const Label = styled.label`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  margin-left: 10px;

  ${isRtl`
    margin-left: 0;
    margin-right: 10px;
  `}
`;

type DefaultProps = {
  size?: string;
};

/**
 * If we have a label, an id is required. Otherwise id is optional.
 */
type LabelProps =
  | {
      label: string | JSX.Element | null;
      id: string;
    }
  | {
      label?: undefined;
      id?: string | undefined;
    };

type Props = DefaultProps &
  LabelProps & {
    checked: boolean | 'mixed';
    onChange: (event: React.MouseEvent | React.KeyboardEvent) => void;
    className?: string;
    notFocusable?: boolean;
    disabled?: boolean;
  };

export default class CheckboxWithPartialCheck extends PureComponent<Props> {
  static defaultProps: DefaultProps = {
    size: '22px',
  };

  handleOnClick = (event: React.MouseEvent) => {
    const { disabled } = this.props;
    if (!disabled) {
      const targetElement = get(event, 'target') as any;
      const parentElement = get(event, 'target.parentElement');
      const targetElementIsLink =
        targetElement &&
        targetElement.hasAttribute &&
        targetElement.hasAttribute('href');
      const parentElementIsLink =
        parentElement &&
        parentElement.hasAttribute &&
        parentElement.hasAttribute('href');

      if (!targetElementIsLink && !parentElementIsLink) {
        event && event.preventDefault();
        this.props.onChange(event);
      }
    }
  };

  handleOnKeyDown = (event: React.KeyboardEvent) => {
    const { disabled } = this.props;
    if (!disabled) {
      const targetElement = get(event, 'target') as any;
      const parentElement = get(event, 'target.parentElement');
      const targetElementIsLink =
        targetElement &&
        targetElement.hasAttribute &&
        targetElement.hasAttribute('href');
      const parentElementIsLink =
        parentElement &&
        parentElement.hasAttribute &&
        parentElement.hasAttribute('href');

      // if key = Space
      if (
        !targetElementIsLink &&
        !parentElementIsLink &&
        event.keyCode === 32
      ) {
        event && event.preventDefault();
        this.props.onChange(event);
      }
    }
  };

  removeFocus = (event: React.FormEvent) => {
    event.preventDefault();
  };

  render() {
    const { label, size, checked, className, notFocusable } = this.props;

    return (
      <Container
        size={size as string}
        onMouseDown={this.removeFocus}
        onClick={this.handleOnClick}
        onKeyDown={this.handleOnKeyDown}
        className={`${className ? className : ''} ${
          label ? 'hasLabel' : 'hasNoLabel'
        }`}
        role="checkbox"
        aria-checked={checked}
        tabIndex={notFocusable ? -1 : 0}
      >
        <CustomInputWrapper size={size as string} checked={checked}>
          {checked === 'mixed' ? (
            <CheckmarkIcon ariaHidden name="more-options" />
          ) : (
            checked && <CheckmarkIcon ariaHidden name="checkmark" />
          )}
        </CustomInputWrapper>

        <Label>{label}</Label>
      </Container>
    );
  }
}
