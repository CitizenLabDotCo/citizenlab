import React, { useRef, useEffect, useState, useCallback } from 'react';

import { media, isRtl } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';
import styled from 'styled-components';

import useNavbarItems from 'api/navbar/useNavbarItems';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../../messages';

import AdminPublicationsNavbarItem from './AdminPublicationsNavbarItem';
import DesktopNavbarItem from './DesktopNavbarItem';
import getNavbarItemPropsArray from './getNavbarItemPropsArray';
import MoreNavbarItem from './MoreNavbarItem';

// Reserved space for right-side navigation elements (search, notifications, user menu, etc.)
const RESERVED_RIGHT_SPACE = 500;

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

interface NavbarItemProps {
  linkTo: RouteType;
  onlyActiveOnIndex?: boolean;
  navigationItemTitle: any;
}

const DesktopNavItems = () => {
  const { data: navbarItems } = useNavbarItems();
  const { formatMessage } = useIntl();
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenItemsRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<NavbarItemProps[]>([]);
  const [overflowItems, setOverflowItems] = useState<NavbarItemProps[]>([]);
  const isDropdownOpenRef = useRef(false);

  // Function to measure available space and determine which items fit
  const calculateVisibleItems = useCallback(() => {
    // Don't recalculate if any dropdown is open
    if (isDropdownOpenRef.current) {
      return;
    }

    if (
      !containerRef.current ||
      !hiddenItemsRef.current ||
      isNilOrError(navbarItems)
    ) {
      return;
    }

    const navbarItemPropsArray = getNavbarItemPropsArray(navbarItems.data);

    const container = containerRef.current;
    const hiddenContainer = hiddenItemsRef.current;
    const containerWidth = container.offsetWidth;

    if (containerWidth === 0) {
      return;
    }

    const availableWidth = Math.min(
      containerWidth,
      window.innerWidth - RESERVED_RIGHT_SPACE
    );

    hiddenContainer.innerHTML = '';

    const tempItems: HTMLElement[] = [];
    const allItems: NavbarItemProps[] = [];

    navbarItemPropsArray.forEach((navbarItemProps) => {
      const { linkTo, onlyActiveOnIndex, navigationItemTitle } =
        navbarItemProps;

      if (linkTo === '/projects') {
        const tempItem = document.createElement('div');
        tempItem.style.cssText = `
          display: inline-block;
          padding: 0 30px;
          white-space: nowrap;
          font-size: 14px;
          font-weight: 500;
          visibility: hidden;
        `;
        const titleText =
          typeof navigationItemTitle === 'string'
            ? navigationItemTitle
            : navigationItemTitle.en || 'All projects';
        tempItem.textContent = `${titleText} ▼`;
        hiddenContainer.appendChild(tempItem);
        tempItems.push(tempItem);
        allItems.push({ linkTo, onlyActiveOnIndex, navigationItemTitle });
      } else if (linkTo) {
        const tempItem = document.createElement('div');
        tempItem.style.cssText = `
          display: inline-block;
          padding: 0 30px;
          white-space: nowrap;
          font-size: 14px;
          font-weight: 500;
          visibility: hidden;
        `;
        const titleText =
          typeof navigationItemTitle === 'string'
            ? navigationItemTitle
            : navigationItemTitle.en || 'Item';
        tempItem.textContent = titleText;
        hiddenContainer.appendChild(tempItem);
        tempItems.push(tempItem);
        allItems.push({ linkTo, onlyActiveOnIndex, navigationItemTitle });
      }
    });

    const moreButtonWidth = 60; // Approximate width reserved for the More button

    // Find the "All projects" item index
    const allProjectsIndex = allItems.findIndex(
      (item) => item.linkTo === '/projects'
    );

    // Pass 1: try to fit all items WITHOUT reserving space for the More button
    let currentWidth = 0;
    const visibleNoMore: NavbarItemProps[] = [];
    const overflowNoMore: NavbarItemProps[] = [];

    tempItems.forEach((tempItem, index) => {
      const itemWidth = tempItem.offsetWidth;
      const wouldFit = currentWidth + itemWidth <= availableWidth;

      if (wouldFit) {
        visibleNoMore.push(allItems[index]);
        currentWidth += itemWidth;
      } else {
        overflowNoMore.push(allItems[index]);
      }
    });

    // Helper function to compare arrays
    const arraysEqual = (a: NavbarItemProps[], b: NavbarItemProps[]) => {
      if (a.length !== b.length) return false;
      return a.every(
        (item, index) =>
          item.linkTo === b[index].linkTo &&
          item.onlyActiveOnIndex === b[index].onlyActiveOnIndex
      );
    };

    // If everything fits, don't show More; render all items directly
    if (overflowNoMore.length === 0) {
      if (!arraysEqual(visibleItems, allItems) || overflowItems.length > 0) {
        setVisibleItems(allItems);
        setOverflowItems([]);
      }
    } else {
      // Pass 2: items overflow, so recalc reserving space for the More button
      const visibleWithMore: NavbarItemProps[] = [];
      const overflowWithMore: NavbarItemProps[] = [];
      let widthWithMore = 0;

      tempItems.forEach((tempItem, index) => {
        const itemWidth = tempItem.offsetWidth;
        const wouldFit =
          widthWithMore + itemWidth <= availableWidth - moreButtonWidth;

        if (wouldFit) {
          visibleWithMore.push(allItems[index]);
          widthWithMore += itemWidth;
        } else {
          overflowWithMore.push(allItems[index]);
        }
      });

      // Ensure "All projects" is always in visible items
      if (allProjectsIndex !== -1) {
        const allProjectsInOverflow = overflowWithMore.some(
          (item) => item.linkTo === '/projects'
        );

        if (allProjectsInOverflow) {
          // Recalculate visible items to make room for "All projects"
          const recalculatedVisible: NavbarItemProps[] = [];
          const recalculatedOverflow: NavbarItemProps[] = [];
          let recalculatedWidth = 0;

          tempItems.forEach((tempItem, index) => {
            const itemWidth = tempItem.offsetWidth;
            const isAllProjects = allItems[index].linkTo === '/projects';

            if (isAllProjects) {
              // Always include "All projects" in visible
              recalculatedVisible.push(allItems[index]);
              recalculatedWidth += itemWidth;
            } else {
              const wouldFit =
                recalculatedWidth + itemWidth <=
                availableWidth - moreButtonWidth;
              if (wouldFit) {
                recalculatedVisible.push(allItems[index]);
                recalculatedWidth += itemWidth;
              } else {
                recalculatedOverflow.push(allItems[index]);
              }
            }
          });

          if (
            !arraysEqual(visibleItems, recalculatedVisible) ||
            !arraysEqual(overflowItems, recalculatedOverflow)
          ) {
            setVisibleItems(recalculatedVisible);
            setOverflowItems(recalculatedOverflow);
          }
        } else {
          if (
            !arraysEqual(visibleItems, visibleWithMore) ||
            !arraysEqual(overflowItems, overflowWithMore)
          ) {
            setVisibleItems(visibleWithMore);
            setOverflowItems(overflowWithMore);
          }
        }
      } else {
        if (
          !arraysEqual(visibleItems, visibleWithMore) ||
          !arraysEqual(overflowItems, overflowWithMore)
        ) {
          setVisibleItems(visibleWithMore);
          setOverflowItems(overflowWithMore);
        }
      }
    }

    tempItems.forEach((item) => item.remove());
  }, [navbarItems, visibleItems, overflowItems]);

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateVisibleItems();
    }, 100);

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        calculateVisibleItems();
      }, 250); // Increased debounce time
    };

    // Listen for dropdown state changes
    document.addEventListener('click', (e) => {
      const target = e.target as Element;
      if (target.closest('[data-testid="admin-publications-navbar-item"]')) {
        const button = target.closest(
          '[data-testid="admin-publications-navbar-item"]'
        );
        const isExpanded = button?.getAttribute('aria-expanded') === 'true';
        isDropdownOpenRef.current = isExpanded;
      }
    });

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
        {visibleItems.map((navbarItemProps, i) => {
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
