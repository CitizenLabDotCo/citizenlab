import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import { Level } from '../level';
import FlyoutMenu, { MenuEntry } from '../Menu/FlyoutMenu';
import useMenuButton from '../Menu/useMenuButton';
import messages from '../messages';
import ToolbarButton from '../ToolbarButton';

import DateFlyout from './DateFlyout';
import { FACETS, isListFacet } from './facets';
import OptionsFlyout from './OptionsFlyout';
import useFilters from './useFilters';

interface Props {
  level: Level;
}

// The filters, one row each, with their choices beside the menu, and a way to
// clear them all.
const FilterMenu = ({ level }: Props) => {
  const { formatMessage } = useIntl();
  const { opened, toggle, close, button, menu } = useMenuButton();
  const { facets, activeFacets, clearFilters } = useFilters(level);
  const label = formatMessage(messages.filter);

  const entries: MenuEntry[] = facets.map((key) => ({
    key,
    icon: FACETS[key].icon,
    label: formatMessage(FACETS[key].label),
    flyout: (takeFocus: boolean) =>
      isListFacet(key) ? (
        <OptionsFlyout facetKey={key} level={level} takeFocus={takeFocus} />
      ) : (
        <DateFlyout level={level} takeFocus={takeFocus} />
      ),
  }));

  if (activeFacets.length > 0) {
    entries.push({
      key: 'clear',
      icon: 'close',
      label: formatMessage(messages.clearAllFilters),
      onSelect: clearFilters,
      danger: true,
      dividerBefore: true,
    });
  }

  return (
    <Box ref={menu} position="relative">
      <ToolbarButton
        ref={button}
        dataCy="projects-hierarchy-filter-button"
        icon="filter"
        label={label}
        isActive={activeFacets.length > 0}
        menuOpened={opened}
        onClick={toggle}
      />
      <FlyoutMenu
        label={label}
        opened={opened}
        onClose={close}
        entries={entries}
        top="36px"
      />
    </Box>
  );
};

export default FilterMenu;
