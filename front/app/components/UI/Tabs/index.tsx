import React, { memo, useCallback, MouseEvent } from 'react';
import { removeFocusAfterMouseClick } from 'utils/helperUtils';

// components
import { Icon, IconNames } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const TabText = styled.span`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  white-space: nowrap;
`;

const TabIcon = styled(Icon)`
  fill: ${colors.label};
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  margin-left: 10px;
`;

const Tab = styled.button<{ index: number }>`
  display: flex;
  align-items: center;
  margin: 0;
  margin-left: -1px;
  padding: 11px 18px;
  background: #fff;
  border-radius: 0;
  border: solid 1px #aaa;
  z-index: ${({ index }) => index};
  cursor: pointer;
  transition: all 80ms ease-out;

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
    border-color: ${colors.adminTextColor};
  }

  &.selected {
    border-color: ${colors.adminTextColor};
    background: ${colors.adminTextColor};

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
}

interface Props {
  items: ITabItem[];
  selectedValue: string;
  selectedTabBgColor?: string;
  className?: string;
  onClick: (itemName: string) => void;
}

const Tabs = memo<Props>(({ items, selectedValue, onClick, className }) => {
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
          index={index + 1}
          role="tab"
          aria-selected={selectedValue === item.name}
          aria-controls={item.name}
          key={item.name}
          className={`${selectedValue === item.name ? 'selected' : ''} ${
            index === 0 ? 'first' : ''
          } ${index + 1 === items.length ? 'last' : ''}`}
          onMouseDown={removeFocusAfterMouseClick}
          onClick={handleTabOnClick}
          data-itemvalue={item.name}
        >
          <TabText>{item.label}</TabText>
          {item.icon && <TabIcon name={item.icon} />}
        </Tab>
      ))}
    </Container>
  );
});

export default Tabs;
