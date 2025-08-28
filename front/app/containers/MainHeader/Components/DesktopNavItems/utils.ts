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

export const calculateItemDistribution = (
  tempElements: HTMLElement[],
  allItems: NavbarItemProps[],
  availableWidth: number,
  reservedWidth: number = 0
): { visible: NavbarItemProps[]; overflow: NavbarItemProps[] } => {
  const visible: NavbarItemProps[] = [];
  const overflow: NavbarItemProps[] = [];
  let currentWidth = 0;

  tempElements.forEach((tempElement, index) => {
    const itemWidth = tempElement.offsetWidth;
    const wouldFit = currentWidth + itemWidth <= availableWidth - reservedWidth;

    if (wouldFit) {
      visible.push(allItems[index]);
      currentWidth += itemWidth;
    } else {
      overflow.push(allItems[index]);
    }
  });

  return { visible, overflow };
};
