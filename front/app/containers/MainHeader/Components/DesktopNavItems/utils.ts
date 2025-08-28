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

export const createTempElement = (
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
