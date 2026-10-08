import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  Box,
  CheckboxWithLabel,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import useAreas from 'api/areas/useAreas';
import { IProjectData } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import useLocalize from 'hooks/useLocalize';

import generalMessages from 'containers/Admin/projects/project/general/messages';

import OptionPicker from 'components/UI/OptionPicker';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import PanelHeading from '../PanelHeading';

type AreaType = 'none' | 'all' | 'selection';

const getAreaType = (
  project: IProjectData,
  selectingAreas: boolean
): AreaType => {
  if (selectingAreas || project.relationships.areas.data.length > 0) {
    return 'selection';
  }
  return project.attributes.include_all_areas ? 'all' : 'none';
};

interface Props {
  project: IProjectData;
}

const AreaFilterDropdown = ({ project }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: areas } = useAreas({});
  const { mutate: updateProject } = useUpdateProject();
  const [selectingAreas, setSelectingAreas] = useState(false);
  const [pickedAreaIds, setPickedAreaIds] = useState<string[]>();
  const unsavedAreaIds = useRef<string[] | null>(null);
  const justPickedSelection = useRef(false);

  const saveAreas = useCallback(() => {
    const areaIdsToSave = unsavedAreaIds.current;
    if (!areaIdsToSave) return;

    unsavedAreaIds.current = null;
    updateProject(
      { projectId: project.id, area_ids: areaIdsToSave },
      { onError: () => setPickedAreaIds(undefined) }
    );
  }, [project.id, updateProject]);

  useEffect(() => saveAreas, [saveAreas]);

  // scrollIntoView on the area list when the user picks "Selected areas"
  const revealAreaList = (element: HTMLDivElement | null) => {
    if (!element || !justPickedSelection.current) return;
    justPickedSelection.current = false;
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    element.querySelector('input')?.focus({ preventScroll: true });
  };

  if (!areas) return null;

  const areaType = getAreaType(project, selectingAreas);
  const areaIds =
    pickedAreaIds ?? project.relationships.areas.data.map((area) => area.id);

  const selectedAreaTitles = areas.data
    .filter((area) => areaIds.includes(area.id))
    .map((area) => localize(area.attributes.title_multiloc));

  const handleAreaTypeChange = (value: AreaType) => {
    setSelectingAreas(value === 'selection');
    justPickedSelection.current = value === 'selection';
    unsavedAreaIds.current = null;
    setPickedAreaIds([]);
    updateProject({
      projectId: project.id,
      area_ids: [],
      include_all_areas: value === 'all',
    });
  };

  const toggleArea = (areaId: string) => {
    const newAreaIds = areaIds.includes(areaId)
      ? areaIds.filter((id) => id !== areaId)
      : [...areaIds, areaId];

    setSelectingAreas(true);
    setPickedAreaIds(newAreaIds);
    unsavedAreaIds.current = newAreaIds;
  };

  return (
    <>
      <PanelHeading title={formatMessage(generalMessages.areasLabelHint)} />
      <OptionPicker<AreaType>
        title={formatMessage(generalMessages.areasLabelHint)}
        description={formatMessage(messages.areaFilterDescription)}
        options={[
          {
            value: 'none',
            icon: 'position',
            label: formatMessage(generalMessages.areasNoneLabel),
            description: formatMessage(
              generalMessages.areasNoneLabelDescription
            ),
          },
          {
            value: 'all',
            icon: 'position',
            label: formatMessage(messages.areaFilterAllAreas),
            description: formatMessage(
              generalMessages.areasAllLabelDescription
            ),
          },
          {
            value: 'selection',
            icon: 'position',
            label: formatMessage(messages.areaFilterSelectedAreas),
            description: formatMessage(
              generalMessages.areasSelectionLabelDescription
            ),
          },
        ]}
        value={areaType}
        triggerLabel={
          selectedAreaTitles.length > 0
            ? selectedAreaTitles.join(', ')
            : undefined
        }
        keepOpenFor="selection"
        onChange={handleAreaTypeChange}
        onClose={saveAreas}
      >
        {areaType === 'selection' && (
          <Box
            ref={revealAreaList}
            mt="8px"
            p="12px"
            bgColor={colors.grey100}
            borderRadius={stylingConsts.borderRadius}
            display="flex"
            flexDirection="column"
            gap="12px"
          >
            <Text variant="boHelper" m="0px">
              {formatMessage(messages.areaFilterChooseAreas)}
            </Text>
            {areas.data.map((area) => (
              <CheckboxWithLabel
                key={area.id}
                size="20px"
                checked={areaIds.includes(area.id)}
                onChange={() => toggleArea(area.id)}
                label={localize(area.attributes.title_multiloc)}
              />
            ))}
          </Box>
        )}
      </OptionPicker>
    </>
  );
};

export default AreaFilterDropdown;
