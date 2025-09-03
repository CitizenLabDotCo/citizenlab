import { TimeSeriesTotalRow } from 'components/admin/GraphCards/typings';

import { isNilOrError, NilOrError } from 'utils/helperUtils';

// Replace zeroes with '-' by convention & return strings
export const formatCountValue = (count: number): string => {
  if (count === 0) return '-';
  return count.toString();
};

const formatSerieChange = (serieChange: number) => {
  if (serieChange > 0) {
    return `(+${serieChange.toString()})`;
  } else if (serieChange < 0) {
    return `(${serieChange.toString()})`;
  }
  return null;
};

export const getFormattedNumbers = (
  serie: TimeSeriesTotalRow[] | NilOrError,
  firstSerieBar: number
): {
  typeOfChange: 'increase' | 'decrease' | null;
  totalNumber: number | null;
  formattedSerieChange: string | null;
} => {
  if (!isNilOrError(serie)) {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const firstSerieValue = serie && serie[0].total;
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const lastSerieValue = serie && serie[serie.length - 1].total;
    const serieChange = lastSerieValue - firstSerieValue + firstSerieBar;
    let typeOfChange: 'increase' | 'decrease' | null = null;

    if (serieChange > 0) {
      typeOfChange = 'increase';
    } else if (serieChange < 0) {
      typeOfChange = 'decrease';
    }

    return {
      typeOfChange,
      totalNumber: lastSerieValue,
      formattedSerieChange: formatSerieChange(serieChange),
    };
  }

  return {
    totalNumber: null,
    formattedSerieChange: null,
    typeOfChange: null,
  };
};
