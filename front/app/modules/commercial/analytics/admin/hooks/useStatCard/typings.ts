import { XlsxData } from 'components/admin/ReportExportMenu';
import { Dates, ProjectId, Resolution } from '../../typings';
import { MessageDescriptor, WrappedComponentProps } from 'react-intl';
import { Query } from '../../services/analyticsFacts';

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
  cardData: StatCardChartData;
  xlsxData: XlsxData;
}

export type StatCardProps = ProjectId & Dates & Resolution;

export interface StatCardTemplateProps extends StatCardProps {
  config: StatCardConfig;
}

export interface StatCardQueryParameters extends StatCardProps {
  queryHandler: StatCardQueryHandler;
  dataParser: StatCardDataParser;
}

export interface StatCardConfig {
  title: MessageDescriptor;
  queryHandler: StatCardQueryHandler;
  dataParser: StatCardDataParser;
}

// Query response
export type SingleCount = {
  count: number;
};

export type SingleCountResponse = {
  data: SingleCount[][];
};

// Functions to be implemented on each StatCard
export interface StatCardDataParser {
  (
    responseData,
    formatMessage: WrappedComponentProps['intl']['formatMessage'],
    resolution?
  ): StatCardChartData;
}

export interface StatCardQueryHandler {
  ({ projectId, startAtMoment, endAtMoment, resolution }: StatCardProps): Query;
}
