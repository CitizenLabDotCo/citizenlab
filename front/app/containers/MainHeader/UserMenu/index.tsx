import React, { useState, lazy, Suspense } from 'react';
import { isNilOrError, removeFocusAfterMouseClick } from 'utils/helperUtils';

// components
import User from './User';
const UserMenuDropdown = lazy(() => import('./UserMenuDropdown'));

// style
import styled from 'styled-components';
import useAuthUser from 'hooks/useAuthUser';

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
  const authUser = useAuthUser();

  const toggleDropdown = () => {
    setOpened((opened) => !opened);
  };

  const closeDropdown = () => {
    setOpened(false);
  };

  if (!isNilOrError(authUser)) {
    const userId = authUser.id;

    return (
      <Container
        id="e2e-user-menu-container"
        className={
          authUser.attributes.verified ? 'e2e-verified' : 'e2e-not-verified'
        }
      >
        <DropdownButton
          onMouseDown={removeFocusAfterMouseClick}
          onClick={toggleDropdown}
          aria-expanded={opened}
          className="intercom-user-menu-button"
          id="e2e-user-menu-dropdown-button"
        >
          <User userId={userId} />
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
