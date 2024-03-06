import React, { useState, lazy, Suspense } from 'react';

import { useBreakpoint } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';

import { isNilOrError, removeFocusAfterMouseClick } from 'utils/helperUtils';

import User from './User';

const UserMenuDropdown = lazy(() => import('./UserMenuDropdown'));

const Container = styled.div`
  height: 100%;
  display: flex;
  position: relative;
`;

const DropdownButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  padding: 0px;
  padding-top: 2px;
  margin: 0px;
`;

const UserMenu = () => {
  const [opened, setOpened] = useState(false);
  const { data: authUser } = useAuthUser();
  const isTabletOrSmaller = useBreakpoint('tablet');

  const toggleDropdown = () => {
    setOpened((opened) => !opened);
  };

  const closeDropdown = () => {
    setOpened(false);
  };

  if (!isNilOrError(authUser)) {
    const userId = authUser.data.id;

    return (
      <Container
        id="e2e-user-menu-container"
        className={
          authUser.data.attributes.verified
            ? 'e2e-verified'
            : 'e2e-not-verified'
        }
      >
        <DropdownButton
          onMouseDown={removeFocusAfterMouseClick}
          onClick={toggleDropdown}
          aria-expanded={opened}
          className="intercom-user-menu-button"
          id="e2e-user-menu-dropdown-button"
        >
          <User
            userId={userId}
            showVerificationBadge={isTabletOrSmaller ? false : true}
          />
        </DropdownButton>

        <Suspense fallback={null}>
          <UserMenuDropdown
            opened={opened}
            toggleDropdown={toggleDropdown}
            closeDropdown={closeDropdown}
          />
        </Suspense>
      </Container>
    );
  }

  return null;
};

export default UserMenu;
