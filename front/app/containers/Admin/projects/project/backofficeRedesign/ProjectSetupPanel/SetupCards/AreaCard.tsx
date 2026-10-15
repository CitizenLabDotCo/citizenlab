import React, { useCallback, useRef, useState } from 'react';

import {
  Box,
  Checkbox,
  Icon,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import useAreas from 'api/areas/useAreas';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import generalMessages from 'containers/Admin/projects/project/general/messages';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import SetupCard from '../SetupCard';
import { getDraftValues, useSetupDraft } from '../SetupDraftContext';

import MenuPopover, { focusAnchor } from './MenuPopover';
import MenuRow from './MenuRow';

const FLYOUT_MAX_HEIGHT = '240px';

type AreaType = 'none' | 'all' | 'selection';

const AREA_TYPES: {
  value: AreaType;
  label: MessageDescriptor;
  description: MessageDescriptor;
}[] = [
  {
    value: 'none',
    label: generalMessages.areasNoneLabel,
    description: generalMessages.areasNoneLabelDescription,
  },
  {
    value: 'all',
    label: messages.areaFilterAllAreas,
    description: generalMessages.areasAllLabelDescription,
  },
  {
    value: 'selection',
    label: messages.areaFilterSelectedAreas,
    description: generalMessages.areasSelectionLabelDescription,
  },
];

const getAreaType = (areaIds: string[], includeAllAreas: boolean): AreaType => {
  if (areaIds.length > 0) return 'selection';
  return includeAllAreas ? 'all' : 'none';
};

interface Props {
  project: IProjectData;
  ready?: boolean;
}

const AreaCard = ({ project, ready }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const theme = useTheme();
  const { data: areas } = useAreas({});
  const { changes, changeProject } = useSetupDraft();
  const cardRef = useRef<HTMLDivElement>(null);
  const selectionRowRef = useRef<HTMLButtonElement>(null);
  const [menuOpened, setMenuOpened] = useState(false);
  const [flyoutOpened, setFlyoutOpened] = useState(false);
  const [flyoutFocused, setFlyoutFocused] = useState(false);

  const { areaIds, includeAllAreas } = getDraftValues(project, changes);
  const areaType = getAreaType(areaIds, includeAllAreas);

  const closeMenu = useCallback(() => {
    setMenuOpened(false);
    setFlyoutOpened(false);
  }, []);

  const getSummary = () => {
    if (areaType === 'all') return formatMessage(messages.areaFilterAllAreas);
    if (areaIds.length === 1) {
      const area = areas?.data.find((area) => area.id === areaIds[0]);
      return area ? localize(area.attributes.title_multiloc) : undefined;
    }
    if (areaIds.length > 1) {
      return formatMessage(messages.areasCount, { count: areaIds.length });
    }
    return undefined;
  };

  const openFlyout = (focused: boolean) => {
    setFlyoutOpened(true);
    setFlyoutFocused(focused);
  };

  const closeFlyout = () => {
    setFlyoutOpened(false);
    selectionRowRef.current?.focus();
  };

  const pickAreaType = (value: AreaType) => {
    if (value === 'selection') {
      openFlyout(true);
      return;
    }
    changeProject({ area_ids: [], include_all_areas: value === 'all' });
    closeMenu();
    focusAnchor(cardRef.current);
  };

  const toggleArea = (areaId: string) => {
    const newAreaIds = areaIds.includes(areaId)
      ? areaIds.filter((id) => id !== areaId)
      : [...areaIds, areaId];

    changeProject({ area_ids: newAreaIds, include_all_areas: false });
  };

  return (
    <Box ref={cardRef}>
      <SetupCard
        id="e2e-setup-card-area"
        title={formatMessage(messages.areaItem)}
        ready={ready}
        summary={getSummary()}
        behaviour={{
          kind: 'action',
          icon: menuOpened ? 'chevron-up' : 'chevron-down',
          expanded: menuOpened,
          onClick: () => (menuOpened ? closeMenu() : setMenuOpened(true)),
        }}
      />

      {menuOpened && (
        <MenuPopover
          anchorRef={cardRef}
          placement="below"
          onClose={closeMenu}
          autoFocus
        >
          {AREA_TYPES.map(({ value, label, description }) => {
            const isSelection = value === 'selection';
            const isCurrent = areaType === value;

            return (
              <MenuRow
                key={value}
                ref={isSelection ? selectionRowRef : undefined}
                type="button"
                role="menuitemradio"
                aria-checked={isCurrent}
                aria-haspopup={isSelection ? 'menu' : undefined}
                aria-expanded={isSelection ? flyoutOpened : undefined}
                data-active={isSelection && flyoutOpened}
                onMouseEnter={() =>
                  isSelection ? openFlyout(false) : setFlyoutOpened(false)
                }
                onKeyDown={(event) => {
                  if (isSelection && event.key === 'ArrowRight') {
                    event.preventDefault();
                    openFlyout(true);
                  }
                }}
                onClick={() => pickAreaType(value)}
              >
                <Icon
                  name="position"
                  width="16px"
                  height="16px"
                  fill={colors.coolGrey600}
                  mt="2px"
                />
                <Box flex="1 1 auto" minWidth="0">
                  <Text as="span" display="block" m="0" fontSize="s">
                    {formatMessage(label)}
                  </Text>
                  <Text
                    as="span"
                    display="block"
                    m="0"
                    fontSize="xs"
                    color="coolGrey600"
                  >
                    {isSelection && isCurrent
                      ? formatMessage(messages.areasSelectedCount, {
                          count: areaIds.length,
                        })
                      : formatMessage(description)}
                  </Text>
                </Box>
                {isCurrent && (
                  <Icon
                    name="check"
                    width="16px"
                    height="16px"
                    fill={theme.colors.tenantPrimary}
                    mt="2px"
                  />
                )}
                {isSelection && (
                  <Icon
                    name="chevron-right"
                    width="16px"
                    height="16px"
                    fill={colors.coolGrey500}
                    mt="2px"
                  />
                )}
              </MenuRow>
            );
          })}
        </MenuPopover>
      )}

      {menuOpened && flyoutOpened && (
        <MenuPopover
          anchorRef={selectionRowRef}
          placement="right"
          width="200px"
          maxHeight={FLYOUT_MAX_HEIGHT}
          onBack={closeFlyout}
          autoFocus={flyoutFocused}
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
                onClick={() => toggleArea(area.id)}
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
                    onChange={() => toggleArea(area.id)}
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
      )}
    </Box>
  );
};

export default AreaCard;
