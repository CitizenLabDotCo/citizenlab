import React, { memo, useCallback, MouseEvent } from 'react';

// components
import Icon, { IconNames } from 'components/UI/Icon';

// utils
import { isPage } from 'utils/helperUtils';

// styling
import styled, { withTheme } from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { rgba } from 'polished';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const TabIcon = styled(Icon)`
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  margin-left: 10px;
`;

const Tab = styled.button<{ activeTabColor: string }>`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  display: flex;
  white-space: nowrap;
  align-items: center;
  margin: 0;
  padding: 12px 18px;
  background: #fff;
  border: solid 1px ${colors.separation};
  cursor: pointer;
  transition: all 80ms ease-out;

  ${TabIcon} {
    fill: ${colors.label};
  }

  &.last {
    border-left: none;
  }

  &.active {
    color: #fff;
    z-index: 1;
    border-color: ${({ activeTabColor }) => activeTabColor};
    background: ${({ activeTabColor }) => activeTabColor};

    ${TabIcon} {
      fill: #fff;
    }
  }

  &:first-child {
    margin-left: 0px;
    border-radius: ${({ theme }) => theme.borderRadius} 0 0 ${({ theme }) => theme.borderRadius};
  }

  &:last-child {
    border-radius: 0 ${({ theme }) => theme.borderRadius} ${({ theme }) => theme.borderRadius} 0;
    margin-right: 0;
  }

  &:not(.active):hover,
  &:not(.active):focus {
    background: ${({ activeTabColor }) => rgba(activeTabColor, 0.1)};
    z-index: 1;
  }

  @media print {
    &.active {
      font-weight: 600;
    }
  }
`;

const TabText = styled.span`
  white-space: nowrap;
`;

export interface ITabItem {
  value: string;
  label: string | JSX.Element;
  icon?: IconNames;
}

interface Props {
  items: ITabItem[];
  selectedValue: string;
  activeTabColor?: string;
  className?: string;
  onClick: (itemName: string) => void;
  theme: any;
}

const Tabs = memo<Props>(({ items, selectedValue, activeTabColor, onClick, theme, className }) => {

  const removeFocus = useCallback((event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
  }, []);

  const handleTabOnClick = useCallback((event: MouseEvent<HTMLElement>) => {
    const newSelectedValue = event.currentTarget.dataset.itemvalue as string;
    onClick(newSelectedValue);
  }, []);

  return (
    <Container
      className={className}
      role="tablist"
    >
      {items.map((item: ITabItem, index) =>
        <Tab
          id={item.value}
          role="tab"
          aria-selected={selectedValue === item.value}
          aria-controls={item.value}
          key={item.value}
          className={`item${index + 1} ${selectedValue === item.value ? 'active' : ''} ${index + 1 === items.length ? 'last' : ''}`}
          onMouseDown={removeFocus}
          onClick={handleTabOnClick}
          data-itemvalue={item.value}
          activeTabColor={activeTabColor || (isPage('admin', location.pathname) ? colors.adminTextColor : theme.colorText)}
        >
          <TabText>{item.label}</TabText>
          {item.icon && <TabIcon name={item.icon} />}
        </Tab>
      )}
    </Container>
  );
});

export default withTheme(Tabs);
