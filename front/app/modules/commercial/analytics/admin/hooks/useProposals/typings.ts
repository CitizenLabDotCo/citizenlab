import { IResolution } from 'components/admin/ResolutionControl';
import { Moment } from 'moment';
import { XlsxData } from 'components/admin/ReportExportMenu';

// TODO: Duplicated from other components
export interface QueryParameters {
  projectId: string | undefined;
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null | undefined;
  resolution: IResolution;
}

export interface ChartData {
  totalProposals: {
    value: string;
    lastPeriod: string;
  };
  successfulProposals: {
    value: string;
    lastPeriod: string;
  };
}

// TODO: Why does the Statistics component take string values?
export interface Proposals {
  chartData: ChartData;
  xlsxData: XlsxData;
}

export type Count = {
  count: number;
};

export type Response = {
  data: Count[];
};
