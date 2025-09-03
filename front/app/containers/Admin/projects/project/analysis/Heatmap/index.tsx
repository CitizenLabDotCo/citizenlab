import React, { useState } from 'react';

import { Button } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useAnalysis from 'api/analyses/useAnalysis';
import { Unit } from 'api/analysis_heat_map_cells/types';
import useProjectById from 'api/projects/useProjectById';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Warning from 'components/UI/Warning';
import UpsellTooltip from 'components/UpsellTooltip';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import useRelevantToHeatmapInputCustomFields from '../hooks/useRelevantToHeatmapInputCustomFields';

import HeatmapDetails from './HeatmapDetails';
import HeatmapInsights from './HeatmapInsights';
import messages from './messages';
import tracks from './tracks';

const Heatmap = () => {
  const [isHeatmapDetailsOpen, setIsHeatmapDetailsOpen] = useState(false);
  const [initialUnit, setInitialUnit] = useState<Unit>('inputs');
  const [initialColumnFieldId, setInitialColumnFieldId] = useState<
    string | undefined
  >();
  const [initialRowType, setInitialRowType] = useState<string | undefined>();

  const { formatMessage } = useIntl();

  const { projectId } = useParams() as { projectId: string };
  const { analysisId } = useParams() as { analysisId: string };

  const { data: analysis } = useAnalysis(analysisId);

  const { data: project } = useProjectById(projectId);

  const autoInsightsAllowed = useFeatureFlag({
    name: 'auto_insights',
    onlyCheckAllowed: true,
  });

  const { data: userCustomFields } = useUserCustomFields({
    inputTypes: ['select', 'multiselect', 'number', 'checkbox'],
  });

  const relevantInputFields = useRelevantToHeatmapInputCustomFields({
    projectId,
    phaseId: analysis?.data.relationships.phase?.data?.id || undefined,
  });

  const filteredInputCustomFields = relevantInputFields
    // Only show custom fields that are used in the analysis
    ?.filter((customField) => {
      const analysisCustomFieldIds = [
        analysis?.data.relationships.main_custom_field?.data?.id,
        ...(
          analysis?.data.relationships.additional_custom_fields?.data || []
        ).map((customField) => customField.id),
      ];
      return analysisCustomFieldIds.includes(customField.id);
    });

  if (!userCustomFields || !filteredInputCustomFields || !project) {
    return null;
  }

  if (!autoInsightsAllowed) {
    return (
      <UpsellTooltip disabled={false}>
        <Button icon="lock">{formatMessage(messages.viewAutoInsights)}</Button>
      </UpsellTooltip>
    );
  }

  if (project.data.attributes.participants_count < 30) {
    return (
      <Warning>
        {formatMessage(
          messages.notAvailableForProjectsWithLessThan30Participants
        )}
      </Warning>
    );
  }

  const onExploreClick = ({
    unit,
    columnCustomFieldId,
    rowType,
  }: {
    unit: Unit;
    columnCustomFieldId?: string;
    rowType?: string;
  }) => {
    setInitialUnit(unit);
    setInitialColumnFieldId(columnCustomFieldId);
    setInitialRowType(rowType);
    setIsHeatmapDetailsOpen(true);
    trackEventByName(tracks.heatmapOpened);
  };

  return (
    <div>
      <>
        <HeatmapInsights onExploreClick={onExploreClick} />
        {isHeatmapDetailsOpen && (
          <HeatmapDetails
            onClose={() => {
              setIsHeatmapDetailsOpen(false);
              trackEventByName(tracks.heatmapClosed);
            }}
            userCustomFields={userCustomFields.data}
            inputCustomFields={filteredInputCustomFields}
            initialColumnFieldId={initialColumnFieldId}
            initialRowType={initialRowType}
            initialUnit={initialUnit}
          />
        )}
      </>
    </div>
  );
};

export default Heatmap;
