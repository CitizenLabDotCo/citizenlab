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

  const cardData = dataParser(
    analytics?.data.attributes,
    formattedLabels,
    projectId
  );
  const xlsxData = parseExcelData(cardData);

  const statCard = {
    cardData,
    xlsxData,
  };

  return statCard;
}
