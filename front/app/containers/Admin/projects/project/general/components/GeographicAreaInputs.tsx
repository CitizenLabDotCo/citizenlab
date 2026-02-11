import React, { useState, useEffect } from 'react';

import { IconTooltip, Radio } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { IOption, isIOption } from 'typings';

import { IAreaData } from 'api/areas/types';
import useAreas from 'api/areas/useAreas';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import { SubSectionTitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isString } from 'utils/helperUtils';
import { useParams } from 'utils/router';

import { TOnProjectAttributesDiffChangeFunction } from '..';
import { LabelHeaderDescription } from '../../../project/phaseSetup/components/PhaseParticipationConfig/components/shared/labels';
import messages from '../messages';

import { StyledSectionField, StyledMultipleSelect } from './styling';

interface Props {
  areaIds: string[] | undefined;
  onProjectAttributesDiffChange: TOnProjectAttributesDiffChangeFunction;
}

const AreaRadio = styled(Radio)`
  margin-bottom: 25px;
`;

type TProjectAreaType = 'none' | 'all' | 'selection';

const GeographicAreaInputs = ({
  areaIds,
  onProjectAttributesDiffChange,
}: Props) => {
  const { projectId } = useParams({
    strict: false,
  });
  const { data: areas } = useAreas({});
  const { data: project } = useProjectById(projectId);
  const localize = useLocalize();
  const [areaType, setAreaType] = useState<TProjectAreaType>('none');

  useEffect(() => {
    if (project) {
      setAreaType(
        // if we have at least one project area
        project.data.relationships.areas.data.length > 0
          ? // areaType is 'selection'
            'selection'
          : // else if include_all_areas is true
          project.data.attributes.include_all_areas
          ? // areaType is 'all'
            'all'
          : // else areaType is 'none'
            'none'
      );
    }
  }, [project]);

  const handleAreaSelectionChange = (values: IOption[]) => {
    const selectedAreaIds = values.map((value) => value.value).filter(isString);
    onProjectAttributesDiffChange({ area_ids: selectedAreaIds });
  };

  const handleAreaTypeOnChange = (areaType: TProjectAreaType) => {
    setAreaType(areaType);
    onProjectAttributesDiffChange({
      area_ids: areaType === 'selection' ? areaIds : [],
      include_all_areas: areaType === 'all',
    });
  };

  const mapProjectAreaIdsToAreaOptions = (
    projectAreaIds: string[],
    areas: IAreaData[]
  ) => {
    return projectAreaIds
      .map((projectAreaId) => {
        const projectArea = getProjectArea(areas, projectAreaId);

        return projectArea
          ? {
              value: projectAreaId,
              label: localize(projectArea.attributes.title_multiloc),
            }
          : null;
      })
      .filter(isIOption);
  };

  if (areas) {
    const areaOptions: IOption[] = areas.data.map((area) => ({
      value: area.id,
      label: localize(area.attributes.title_multiloc),
    }));

    const projectAreaIds = [
      // areaIds coming from the parent form. These are the ones coming from
      // changes (via the handle functions above) saved in the form projectAttributesDiff.
      // This will always be undefined on initial load.
      ...(areaIds ||
        // If there aren't any yet, we check if we already have areaIds saved
        // to the project.
        // After you select/remove areas, projectAttributesDiff will include
        // these and they will already be in areaIds above.
        (project
          ? project.data.relationships.areas.data.map((area) => area.id)
          : [])),
    ];
    const selectedAreaValues = mapProjectAreaIdsToAreaOptions(
      projectAreaIds,
      areas.data
    );

    return (
      <StyledSectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.areasLabelHint} />
          <IconTooltip
            content={
              <FormattedMessage
                {...messages.areasLabelTooltipHint}
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
        <AreaRadio
          onChange={handleAreaTypeOnChange}
          currentValue={areaType}
          value="none"
          name="areas"
          id="areas-none"
          label={
            <LabelHeaderDescription
              header={<FormattedMessage {...messages.areasNoneLabel} />}
              description={
                <FormattedMessage {...messages.areasNoneLabelDescription} />
              }
            />
          }
        />
        <AreaRadio
          onChange={handleAreaTypeOnChange}
          currentValue={areaType}
          value="all"
          name="areas"
          id="areas-all"
          label={
            <LabelHeaderDescription
              header={<FormattedMessage {...messages.areasAllLabel} />}
              description={
                <FormattedMessage {...messages.areasAllLabelDescription} />
              }
            />
          }
        />
        <AreaRadio
          onChange={handleAreaTypeOnChange}
          currentValue={areaType}
          value="selection"
          name="areas"
          id="areas-selection"
          className="e2e-areas-selection"
          label={
            <LabelHeaderDescription
              header={<FormattedMessage {...messages.areasSelectionLabel} />}
              description={
                <FormattedMessage
                  {...messages.areasSelectionLabelDescription}
                />
              }
            />
          }
        />

        {areaType === 'selection' && (
          <StyledMultipleSelect
            id="e2e-area-selector"
            options={areaOptions}
            value={selectedAreaValues}
            onChange={handleAreaSelectionChange}
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
