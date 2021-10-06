import React from 'react';
import { List, Row, LockedRow } from 'components/admin/ResourceList';
import { ChildProps as Props } from '.';
import PageRow from './NavbarItemRow';

export default ({
  navbarItems,
  getDisplaySettings,
  lockFirstNItems,
  onClickAddButton,
}: Props) => (
  <List key={navbarItems.length}>
    {navbarItems.map((navbarItem, i) => {
      if (lockFirstNItems && i < lockFirstNItems) {
        return (
          <LockedRow
            isLastItem={i === navbarItems.length - 1}
            key={navbarItem.id}
          >
            <PageRow
              navbarItem={navbarItem}
              displaySettings={getDisplaySettings(navbarItem)}
              onClickAddButton={onClickAddButton}
            />
          </LockedRow>
        );
      } else {
        return (
          <Row
            id={navbarItem.id}
            key={navbarItem.id}
            isLastItem={i === navbarItems.length - 1}
          >
            <PageRow
              navbarItem={navbarItem}
              displaySettings={getDisplaySettings(navbarItem)}
              onClickAddButton={onClickAddButton}
            />
          </Row>
        );
      }
    })}
  </List>
);
