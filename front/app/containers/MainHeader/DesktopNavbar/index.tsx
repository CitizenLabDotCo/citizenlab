import React from 'react';

// hooks
import useNavbarItems from 'hooks/useNavbarItems';
import useCustomPageSlugById from 'hooks/useCustomPageSlugById';

// components
import DesktopNavbarItem from './DesktopNavbarItem';
import AdminPublicationsNavbarItem from './AdminPublicationsNavbarItem';

// style
import styled from 'styled-components';
import { media, isRtl } from 'utils/styleUtils';

// utils
import { isNilOrError } from 'utils/helperUtils';
import getNavbarItemPropsArray from './getNavbarItemPropsArray';

// i18n
import { injectIntl } from 'utils/cl-intl';
import messages from '../messages';
import { WrappedComponentProps } from 'react-intl';

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

const DesktopNavbar = ({ intl: { formatMessage } }: WrappedComponentProps) => {
  const navbarItems = useNavbarItems();
  const pageSlugById = useCustomPageSlugById();

  if (isNilOrError(navbarItems) || isNilOrError(pageSlugById)) return null;

  const navbarItemPropsArray = getNavbarItemPropsArray(
    navbarItems,
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

export default injectIntl(DesktopNavbar);
