// services

// utils
import { formatLabels, parseExcelData } from './parse';
import { useIntl } from 'utils/cl-intl';

// typings
import { SingleCountResponse, StatCardQueryParameters } from './typings';
import useAnalytics from 'api/analytics/useAnalytics';
import { useState } from 'react';

export default function useStatCard({
  messages,
  queryHandler,
  dataParser,
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: StatCardQueryParameters) {
  const { formatMessage } = useIntl();
  const [currentResolution, setCurrentResolution] = useState(resolution);

  const { data: analytics } = useAnalytics<SingleCountResponse>(
    queryHandler({
      projectId,
      startAtMoment,
      endAtMoment,
      resolution,
    }),
    () => setCurrentResolution(resolution)
  );

  const formattedLabels = formatLabels(
    messages,
    formatMessage,
    currentResolution
  );

  const cardData =
    analytics &&
    dataParser(analytics.data.attributes, formattedLabels, projectId);

  const xlsxData = cardData && parseExcelData(cardData);

  const statCard = cardData &&
    xlsxData && {
      cardData,
      xlsxData,
    };

  return statCard;
}
