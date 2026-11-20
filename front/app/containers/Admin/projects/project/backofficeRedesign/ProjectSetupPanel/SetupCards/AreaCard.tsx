import React from 'react';

import Menu, {
  MenuItem,
  MenuTrigger,
  SubmenuTrigger,
} from 'design-system/Menu';
import { Key } from 'design-system/types';

import useAreas from 'api/areas/useAreas';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import generalMessages from 'containers/Admin/projects/project/general/messages';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import SetupCard from '../SetupCard';
import { getDraftValues, useSetupDraft } from '../SetupDraftContext';

import AreaFlyout from './AreaFlyout';
import messages from './messages';

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

  const { areaIds, includeAllAreas } = getDraftValues(project, changes);
  const areaType = getAreaType(areaIds, includeAllAreas);

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

  // Selected areas opens the area submenu instead.
  const pickAreaType = (value: Key) => {
    if (value !== 'none' && value !== 'all') return;
    if (value !== areaType) {
      changeProject({ area_ids: [], include_all_areas: value === 'all' });
    }
  };

  const changeAreas = (newAreaIds: string[]) => {
    changeProject({ area_ids: newAreaIds, include_all_areas: false });
  };

  const title = formatMessage(messages.areaTitle);

  return (
    <MenuTrigger>
      <SetupCard
        id="e2e-setup-card-area"
        tooltip={formatMessage(messages.areaTooltip)}
        title={title}
        ready={ready}
        summary={getSummary()}
        behaviour={{ kind: 'trigger' }}
      />
      <Menu
        aria-label={title}
        selectionMode="single"
        selectedKeys={new Set([areaType])}
        onAction={pickAreaType}
      >
        {AREA_TYPES.map(({ value, label, description }) => {
          const item = (
            <MenuItem
              key={value}
              id={value}
              icon="map-pin-14"
              description={
                value === 'selection' && areaType === 'selection'
                  ? formatMessage(messages.areasSelectedCount, {
                      count: areaIds.length,
                    })
                  : formatMessage(description)
              }
            >
              {formatMessage(label)}
            </MenuItem>
          );

          return value === 'selection' ? (
            <SubmenuTrigger key={value}>
              {item}
              <AreaFlyout
                aria-label={formatMessage(label)}
                areaIds={areaIds}
                onChange={changeAreas}
              />
            </SubmenuTrigger>
          ) : (
            item
          );
        })}
      </Menu>
    </MenuTrigger>
  );
};

export default AreaCard;
