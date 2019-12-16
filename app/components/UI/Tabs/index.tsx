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

const TabIcon = styled(Icon)`
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  fill: ${darken(0.1, colors.clIconSecondary)};
  margin-left: 10px;
`;

const Tab = styled.button`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  display: flex;
  white-space: nowrap;
  align-items: center;
  margin: 0;
  margin-left: -1px;
  padding: 1rem 1.6rem;
  background: #fff;
  border: solid 1px ${colors.adminTextColor};
  cursor: pointer;
  transition: all 80ms ease-out;

  ${TabIcon} {
    fill: ${colors.adminTextColor};
  }

  &.active {
    color: #fff;
    z-index: 1;
    background: ${colors.adminTextColor};

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
    background: ${colors.lightGreyishBlue};
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
  className?: string;
  onClick: (itemName: string) => void;
}

const Tabs = memo<Props>(({ items, selectedValue, onClick, className }) => {

  const removeFocus = useCallback((event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
  }, []);

  const handleTabOnClick = useCallback((event: MouseEvent<HTMLElement>) => {
    const newSelectedValue = event.currentTarget.dataset.itemvalue as string;
    onClick(newSelectedValue);
  }, []);

  return (
    <Container className={className} role="tablist">
      {items.map((item: ITabItem, index) =>
        <Tab
          id={item.value}
          role="tab"
          aria-selected={selectedValue === item.value}
          aria-controls={item.value}
          key={item.value}
          className={`item${index + 1} ${selectedValue === item.value ? 'active' : ''}`}
          onMouseDown={removeFocus}
          onClick={handleTabOnClick}
          data-itemvalue={item.value}
        >
          <TabText>{item.label}</TabText>
          {item.icon && <TabIcon name={item.icon} />}
        </Tab>
      )}
    </Container>
  );
});

export default Tabs;
