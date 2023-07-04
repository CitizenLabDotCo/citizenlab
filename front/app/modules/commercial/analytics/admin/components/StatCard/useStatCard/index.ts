// services

// utils
import { formatLabels, parseExcelData } from './parse';
import { useIntl } from 'utils/cl-intl';

// typings
import { SingleCountResponse, StatCardQueryParameters } from './typings';
import useAnalytics from 'api/analytics/useAnalytics';

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

  const { data: analytics } = useAnalytics<SingleCountResponse>(
    queryHandler({
      projectId,
      startAtMoment,
      endAtMoment,
      resolution,
    })
  );

  const formattedLabels = formatLabels(messages, formatMessage, resolution);

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
