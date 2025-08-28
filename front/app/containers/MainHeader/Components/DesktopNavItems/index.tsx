import React, { useRef, useEffect, useState, useCallback } from 'react';

import { media, isRtl } from '@citizenlab/cl2-component-library';
import { isEqual } from 'lodash-es';
import styled from 'styled-components';

import useNavbarItems from 'api/navbar/useNavbarItems';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../../messages';

import AdminPublicationsNavbarItem from './AdminPublicationsNavbarItem';
import DesktopNavbarItem from './DesktopNavbarItem';
import getNavbarItemPropsArray from './getNavbarItemPropsArray';
import MoreNavbarItem from './MoreNavbarItem';
import {
  NavbarItemProps,
  createTempElement,
  calculateItemDistribution,
} from './utils';

// Reserved space for right-side navigation elements (search, notifications, user menu, language selector, etc.)
const RESERVED_RIGHT_SPACE = 600;
const MORE_BUTTON_WIDTH = 80;

const Container = styled.nav`
  height: 100%;
  margin-left: 35px;
  flex: 1;
  overflow: visible;
  max-width: calc(100vw - ${RESERVED_RIGHT_SPACE}px);

  /* Hide desktop nav only on phones */
  ${media.phone`
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

const HiddenItemsContainer = styled.div`
  position: absolute;
  visibility: hidden;
  height: 0;
  overflow: hidden;
`;

const DesktopNavItems = () => {
  const { data: navbarItems } = useNavbarItems();
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenItemsRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<NavbarItemProps[]>([]);
  const [overflowItems, setOverflowItems] = useState<NavbarItemProps[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Function to calculate items when More button is needed
  const calculateItemsWithMoreButton = useCallback(
    (
      tempElements: HTMLElement[],
      allItems: NavbarItemProps[],
      availableWidth: number,
      moreButtonWidth: number
    ): { visible: NavbarItemProps[]; overflow: NavbarItemProps[] } => {
      return calculateItemDistribution(
        tempElements,
        allItems,
        availableWidth,
        moreButtonWidth
      );
    },
    []
  );

  // Function to measure available space and determine which items fit
  const calculateVisibleItems = useCallback(() => {
    // Don't recalculate if any dropdown is open
    if (isDropdownOpen) {
      return;
    }

    if (!containerRef.current || !hiddenItemsRef.current || !navbarItems) {
      return;
    }

    const navbarItemPropsArray = getNavbarItemPropsArray(navbarItems.data);
    const container = containerRef.current;
    const hiddenContainer = hiddenItemsRef.current;
    const containerWidth = container.offsetWidth;

    if (containerWidth === 0) {
      return;
    }

    // Calculate available width, ensuring we always reserve space for the More button
    // to prevent overlap with search and other right-side elements
    const availableWidth = Math.min(
      containerWidth,
      window.innerWidth - RESERVED_RIGHT_SPACE - MORE_BUTTON_WIDTH
    );

    // Clear hidden container and create temporary elements for measurement
    hiddenContainer.innerHTML = '';
    const tempHTMLElements: HTMLElement[] = [];
    const allItems: NavbarItemProps[] = [];

    navbarItemPropsArray.forEach((navbarItemProps) => {
      const { linkTo, onlyActiveOnIndex, navigationItemTitle } =
        navbarItemProps;

      if (linkTo) {
        const titleText = localize(navigationItemTitle);
        const tempElement = createTempElement(titleText, hiddenContainer);
        tempHTMLElements.push(tempElement);
        allItems.push({ linkTo, onlyActiveOnIndex, navigationItemTitle });
      }
    });

    // Always calculate with More button space reserved to prevent overlap
    const { visible: visibleWithMore, overflow: overflowWithMore } =
      calculateItemsWithMoreButton(
        tempHTMLElements,
        allItems,
        availableWidth,
        MORE_BUTTON_WIDTH
      );

    // If no overflow items, we don't need to show the More button
    if (overflowWithMore.length === 0) {
      if (!isEqual(visibleItems, allItems) || overflowItems.length > 0) {
        setVisibleItems(allItems);
        setOverflowItems([]);
      }
    } else {
      // We have overflow items, show the More button
      if (
        !isEqual(visibleItems, visibleWithMore) ||
        !isEqual(overflowItems, overflowWithMore)
      ) {
        setVisibleItems(visibleWithMore);
        setOverflowItems(overflowWithMore);
      }
    }

    // Clean up temporary elements
    tempHTMLElements.forEach((HTMLElement) => HTMLElement.remove());
  }, [
    navbarItems,
    visibleItems,
    overflowItems,
    calculateItemsWithMoreButton,
    localize,
    isDropdownOpen,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateVisibleItems();
    }, 100);

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        calculateVisibleItems();
      }, 250);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
      clearTimeout(resizeTimer);
    };
  }, [calculateVisibleItems]);

  if (isNilOrError(navbarItems)) return null;

  return (
    <Container
      aria-label={formatMessage(messages.ariaLabel)}
      ref={containerRef}
    >
      <NavbarItems>
        {visibleItems.map((navbarItemProps) => {
          const { linkTo, onlyActiveOnIndex, navigationItemTitle } =
            navbarItemProps;

          if (linkTo === '/projects') {
            return (
              <AdminPublicationsNavbarItem
                linkTo={linkTo}
                navigationItemTitle={navigationItemTitle}
                onDropdownStateChange={setIsDropdownOpen}
                key={linkTo}
              />
            );
          }
          if (linkTo) {
            return (
              <DesktopNavbarItem
                linkTo={linkTo}
                onlyActiveOnIndex={onlyActiveOnIndex}
                navigationItemTitle={navigationItemTitle}
                key={linkTo}
              />
            );
          }
          return null;
        })}
        {overflowItems.length > 0 && (
          <MoreNavbarItem overflowItems={overflowItems} />
        )}
      </NavbarItems>

      {/* Hidden container for measuring item widths */}
      <HiddenItemsContainer ref={hiddenItemsRef} />
    </Container>
  );
};

export default DesktopNavItems;
