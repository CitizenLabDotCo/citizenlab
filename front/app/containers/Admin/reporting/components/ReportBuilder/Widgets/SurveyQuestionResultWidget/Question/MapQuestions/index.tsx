import React from 'react';

import { ResultGrouped, ResultUngrouped } from 'api/survey_results/types';

import { useReportContext } from 'containers/Admin/reporting/context/ReportContext';

import StaticMapScreenshot from 'components/admin/FormResults/FormResultsQuestion/MappingQuestions/StaticMapScreenshot';

import LineLocationQuestion from './LineLocationQuestion';
import MultipointLocationQuestion from './MultipointLocationQuestion';
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
  const { mapsCaptured } = useReportContext();

  // A live map draws on a WebGL canvas, which the PDF path cannot copy. Once its
  // screenshot has been taken the map is rendered as that image instead, the same
  // way the survey results page does it for its own PDF export.
  if (mapsCaptured) {
    return <StaticMapScreenshot customFieldId={customFieldId} />;
  }

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
      {!attributes.grouped && attributes.multipointResponses && (
        <MultipointLocationQuestion
          multipointResponses={attributes.multipointResponses}
          customFieldId={customFieldId}
          projectId={projectId}
          mapConfigId={attributes.mapConfigId}
          heatmap={heatmap}
        />
      )}
    </div>
  );
};

export default MapQuestion;
