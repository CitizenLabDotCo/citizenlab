import { MessageDescriptor } from 'react-intl';

import { Query } from 'api/analytics/types';

import {
  Dates,
  ProjectId,
  Resolution,
} from 'components/admin/GraphCards/typings';

export interface StatCardStat {
  value: string;
  label: string;
  lastPeriod?: string;
  toolTip?: string;
  display?: 'corner' | 'column';
}

export interface StatCardData {
  cardTitle: string;
  fileName: string;
  periodLabel?: string;
  stats: StatCardStat[];
}

export type StatCardLabels = Record<string, string>;

export type StatCardProps = ProjectId & Dates & Resolution;

export interface StatCardTemplateProps extends StatCardProps {
  config: StatCardConfig;
  showExportMenu?: boolean;
  alignItems?: 'stretch' | 'center';
}

export interface StatCardQueryParameters extends StatCardProps {
  messages: Record<string, MessageDescriptor>;
  queryHandler: StatCardQueryHandler;
  dataParser: StatCardDataParser;
}

export interface StatCardConfig {
  messages: Record<string, MessageDescriptor>;
  title: MessageDescriptor;
  queryHandler: StatCardQueryHandler;
  dataParser: StatCardDataParser;
}

// Query response
export type SingleCount = {
  count: number;
};

export type SingleCountResponse = {
  data: {
    type: 'analytics';
    attributes: SingleCount[][];
  };
};

// Functions to be implemented on each StatCard
export interface StatCardDataParser {
  (responseData, formatLabels, projectId: string | undefined): StatCardData;
}

export interface StatCardQueryHandler {
  ({ projectId, startAtMoment, endAtMoment, resolution }: StatCardProps): Query;
}
