import { DemographicsResponse } from 'api/graph_data_units/responseTypes/DemographicsWidget';

import { Localize } from 'hooks/useLocalize';

import { binAge } from 'utils/dataUtils';
import { roundPercentages } from 'utils/math';

export interface DemographicsSeriesData {
  series: Record<string, number>;
  options?: Record<
    string,
    {
      title_multiloc: Record<string, string>;
      ordering: number;
    }
  >;
  population_distribution?: Record<string, number>;
}

export interface DemographicChartRow {
  category: string;
  participants: number;
  population?: number;
  count: number;
}

export const transformDemographicsToChartRows = (
  data: DemographicsSeriesData,
  customFieldCode: string | undefined,
  blankLabel: string,
  localizeOption: (key: string, multiloc?: Record<string, string>) => string
): DemographicChartRow[] => {
  const { series, options, population_distribution } = data;

  // Special handling for birthyear: bin ages into ranges
  const isBirthyearData =
    options === undefined && customFieldCode === 'birthyear';

  if (isBirthyearData) {
    return transformBirthyearData(series, blankLabel, population_distribution);
  }

  // If options is undefined but it's not birthyear, it's an unsupported number field
  if (options === undefined) {
    return [];
  }

  // Standard select field: transform with options
  return transformSelectFieldData(
    series,
    options,
    blankLabel,
    localizeOption,
    population_distribution
  );
};

const transformBirthyearData = (
  series: Record<string, number>,
  blankLabel: string,
  population_distribution?: Record<string, number>
): DemographicChartRow[] => {
  const bins = binAge(series, {
    missingBin: blankLabel,
  });

  const values = bins.map((bin) => bin.value);
  const percentages = roundPercentages(values);

  let populationPercentages: (number | undefined)[] | undefined;
  if (population_distribution) {
    const populationBins = binAge(population_distribution, {
      missingBin: blankLabel,
    });
    const populationValues = populationBins.map((bin) => bin.value);
    populationPercentages = roundPercentages(populationValues);
  }

  return bins.map((bin, index) => ({
    category: bin.name,
    participants: percentages[index],
    population: populationPercentages?.[index],
    count: bin.value,
  }));
};

const transformSelectFieldData = (
  series: Record<string, number>,
  options: Record<
    string,
    {
      title_multiloc: Record<string, string>;
      ordering: number;
    }
  >,
  blankLabel: string,
  localizeOption: (key: string, multiloc?: Record<string, string>) => string,
  population_distribution?: Record<string, number>
): DemographicChartRow[] => {
  const columnsWithoutBlank = Object.keys(options).sort(
    (a, b) => options[a].ordering - options[b].ordering
  );

  const hasBlank = (series['_blank'] ?? 0) > 0;
  const columns = hasBlank
    ? [...columnsWithoutBlank, '_blank']
    : columnsWithoutBlank;

  const values = columns.map((column) => series[column] || 0);
  const percentages = roundPercentages(values);

  let populationPercentages: (number | undefined)[] | undefined;
  if (population_distribution) {
    const populationValues = columns.map(
      (column) => population_distribution[column] || 0
    );
    populationPercentages = roundPercentages(populationValues);
  }

  return columns.map((column, index) => {
    const category =
      column === '_blank'
        ? blankLabel
        : localizeOption(column, options[column].title_multiloc);

    return {
      category,
      participants: percentages[index],
      population: populationPercentages?.[index],
      count: series[column] || 0,
    };
  });
};

export const transformReportBuilderDemographics = (
  response: DemographicsResponse,
  localize: Localize,
  blankLabel: string,
  customFieldCode?: string
): DemographicChartRow[] => {
  return transformDemographicsToChartRows(
    response.data.attributes,
    customFieldCode,
    blankLabel,
    (_key, multiloc) => (multiloc ? localize(multiloc) : _key)
  );
};
