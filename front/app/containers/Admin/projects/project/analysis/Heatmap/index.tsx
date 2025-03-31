import React, { useState } from 'react';

import { useParams } from 'react-router-dom';

import { Unit } from 'api/analysis_heat_map_cells/types';
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
  const [initialCustomFieldId, setInitialCustomFieldId] = useState<
    string | undefined
  >();

  const { formatMessage } = useIntl();

  const { projectId } = useParams() as { projectId: string };

  const { data: project } = useProjectById(projectId);

  const statisticalInsightsEnabled = useFeatureFlag({
    name: 'statistical_insights',
    onlyCheckAllowed: true,
  });

  const { data: customFields } = useUserCustomFields({
    inputTypes: ['select', 'multiselect', 'number', 'checkbox'],
  });

  if (!customFields || !statisticalInsightsEnabled || !project) {
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
    customFieldId,
  }: {
    unit: Unit;
    customFieldId?: string;
  }) => {
    setInitialUnit(unit);
    setInitialCustomFieldId(customFieldId);
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
            customFields={customFields}
            initialCustomFieldId={initialCustomFieldId}
            initialUnit={initialUnit}
          />
        )}
      </>
    </div>
  );
};

export default Heatmap;
