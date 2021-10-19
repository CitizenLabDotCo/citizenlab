import React from 'react';

// hooks
import useNavbarItems from 'hooks/useNavbarItems';
import usePages from 'hooks/usePages';
import useModuleEnabled from 'hooks/useModuleEnabled';

// components
import DesktopNavbarItem from './DesktopNavbarItem';
import AdminPublicationsNavbarItem from './AdminPublicationsNavbarItem';

// style
import styled from 'styled-components';
import { media, isRtl } from 'utils/styleUtils';

// utils
import { isNilOrError } from 'utils/helperUtils';
import getNavbarItemPropsArray from './getNavbarItemPropsArray';

const Container = styled.nav`
  height: 100%;
  margin-left: 35px;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
  ${isRtl`
    margin-right: 35px;
    margin-left: 0;
  `}
`;

const NavbarItems = styled.ul`
  display: flex;
  align-items: stretch;
  margin: 0;
  padding: 0;
  height: 100%;
  ${isRtl`
    flex-direction: row-reverse;
  `};
`;

const DesktopNavbar = () => {
  const navbarItems = useNavbarItems({ visible: true });
  const pages = usePages();
  const customNavbarEnabled = useModuleEnabled('commercial/navbar');

  if (isNilOrError(navbarItems) || isNilOrError(pages)) return null;

  const navbarItemPropsArray = getNavbarItemPropsArray(
    navbarItems,
    pages,
    customNavbarEnabled
  );

  return (
    <Container>
      <NavbarItems>
        {navbarItemPropsArray.map((navbarItemProps) => {
          const { linkTo } = navbarItemProps;

          if (linkTo === '/projects') {
            return <AdminPublicationsNavbarItem key={linkTo} />;
          }

          return <DesktopNavbarItem {...navbarItemProps} key={linkTo} />;
        })}
      </NavbarItems>
    </Container>
  );
};

export default DesktopNavbar;
