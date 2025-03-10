import React, { useState } from 'react';

import HeatmapDetails from './HeatmapDetails';

const Heatmap = () => {
  const [isReadMoreOpen, setIsReadMoreOpen] = useState(false);

  return (
    <div>
      {' '}
      <HeatmapInsights onReadMoreClick={() => setIsReadMoreOpen(true)} />
      {isReadMoreOpen && (
        <HeatmapDetails onClose={() => setIsReadMoreOpen(false)} />
      )}
    </div>
  );
};

export default Heatmap;
