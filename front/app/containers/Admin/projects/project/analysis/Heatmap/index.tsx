import React, { useState } from 'react';

import { useParams } from 'react-router-dom';

import useAnalysis from 'api/analyses/useAnalysis';
import { Unit } from 'api/analysis_heat_map_cells/types';
import useCustomFields from 'api/custom_fields/useCustomFields';
import useProjectById from 'api/projects/useProjectById';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

import HeatmapDetails from './HeatmapDetails';
import HeatmapInsights from './HeatmapInsights';
import messages from './messages';

const Heatmap = () => {
  const [isReadMoreOpen, setIsReadMoreOpen] = useState(false);
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

  const statisticalInsightsEnabled = useFeatureFlag({
    name: 'statistical_insights',
    onlyCheckAllowed: true,
  });

  const { data: userCustomFields } = useUserCustomFields({
    inputTypes: ['select', 'multiselect', 'number', 'checkbox'],
  });

  const { data: inputCustomFields } = useCustomFields({
    projectId,
    phaseId: analysis?.data.relationships.phase?.data?.id,
    inputTypes: ['select'],
  });

  if (
    !userCustomFields ||
    !inputCustomFields ||
    !statisticalInsightsEnabled ||
    !project
  ) {
    return null;
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
    setIsReadMoreOpen(true);
  };

  return (
    <div>
      <>
        <HeatmapInsights onExploreClick={onExploreClick} />
        {isReadMoreOpen && (
          <HeatmapDetails
            onClose={() => {
              setIsReadMoreOpen(false);
            }}
            userCustomFields={userCustomFields.data}
            inputCustomFields={inputCustomFields}
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
