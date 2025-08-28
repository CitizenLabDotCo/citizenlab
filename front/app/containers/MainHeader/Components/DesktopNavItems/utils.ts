import { isEqual } from 'lodash-es';
import { RouteType } from 'routes';
import { Multiloc } from 'typings';

export const TEMP_DROPDOWN_ITEM_STYLES = `
  display: inline-block;
  padding: 0 30px;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 500;
  visibility: hidden;
`;

export interface NavbarItemProps {
  linkTo: RouteType;
  onlyActiveOnIndex?: boolean;
  navigationItemTitle: Multiloc;
}

const createTempElement = (
  text: string,
  container: HTMLElement
): HTMLElement => {
  const element = document.createElement('div');
  element.style.cssText = TEMP_DROPDOWN_ITEM_STYLES;
  element.textContent = text;
  container.appendChild(element);
  return element;
};

type ItemDistribution = {
  visible: NavbarItemProps[];
  overflow: NavbarItemProps[];
};

export const calculateItemDistribution = (
  tempElements: HTMLElement[],
  allItems: NavbarItemProps[],
  availableWidth: number,
  reservedWidth: number = 0
): ItemDistribution => {
  const maxAllowedWidth = availableWidth - reservedWidth;
  let cumulativeWidth = 0;

  // Find the index of the first item that makes the total width exceed the limit.
  const breakIndex = allItems.findIndex((_item, index) => {
    // We use the tempElements array to get the real-time width
    const itemWidth = tempElements[index].offsetWidth;
    cumulativeWidth += itemWidth;
    return cumulativeWidth > maxAllowedWidth;
  });

  // If findIndex never found an item that overflowed, it returns -1.
  // This means all items are visible.
  if (breakIndex === -1) {
    return { visible: allItems, overflow: [] };
  }

  // If a breakIndex was found, split the original array at that point.
  return {
    visible: allItems.slice(0, breakIndex),
    overflow: allItems.slice(breakIndex),
  };
};

export const validateCalculationPrerequisites = (
  containerRef: React.RefObject<HTMLDivElement>,
  hiddenItemsRef: React.RefObject<HTMLDivElement>,
  navbarItems: any,
  isDropdownOpen: boolean
): boolean => {
  if (isDropdownOpen) {
    return false;
  }

  if (!containerRef.current || !hiddenItemsRef.current || !navbarItems) {
    return false;
  }

  const containerWidth = containerRef.current.offsetWidth;
  if (containerWidth === 0) {
    return false;
  }

  return true;
};

export const calculateAvailableWidth = (
  containerWidth: number,
  reservedRightSpace: number,
  moreButtonWidth: number
): number => {
  return Math.min(
    containerWidth,
    window.innerWidth - reservedRightSpace - moreButtonWidth
  );
};

export const createTempElementsForMeasurement = (
  navbarItemPropsArray: Array<{
    linkTo: RouteType | null;
    onlyActiveOnIndex: boolean;
    navigationItemTitle: Multiloc;
  }>,
  hiddenContainer: HTMLElement,
  localize: (multiloc: Multiloc) => string
): { tempElements: HTMLElement[]; allItems: NavbarItemProps[] } => {
  hiddenContainer.innerHTML = '';
  const tempHTMLElements: HTMLElement[] = [];
  const allItems: NavbarItemProps[] = [];

  navbarItemPropsArray.forEach((navbarItemProps) => {
    const { linkTo, onlyActiveOnIndex, navigationItemTitle } = navbarItemProps;

    if (linkTo) {
      const titleText = localize(navigationItemTitle);
      const tempElement = createTempElement(titleText, hiddenContainer);
      tempHTMLElements.push(tempElement);
      allItems.push({ linkTo, onlyActiveOnIndex, navigationItemTitle });
    }
  });

  return { tempElements: tempHTMLElements, allItems };
};

export const updateVisibleAndOverflowItems = (
  visibleWithMore: NavbarItemProps[],
  overflowWithMore: NavbarItemProps[],
  allItems: NavbarItemProps[],
  currentVisibleItems: NavbarItemProps[],
  currentOverflowItems: NavbarItemProps[],
  setVisibleItems: (items: NavbarItemProps[]) => void,
  setOverflowItems: (items: NavbarItemProps[]) => void
): void => {
  // If no overflow items, we don't need to show the More button
  if (overflowWithMore.length === 0) {
    if (
      !isEqual(currentVisibleItems, allItems) ||
      currentOverflowItems.length > 0
    ) {
      setVisibleItems(allItems);
      setOverflowItems([]);
    }
  } else {
    // We have overflow items, show the More button
    if (
      !isEqual(currentVisibleItems, visibleWithMore) ||
      !isEqual(currentOverflowItems, overflowWithMore)
    ) {
      setVisibleItems(visibleWithMore);
      setOverflowItems(overflowWithMore);
    }
  }
};
