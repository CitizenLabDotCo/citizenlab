import React, { useCallback, useRef, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAreas from 'api/areas/useAreas';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import generalMessages from 'containers/Admin/projects/project/general/messages';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import SetupCard from '../SetupCard';
import { getDraftValues, useSetupDraft } from '../SetupDraftContext';

import AreaFlyout from './AreaFlyout';
import AreaTypeRow from './AreaTypeRow';
import MenuPopover, { focusAnchor } from './MenuPopover';

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
    if (value !== areaType) {
      changeProject({ area_ids: [], include_all_areas: value === 'all' });
    }
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
              <AreaTypeRow
                key={value}
                ref={isSelection ? selectionRowRef : undefined}
                label={formatMessage(label)}
                description={
                  isSelection && isCurrent
                    ? formatMessage(messages.areasSelectedCount, {
                        count: areaIds.length,
                      })
                    : formatMessage(description)
                }
                current={isCurrent}
                flyout={
                  isSelection
                    ? { opened: flyoutOpened, onOpen: () => openFlyout(true) }
                    : undefined
                }
                onHover={() =>
                  isSelection ? openFlyout(false) : setFlyoutOpened(false)
                }
                onClick={() => pickAreaType(value)}
              />
            );
          })}
        </MenuPopover>
      )}

      {menuOpened && flyoutOpened && (
        <AreaFlyout
          anchorRef={selectionRowRef}
          areaIds={areaIds}
          autoFocus={flyoutFocused}
          onToggle={toggleArea}
          onBack={closeFlyout}
        />
      )}
    </Box>
  );
};

export default AreaCard;
