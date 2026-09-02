import React from 'react';

import { components, GroupBase, OptionProps } from 'react-select';

import { useOptionPlacement } from './context';

/**
 * Only a window of a long menu is in the DOM, so each rendered option has to
 * carry its own position: for the virtualizer to measure it, and for a screen
 * reader to announce where it sits in the full list.
 */
const VirtualizedOption = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
>(
  props: OptionProps<Option, IsMulti, Group>
) => {
  const placement = useOptionPlacement(props.data);

  if (!placement) {
    return <components.Option {...props} />;
  }

  const innerProps: React.HTMLAttributes<HTMLDivElement> &
    Record<`data-${string}`, unknown> = {
    ...props.innerProps,
    'data-index': placement.index,
    'aria-setsize': placement.setSize,
    'aria-posinset': placement.index + 1,
    style: {
      ...props.innerProps.style,
      // The offset sits on the option itself rather than on a wrapper around
      // it: react-select scrolls the focused option into view using
      // `offsetTop`, which a positioned wrapper would flatten to zero for
      // every row.
      position: 'absolute',
      top: placement.start,
      left: 0,
      width: '100%',
    },
  };

  return (
    <components.Option
      {...props}
      innerProps={innerProps}
      innerRef={(element) => {
        placement.measureElement(element);
        // react-select hands an `innerRef` to the focused option only, even
        // though its type says every option gets one.
        if (typeof props.innerRef === 'function') props.innerRef(element);
      }}
    />
  );
};

export default VirtualizedOption;
