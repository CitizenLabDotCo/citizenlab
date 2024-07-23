import React from 'react';

import { ResultGrouped, ResultUngrouped } from 'api/survey_results/types';

import LineLocationQuestion from './LineLocationQuestion';
import PointLocationQuestion from './PointLocationQuestion';
import PolygonLocationQuestion from './PolygonLocationQuestion';

interface Props {
  customFieldId: string;
  projectId: string;
  heatmap?: boolean;
  attributes: ResultGrouped | ResultUngrouped;
}

const MapQuestion = ({
  customFieldId,
  projectId,
  heatmap,
  attributes,
}: Props) => {
  return (
    <div>
      {!attributes.grouped && attributes.pointResponses && (
        <PointLocationQuestion
          pointResponses={attributes.pointResponses}
          customFieldId={customFieldId}
          projectId={projectId}
          mapConfigId={attributes.mapConfigId}
          heatmap={heatmap}
        />
      )}
      {!attributes.grouped && attributes.lineResponses && (
        <LineLocationQuestion
          lineResponses={attributes.lineResponses}
          customFieldId={customFieldId}
          projectId={projectId}
          mapConfigId={attributes.mapConfigId}
        />
      )}
      {!attributes.grouped && attributes.polygonResponses && (
        <PolygonLocationQuestion
          polygonResponses={attributes.polygonResponses}
          customFieldId={customFieldId}
          projectId={projectId}
          mapConfigId={attributes.mapConfigId}
        />
      )}
    </div>
  );
};

export default MapQuestion;
