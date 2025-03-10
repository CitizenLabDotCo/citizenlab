import React, { useState } from 'react';

import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import HeatmapDetails from './HeatmapDetails';
import HeatmapInsights from './HeatmapInsights';

const Heatmap = () => {
  const [isReadMoreOpen, setIsReadMoreOpen] = useState(false);
  const { data: customFields } = useUserCustomFields({
    inputTypes: ['select'],
  });
  return (
    <div>
      {customFields && (
        <>
          <HeatmapInsights onReadMoreClick={() => setIsReadMoreOpen(true)} />
          {isReadMoreOpen && (
            <HeatmapDetails
              onClose={() => setIsReadMoreOpen(false)}
              customFields={customFields}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Heatmap;
