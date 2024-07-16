import React from 'react';

import { media, isRtl } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useCustomPageSlugById from 'api/custom_pages/useCustomPageSlugById';
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
  const pageSlugById = useCustomPageSlugById();
  const { formatMessage } = useIntl();

  if (isNilOrError(navbarItems) || isNilOrError(pageSlugById)) return null;

  const navbarItemPropsArray = getNavbarItemPropsArray(
    navbarItems.data,
    pageSlugById
  );

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

          return (
            <DesktopNavbarItem
              linkTo={linkTo}
              onlyActiveOnIndex={onlyActiveOnIndex}
              navigationItemTitle={navigationItemTitle}
              key={i}
            />
          );
        })}
      </NavbarItems>
    </Container>
  );
};

export default DesktopNavItems;
