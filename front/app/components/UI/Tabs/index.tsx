import React, { memo, useCallback, MouseEvent } from 'react';

import {
  Icon,
  IconNames,
  colors,
  fontSizes,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { removeFocusAfterMouseClick } from 'utils/helperUtils';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const TabText = styled.span`
  color: ${colors.primary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  white-space: nowrap;
`;

const TabIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  flex: 0 0 24px;
  margin-left: 10px;
`;

const Tab = styled.button<{ minWidth?: number; disabled?: boolean }>`
  display: flex;
  align-items: center;
  margin: 0;
  margin-left: -1px;
  padding: 11px 18px;
  background: #fff;
  border-radius: 0;
  border: solid 1px ${colors.grey700};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all 80ms ease-out;
  justify-content: center;
  height: ${stylingConsts.inputHeight}px;
  ${(props) => props.minWidth && `min-width: ${props.minWidth}px;`}

  &.first {
    border-top-left-radius: ${({ theme }) => theme.borderRadius};
    border-bottom-left-radius: ${({ theme }) => theme.borderRadius};
  }

  &.last {
    border-top-right-radius: ${({ theme }) => theme.borderRadius};
    border-bottom-right-radius: ${({ theme }) => theme.borderRadius};
  }

  &:not(.selected):hover,
  &:not(.selected):focus {
    z-index: 10;
  }

  &.selected {
    border-color: ${colors.primary};
    background: ${colors.primary};

    ${TabText} {
      color: #fff;
    }

    ${TabIcon} {
      fill: #fff;
    }
  }
`;

export interface ITabItem {
  name: string;
  label: string | JSX.Element;
  icon?: IconNames;
  className?: string;
}

export interface Props {
  items: ITabItem[];
  selectedValue: string;
  selectedTabBgColor?: string;
  className?: string;
  onClick: (itemName: string) => void;
  minTabWidth?: number;
  disabled?: boolean;
}

const Tabs = memo<Props>(
  ({
    items,
    selectedValue,
    onClick,
    className,
    minTabWidth,
    disabled = false,
  }) => {
    const handleTabOnClick = useCallback((event: MouseEvent<HTMLElement>) => {
      const newSelectedValue = event.currentTarget.dataset.itemvalue as string;
      onClick(newSelectedValue);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <Container className={className} role="tablist">
        {items.map((item: ITabItem, index) => (
          <Tab
            id={item.name}
            role="tab"
            aria-selected={selectedValue === item.name}
            aria-controls={item.name}
            key={item.name}
            className={`${selectedValue === item.name ? 'selected' : ''} ${
              index === 0 ? 'first' : ''
            } ${index + 1 === items.length ? 'last' : ''} ${item.className}`}
            onMouseDown={removeFocusAfterMouseClick}
            onClick={handleTabOnClick}
            data-itemvalue={item.name}
            type="button"
            minWidth={minTabWidth}
            disabled={disabled}
          >
            <TabText>{item.label}</TabText>
            {item.icon && <TabIcon name={item.icon} />}
          </Tab>
        ))}
      </Container>
    );
  }
);

export default Tabs;
