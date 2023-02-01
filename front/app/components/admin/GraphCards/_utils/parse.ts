import { roundPercentage } from 'utils/math';
import { TimeSeriesTotalRow } from 'components/admin/GraphCards/typings';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// Replace zeroes with '-' by convention & return strings
export const formatCountValue = (count: number): string => {
  if (count === 0) return '-';
  return count.toString();
};

export const getConversionRate = (from: number, to: number) => {
  if (to <= 0) return `0%`;
  return `${Math.min(100, roundPercentage(from, to))}%`;
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
  serie: TimeSeriesTotalRow[] | NilOrError
): {
  typeOfChange: 'increase' | 'decrease' | null;
  totalNumber: number | null;
  formattedSerieChange: string | null;
} => {
  if (!isNilOrError(serie)) {
    const firstSerieValue = serie && serie[0].total;
    const lastSerieValue = serie && serie[serie.length - 1].total;
    const serieChange = lastSerieValue - firstSerieValue;
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
