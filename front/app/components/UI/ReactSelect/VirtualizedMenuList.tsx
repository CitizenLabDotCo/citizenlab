import React, {
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { useVirtualizer } from '@tanstack/react-virtual';
import { components, GroupBase, MenuListProps } from 'react-select';

const VIRTUALIZE_OPTION_COUNT = 100;
const ESTIMATED_OPTION_HEIGHT = 36;

type OptionElementProps = {
  isFocused?: boolean;
  innerRef?: React.Ref<HTMLDivElement>;
  innerProps?: React.HTMLAttributes<HTMLDivElement> & {
    [key: `data-${string}`]: unknown;
  };
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

  const items = useMemo(
    () => React.Children.toArray(props.children),
    [props.children]
  );

  const { measureElement, getTotalSize, getVirtualItems, scrollToIndex } =
    useVirtualizer({
      count: items.length,
      // The menu list react-select renders around this content is the element
      // that scrolls.
      getScrollElement: () => contentRef.current?.parentElement ?? null,
      estimateSize: () => ESTIMATED_OPTION_HEIGHT,
      overscan: 5,
    });

  const focusedIndex = items.findIndex(
    (item) => isValidElement<OptionElementProps>(item) && item.props.isFocused
  );

  // `aria-activedescendant` names the focused option, so that option has to
  // stay in the DOM however far down the list the user arrows.
  useEffect(() => {
    if (focusedIndex >= 0) {
      scrollToIndex(focusedIndex);
    }
  }, [focusedIndex, scrollToIndex]);

  if (items.length < VIRTUALIZE_OPTION_COUNT) {
    return <components.MenuList {...props} />;
  }

  return (
    <components.MenuList {...props}>
      <div
        ref={contentRef}
        // The options have to read as the listbox's own children as far as
        // assistive tech is concerned, so this sizing element is hidden from
        // the accessibility tree.
        role="presentation"
        style={{ position: 'relative', height: `${getTotalSize()}px` }}
      >
        {getVirtualItems().map((virtualItem) => {
          const item = items[virtualItem.index];

          if (!isValidElement<OptionElementProps>(item)) return item;

          const optionRef = item.props.innerRef;

          return cloneElement(item, {
            innerRef: (element: HTMLDivElement | null) => {
              measureElement(element);
              if (typeof optionRef === 'function') optionRef(element);
            },
            innerProps: {
              ...item.props.innerProps,
              'data-index': virtualItem.index,
              'aria-setsize': items.length,
              'aria-posinset': virtualItem.index + 1,
              style: {
                ...item.props.innerProps?.style,
                // The offset sits on the option itself rather than on a wrapper
                // around it: react-select scrolls the focused option into view
                // using `offsetTop`, which a positioned wrapper would flatten
                // to zero for every row.
                position: 'absolute',
                top: virtualItem.start,
                left: 0,
                width: '100%',
              },
            },
          });
        })}
      </div>
    </components.MenuList>
  );
};

export default VirtualizedMenuList;
