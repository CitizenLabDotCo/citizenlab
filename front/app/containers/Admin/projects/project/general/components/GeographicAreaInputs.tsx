import React, { useState } from 'react';
import { isNilOrError, isString } from 'utils/helperUtils';
import { IconTooltip, Radio } from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';
import { SubSectionTitle } from 'components/admin/Section';
import { StyledSectionField, StyledMultipleSelect } from './styling';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { IOption, isOption } from 'typings';
import useAreas from 'hooks/useAreas';
import useProject from 'hooks/useProject';
import useLocalize from 'hooks/useLocalize';
import { IAreaData } from 'services/areas';
import { useParams } from 'react-router-dom';
import { TOnProjectAttributesDiffChangeFunction } from '..';

interface Props {
  areaIds: string[] | undefined;
  onProjectAttributesDiffChange: TOnProjectAttributesDiffChangeFunction;
}

type TProjectAreaType = 'all' | 'selection';

const GeographicAreaInputs = ({
  areaIds,
  onProjectAttributesDiffChange,
}: Props) => {
  const { projectId } = useParams();
  const areas = useAreas();
  const project = useProject({ projectId });
  const localize = useLocalize();
  const [areaType, setAreaType] = useState<TProjectAreaType>('all');

  const handleAreaSelectionChange = (values: IOption[]) => {
    const selectedAreaIds = values.map((value) => value.value).filter(isString);
    onProjectAttributesDiffChange({ area_ids: selectedAreaIds });
  };

  const onAreaTypeChange = (areaType: TProjectAreaType) => {
    setAreaType(areaType);
    onProjectAttributesDiffChange({
      area_ids: areaType === 'all' ? [] : areaIds,
    });
  };

  const mapProjectAreaIdsToAreaOptions = (
    projectAreaIds: string[],
    areas: IAreaData[]
  ) => {
    projectAreaIds
      .map((projectAreaId) => {
        const projectArea = getProjectArea(areas, projectAreaId);

        return projectArea
          ? {
              value: projectAreaId,
              label: localize(projectArea.attributes.title_multiloc),
            }
          : null;
      })
      .filter(isOption);
  };

  if (!isNilOrError(areas)) {
    const areaOptions: IOption[] = areas.map((area) => ({
      value: area.id,
      label: localize(area.attributes.title_multiloc),
    }));
    const projectAreaIds = [
      ...(areaIds ||
        (!isNilOrError(project)
          ? project.relationships.areas.data.map((area) => area.id)
          : [])),
    ];
    const selectedAreaValues = mapProjectAreaIdsToAreaOptions(projectAreaIds, areas);

    return (
      <StyledSectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.areasLabel} />
          <IconTooltip
            content={
              <FormattedMessage
                {...messages.areasLabelTooltip}
                values={{
                  areasLabelTooltipLink: (
                    <Link to="/admin/settings/areas">
                      <FormattedMessage
                        {...messages.areasLabelTooltipLinkText}
                      />
                    </Link>
                  ),
                }}
              />
            }
          />
        </SubSectionTitle>
        <Radio
          onChange={onAreaTypeChange}
          currentValue={areaType}
          value="all"
          name="areas"
          id="areas-all"
          label={<FormattedMessage {...messages.areasAllLabel} />}
        />
        <Radio
          onChange={onAreaTypeChange}
          currentValue={areaType}
          value="selection"
          name="areas"
          id="areas-selection"
          className="e2e-areas-selection"
          label={<FormattedMessage {...messages.areasSelectionLabel} />}
        />

        {areaType === 'selection' && (
          <StyledMultipleSelect
            id="e2e-area-selector"
            options={areaOptions}
            value={selectedAreaValues}
            onChange={handleAreaSelectionChange}
            placeholder=""
            disabled={areaType !== 'selection'}
          />
        )}
      </StyledSectionField>
    );
  }

  return null;
};

export default GeographicAreaInputs;

function getProjectArea(areas: IAreaData[], projectAreaId: string) {
  const projectArea = areas.find((area) => area.id === projectAreaId);
  return projectArea;
}
