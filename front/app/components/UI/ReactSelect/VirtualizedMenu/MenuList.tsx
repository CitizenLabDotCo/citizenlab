import React, { isValidElement, useEffect, useMemo, useRef } from 'react';

import { useVirtualizer } from '@tanstack/react-virtual';
import { components, GroupBase, MenuListProps } from 'react-select';

import { OptionPlacement, VirtualizedMenuContext } from './context';

const VIRTUALIZE_OPTION_COUNT = 100;
const ESTIMATED_OPTION_HEIGHT = 36;

type OptionElementProps = {
  data?: unknown;
  isFocused?: boolean;
};

/**
 * react-select scrolls the focused option into view when the menu opens, but a
 * menu in a portal (`menuPosition="fixed"`) renders nothing on the commit where
 * it checks, and it never tries again. Does nothing if the option is already in
 * view, so it only ever fires on open.
 */
const scrollOptionIntoView = (list: HTMLDivElement | null, index: number) => {
  const option = list?.querySelectorAll<HTMLElement>('[role="option"]')[index];
  if (!list || !option) return;

  const below =
    option.offsetTop +
    option.offsetHeight -
    (list.scrollTop + list.clientHeight);
  const above = list.scrollTop - option.offsetTop;

  if (below > 0) list.scrollTop += below;
  else if (above > 0) list.scrollTop -= above;
};

/**
 * react-select renders every filtered option into the menu, which is enough to
 * make a question with a thousand options janky to open. This keeps only the
 * visible rows in the DOM.
 */
const VirtualizedMenuList = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
>(
  props: MenuListProps<Option, IsMulti, Group>
) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const menuListRef = useRef<HTMLDivElement | null>(null);

  const items = useMemo(
    () => React.Children.toArray(props.children),
    [props.children]
  );

  const isVirtualized = items.length >= VIRTUALIZE_OPTION_COUNT;

  const virtualizer = useVirtualizer({
    count: isVirtualized ? items.length : 0,
    // The menu list react-select renders around this content is the element
    // that scrolls.
    getScrollElement: () => contentRef.current?.parentElement ?? null,
    estimateSize: () => ESTIMATED_OPTION_HEIGHT,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const focusedIndex = items.findIndex(
    (item) => isValidElement<OptionElementProps>(item) && item.props.isFocused
  );
  const focusedIsRendered = virtualItems.some(
    (virtualItem) => virtualItem.index === focusedIndex
  );

  // Starts outside the list so opening the menu on a selected option counts as
  // a change and scrolls to it.
  const scrolledToIndex = useRef(-1);

  // Only a change of focus counts: hovering focuses an option that is on screen
  // by definition, and scrolling the focused option out of view is the user's
  // own doing, so neither moves the list.
  useEffect(() => {
    if (focusedIndex < 0 || focusedIndex === scrolledToIndex.current) return;
    scrolledToIndex.current = focusedIndex;

    if (!isVirtualized) {
      scrollOptionIntoView(menuListRef.current, focusedIndex);
      return;
    }
    // react-select can only scroll to an option that is in the DOM, so moving
    // the focus past the rendered window is the one case it cannot handle.
    if (!focusedIsRendered) virtualizer.scrollToIndex(focusedIndex);
  }, [isVirtualized, focusedIndex, focusedIsRendered, virtualizer]);

  const setMenuListRef = (element: HTMLDivElement | null) => {
    menuListRef.current = element;
    // react-select tracks the menu list through a callback ref of its own.
    if (typeof props.innerRef === 'function') props.innerRef(element);
  };

  if (!isVirtualized) {
    return <components.MenuList {...props} innerRef={setMenuListRef} />;
  }

  const placements = new Map<unknown, OptionPlacement>();
  virtualItems.forEach(({ index, start }) => {
    const item = items[index];
    if (isValidElement<OptionElementProps>(item)) {
      placements.set(item.props.data, { index, start, setSize: items.length });
    }
  });

  return (
    <components.MenuList {...props} innerRef={setMenuListRef}>
      <VirtualizedMenuContext.Provider
        value={{
          placementOf: (data) => placements.get(data),
          measureElement: virtualizer.measureElement,
        }}
      >
        <div
          ref={contentRef}
          // The options have to read as the listbox's own children as far as
          // assistive tech is concerned, so this sizing element is hidden from
          // the accessibility tree.
          role="presentation"
          style={{
            position: 'relative',
            height: `${virtualizer.getTotalSize()}px`,
          }}
        >
          {virtualItems.map((virtualItem) => items[virtualItem.index])}
        </div>
      </VirtualizedMenuContext.Provider>
    </components.MenuList>
  );
};

export default VirtualizedMenuList;
