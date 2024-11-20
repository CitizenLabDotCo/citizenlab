import React from 'react';

import { media, isRtl } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useNavbarItems from 'api/navbar/useNavbarItems';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../../messages';

import AdminPublicationsNavbarItem from './AdminPublicationsNavbarItem';
import DesktopNavbarItem from './DesktopNavbarItem';
import getNavbarItemPropsArray from './getNavbarItemPropsArray';

const Container = styled.nav`
  height: 100%;
  margin-left: 35px;

  ${media.tablet`
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

const DesktopNavItems = () => {
  const { data: navbarItems } = useNavbarItems();
  const { formatMessage } = useIntl();

  if (isNilOrError(navbarItems)) return null;

  const navbarItemPropsArray = getNavbarItemPropsArray(navbarItems.data);

  return (
    <Container aria-label={formatMessage(messages.ariaLabel)}>
      <NavbarItems>
        {navbarItemPropsArray.map((navbarItemProps, i) => {
          const { linkTo, onlyActiveOnIndex, navigationItemTitle } =
            navbarItemProps;

          if (linkTo === '/projects') {
            return (
              <AdminPublicationsNavbarItem
                linkTo={linkTo}
                navigationItemTitle={navigationItemTitle}
                key={i}
              />
            );
          }
          if (linkTo) {
            return (
              <DesktopNavbarItem
                linkTo={linkTo}
                onlyActiveOnIndex={onlyActiveOnIndex}
                navigationItemTitle={navigationItemTitle}
                key={i}
              />
            );
          }
          return null;
        })}
      </NavbarItems>
    </Container>
  );
};

export default DesktopNavItems;
