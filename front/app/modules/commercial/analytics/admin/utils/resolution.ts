import { IResolution } from 'components/admin/ResolutionControl';

export const resolutionDeducer =
  <Row>(columnPrefix: string) =>
  (series: Row[]): IResolution | null => {
    if (series.length === 0) return null;
    const firstRow = series[0];

    if (`${columnPrefix}.month` in firstRow) {
      return 'month';
    }

    if (`${columnPrefix}.week` in firstRow) {
      return 'week';
    }

    return 'day';
  };
