import { Paragraph, Table } from 'docx';

import type { DemographicField } from 'api/phase_insights/types';

import { createSimpleTable } from 'utils/word/converters/tableConverter';
import {
  createHeading,
  createEmptyParagraph,
} from 'utils/word/converters/textConverter';

import messages from '../messages';

import type { WordExportIntl } from '../useInsightsWordDownload';

/**
 * Creates a demographics section with tables for each demographic field.
 */
export function createDemographicsSection(
  fields: DemographicField[],
  intl: WordExportIntl
): (Paragraph | Table)[] {
  const { formatMessage } = intl;

  if (fields.length === 0) {
    return [];
  }

  const result: (Paragraph | Table)[] = [
    createHeading(formatMessage(messages.demographics), 2),
  ];

  fields.forEach((field, index) => {
    result.push(createHeading(field.field_name, 3));

    // Build table data
    const hasPopulation = field.data_points.some(
      (dp) => dp.population_percentage !== undefined
    );

    const headers = [
      formatMessage(messages.category),
      formatMessage(messages.count),
      `${formatMessage(messages.participants)} %`,
    ];
    if (hasPopulation) {
      headers.push('Population %');
    }

    const rows: (string | number)[][] = [headers];

    field.data_points.forEach((dataPoint) => {
      const row: (string | number)[] = [
        dataPoint.label,
        dataPoint.count,
        `${dataPoint.percentage.toFixed(1)}%`,
      ];
      if (hasPopulation) {
        row.push(
          dataPoint.population_percentage !== undefined
            ? `${dataPoint.population_percentage.toFixed(1)}%`
            : '-'
        );
      }
      rows.push(row);
    });

    result.push(
      createSimpleTable(rows, {
        columnWidths: hasPopulation ? [40, 15, 22, 23] : [50, 20, 30],
      })
    );

    // Add spacing between fields
    if (index < fields.length - 1) {
      result.push(createEmptyParagraph());
    }
  });

  return result;
}
