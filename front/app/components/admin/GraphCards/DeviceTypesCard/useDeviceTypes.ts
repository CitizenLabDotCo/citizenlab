import { useDeviceTypesLive } from 'api/graph_data_units';

import { ProjectId, Dates } from 'components/admin/GraphCards/typings';
import { categoricalColorScheme } from 'components/admin/Graphs/styling';

import { useIntl } from 'utils/cl-intl';
import { keys } from 'utils/helperUtils';
import { roundPercentages } from 'utils/math';

import { getTranslations, Translations } from './translations';

export type QueryParameters = ProjectId & Dates;

const useDeviceTypes = ({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParameters) => {
  const { formatMessage } = useIntl();
  const { data } = useDeviceTypesLive({
    project_id: projectId,
    start_at: startAtMoment?.local().format('YYYY-MM-DD'),
    end_at: endAtMoment?.local().format('YYYY-MM-DD'),
  });

  const translations = getTranslations(formatMessage);

  if (!data) return { pieData: undefined, xlsxData: undefined };

  const { counts_per_device_type } = data.data.attributes;

  const deviceTypes = keys(counts_per_device_type);
  const counts = deviceTypes.map(
    (deviceType) => counts_per_device_type[deviceType]
  );
  const percentages = roundPercentages(counts);

  const pieData = deviceTypes.map((deviceType, i) => ({
    name: deviceType,
    value: counts[i],
    color: categoricalColorScheme({ rowIndex: i }),
    percentage: percentages[i],
  }));

  const xlsxData = parseExcelData(pieData, translations);

  return { pieData, xlsxData };
};

interface PieRow {
  name: 'mobile' | 'tablet' | 'desktop_or_other';
  value: number;
  color: string;
  percentage: number;
}

const parseExcelData = (pieData: PieRow[], translations: Translations) => {
  const visitorsLanguageData = pieData.map((row) => ({
    [translations.type]: translations[row.name],
    [translations.count]: row.value,
  }));

  const xlsxData = {
    [translations.title]: visitorsLanguageData,
  };

  return xlsxData;
};

export default useDeviceTypes;
