import React, { useState } from 'react';

import { Unit } from 'api/analysis_heat_map_cells/types';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import useFeatureFlag from 'hooks/useFeatureFlag';

import HeatmapDetails from './HeatmapDetails';
import HeatmapInsights from './HeatmapInsights';

const Heatmap = () => {
  const [isReadMoreOpen, setIsReadMoreOpen] = useState(false);
  const [initialUnit, setInitialUnit] = useState<Unit>('inputs');
  const [initialCustomFieldId, setInitialCustomFieldId] = useState<
    string | undefined
  >();

  const statisticalInsightsEnabled = useFeatureFlag({
    name: 'statistical_insights',
    onlyCheckAllowed: true,
  });

  const { data: customFields } = useUserCustomFields({
    inputTypes: ['select', 'multiselect', 'number', 'checkbox'],
  });

  if (!customFields || !statisticalInsightsEnabled) {
    return null;
  }

  const onExploreClick = ({
    unit,
    customFieldId,
  }: {
    unit: Unit;
    customFieldId?: string;
  }) => {
    console.log('onExploreClick', unit, customFieldId);
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
