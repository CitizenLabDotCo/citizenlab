import React, { memo, useCallback, MouseEvent } from 'react';

// components
import Icon, { IconNames } from 'components/UI/Icon';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { rgba, darken } from 'polished';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const Tab = styled.button`
  font-size: ${fontSizes.base}px;
  padding: 1rem 1.7rem;
  background: ${colors.adminContentBackground};
  border: solid 1px ${colors.separation};
  cursor: pointer;
  transition: all 100ms ease-out;
  margin-left: -1px;

  &.active {
    background: ${rgba(colors.adminTextColor, 0.15)};
    z-index: 1;
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
    background: ${rgba(colors.adminTextColor, 0.05)};
    z-index: 1;
  }

  @media print {
    &.active {
      font-weight: 600;
    }
  }
`;

const StyledIcon = styled(Icon)`
  height: 20px;
  fill: ${darken(0.1, colors.clIconSecondary)};
  margin-left: 10px;
`;

export interface ITabItem {
  name: string;
  icon?: IconNames;
}

interface Props {
  items: ITabItem[];
  selectedItemName: string;
  className?: string;
  onClick: (itemName: string) => void;
}

const Tabs = memo<Props>(({ items, selectedItemName, onClick, className }) => {

  const removeFocus = useCallback((event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
  }, []);

  const handleTabOnClick = useCallback((event: MouseEvent<HTMLElement>) => {
    const itemName = event.currentTarget.dataset.itemname as string;
    onClick(itemName);
  }, []);

  return (
    <Container className={className}>
      {items.map((item: ITabItem, index) =>
        <Tab
          key={item.name}
          className={`item${index + 1} ${selectedItemName === item.name ? 'active' : ''}`}
          onMouseDown={removeFocus}
          onClick={handleTabOnClick}
          data-itemname={item.name}
        >
          {item.name}
          {item.icon && <StyledIcon name={item.icon} />}
        </Tab>
      )}
    </Container>
  );
});

export default Tabs;
