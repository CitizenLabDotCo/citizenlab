import React, { RefObject } from 'react';

import { Box, Checkbox, Text } from '@citizenlab/cl2-component-library';

import useAreas from 'api/areas/useAreas';

import useLocalize from 'hooks/useLocalize';

import MenuPopover from './MenuPopover';
import MenuRow from './MenuRow';

const FLYOUT_MAX_HEIGHT = '240px';

interface Props {
  anchorRef: RefObject<HTMLElement>;
  areaIds: string[];
  autoFocus: boolean;
  onToggle: (areaId: string) => void;
  onBack: () => void;
}

const AreaFlyout = ({
  anchorRef,
  areaIds,
  autoFocus,
  onToggle,
  onBack,
}: Props) => {
  const localize = useLocalize();
  const { data: areas } = useAreas({});

  return (
    <MenuPopover
      anchorRef={anchorRef}
      placement="right"
      width="200px"
      maxHeight={FLYOUT_MAX_HEIGHT}
      onBack={onBack}
      autoFocus={autoFocus}
    >
      {(areas?.data ?? []).map((area) => {
        const checked = areaIds.includes(area.id);

        return (
          <MenuRow
            key={area.id}
            type="button"
            role="menuitemcheckbox"
            aria-checked={checked}
            data-compact
            data-hide-unchecked
            onClick={() => onToggle(area.id)}
          >
            <Box
              display="flex"
              data-unchecked={!checked}
              onClick={(event) => event.stopPropagation()}
            >
              <Checkbox
                size="16px"
                checked={checked}
                checkedColor="tenantPrimary"
                onChange={() => onToggle(area.id)}
                tabIndex={-1}
              />
            </Box>
            <Text as="span" m="0" fontSize="s">
              {localize(area.attributes.title_multiloc)}
            </Text>
          </MenuRow>
        );
      })}
    </MenuPopover>
  );
};

export default AreaFlyout;
