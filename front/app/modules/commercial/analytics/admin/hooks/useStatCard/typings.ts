import { XlsxData } from 'components/admin/ReportExportMenu';
import { Dates, ProjectId, Resolution } from '../../typings';
import { WrappedComponentProps } from 'react-intl';
import { Query } from '../../services/analyticsFacts'; // ? WHY ?

export interface StatCardStat {
  value: string;
  label: string;
  lastPeriod?: string;
  toolTip?: string;
}

export interface StatCardChartData {
  cardTitle: string;
  fileName: string;
  periodLabel?: string;
  stats: StatCardStat[];
}

export interface StatCardData {
  chartData: StatCardChartData;
  xlsxData: XlsxData;
}

export type StatCardProps = ProjectId & Dates & Resolution;

export interface StatCardQueryParameters extends StatCardProps {
  query: StatCardQuery;
  parseChartData: ChartDataParser;
}

// Query response
export type SingleCount = {
  count: number;
};

export type SingleCountResponse = {
  data: SingleCount[][];
};

// Functions to be implemented on each StatCard
export interface ChartDataParser {
  (
    responseData,
    formatMessage: WrappedComponentProps['intl']['formatMessage'],
    resolution
  ): StatCardChartData;
}

export interface StatCardQuery {
  ({ projectId, startAtMoment, endAtMoment, resolution }: StatCardProps): Query;
}
