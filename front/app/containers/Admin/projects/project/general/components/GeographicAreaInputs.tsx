import React from 'react';
import { TOnProjectAttributesDiffChangeFunction } from 'utils/moduleUtils';
import { isNilOrError } from 'utils/helperUtils';
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
import { isString } from 'utils/helperUtils';
import { IAreaData } from 'services/areas';

interface Props {
  areaType: 'all' | 'selection';
  handleAreaTypeChange: (value: 'all' | 'selection') => void;
  areaIds: string[] | undefined;
  onProjectAttributesDiffChange: TOnProjectAttributesDiffChangeFunction;
  projectId: string | undefined;
}

const GeographicAreaInputs = ({
  areaType,
  handleAreaTypeChange,
  areaIds,
  onProjectAttributesDiffChange,
  projectId,
}: Props) => {
  const areas = useAreas();
  const project = useProject({ projectId });
  const localize = useLocalize();

  const handleAreaSelectionChange = (values: IOption[]) => {
    const selectedAreaIds = values.map((value) => value.value).filter(isString);
    onProjectAttributesDiffChange({ area_ids: selectedAreaIds }, 'enabled');
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
    const selectedAreaValues = projectAreaIds
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
          onChange={handleAreaTypeChange}
          currentValue={areaType}
          value="all"
          name="areas"
          id="areas-all"
          label={<FormattedMessage {...messages.areasAllLabel} />}
        />
        <Radio
          onChange={handleAreaTypeChange}
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

function getProjectArea(areas: IAreaData[], projectAreaId: string) {
  const projectArea = areas.find((area) => area.id === projectAreaId);
  return projectArea;
}

export default GeographicAreaInputs;
