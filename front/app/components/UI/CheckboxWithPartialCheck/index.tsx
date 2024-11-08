import React, { PureComponent } from 'react';

import {
  colors,
  fontSizes,
  isRtl,
  Icon,
} from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import styled from 'styled-components';

import { removeFocusAfterMouseClick } from 'utils/helperUtils';

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
  border: 1px solid;
  border-radius: ${(props) => props.theme.borderRadius};
  background: ${(props) => (props.checked ? colors.success : '#fff')};
  border-color: ${(props) => (props.checked ? colors.success : colors.grey600)};

  &:hover {
    border-color: ${(props) =>
      props.checked === 'mixed'
        ? colors.teal100
        : props.checked
        ? colors.success
        : '#333'};
  }
`;

const CheckmarkIcon = styled(Icon)`
  fill: #fff;
`;

const Label = styled.label`
  color: ${colors.textSecondary};
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
    'data-testid'?: string;
  };

export default class CheckboxWithPartialCheck extends PureComponent<Props> {
  static defaultProps: DefaultProps = {
    size: '22px',
  };

  handleOnClick = (event: React.MouseEvent) => {
    const { disabled } = this.props;
    if (!disabled) {
      const targetElement = get(event, 'target') as any;
      const parentElement = get(event, 'target.parentElement') as any;
      const targetElementIsLink =
        targetElement &&
        targetElement.hasAttribute &&
        targetElement.hasAttribute('href');
      const parentElementIsLink =
        parentElement &&
        parentElement.hasAttribute &&
        parentElement.hasAttribute('href');

      if (!targetElementIsLink && !parentElementIsLink) {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        event && event.preventDefault();
        this.props.onChange(event);
      }
    }
  };

  handleOnKeyDown = (event: React.KeyboardEvent) => {
    const { disabled } = this.props;
    if (!disabled) {
      const targetElement = get(event, 'target') as any;
      const parentElement = get(event, 'target.parentElement') as any;
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
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        event && event.preventDefault();
        this.props.onChange(event);
      }
    }
  };

  render() {
    const {
      label,
      size,
      checked,
      className,
      notFocusable,
      'data-testid': testid,
    } = this.props;

    return (
      <Container
        size={size as string}
        onMouseDown={removeFocusAfterMouseClick}
        onClick={this.handleOnClick}
        onKeyDown={this.handleOnKeyDown}
        className={`${className ? className : ''} ${
          label ? 'hasLabel' : 'hasNoLabel'
        }`}
        role="checkbox"
        aria-checked={checked}
        tabIndex={notFocusable ? -1 : 0}
        data-testid={testid}
      >
        <CustomInputWrapper size={size as string} checked={checked}>
          {checked === 'mixed' ? (
            <CheckmarkIcon ariaHidden name="dots-horizontal" />
          ) : (
            checked && <CheckmarkIcon ariaHidden name="check" />
          )}
        </CustomInputWrapper>

        <Label>{label}</Label>
      </Container>
    );
  }
}
