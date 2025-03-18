import React, { useState } from 'react';

import { Unit } from 'api/analysis_heat_map_cells/types';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import HeatmapDetails from './HeatmapDetails';
import HeatmapInsights from './HeatmapInsights';

const Heatmap = () => {
  const [isReadMoreOpen, setIsReadMoreOpen] = useState(false);
  const [initialUnit, setInitialUnit] = useState<Unit>('inputs');
  const [initialCustomFieldId, setInitialCustomFieldId] = useState<
    string | undefined
  >();
  const { data: customFields } = useUserCustomFields({
    inputTypes: ['select', 'multiselect'],
  });

  if (!customFields) {
    return null;
  }

  const getCustomFieldIdFromOptionId = (optionId?: string) => {
    if (!optionId) return;

    return customFields.data.find((customField) =>
      customField.relationships?.options.data.find(
        (option) => option.id === optionId
      )
    )?.id;
  };

  const onExploreClick = ({
    unit,
    customFieldOptionId,
  }: {
    unit: Unit;
    customFieldOptionId?: string;
  }) => {
    setInitialUnit(unit);
    setInitialCustomFieldId(getCustomFieldIdFromOptionId(customFieldOptionId));
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
