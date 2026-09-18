import { colors } from '@citizenlab/cl2-component-library';

import {
  DemographicField,
  OpinionGroupsAttributes,
  Statement,
} from 'api/opinion_groups/types';

// Fixed categorical palette. Slot order never changes, so a group keeps its
// colour when the number of groups changes. Validated for colour-vision
// deficiencies on a light surface.
export const CATEGORICAL_COLORS = [
  '#2a78d6',
  '#eb6834',
  '#1baf7a',
  '#eda100',
  '#e87ba4',
  '#008300',
  '#4a3aa7',
  '#e34948',
];

export const UNKNOWN_COLOR = colors.coolGrey300;

export const colorForIndex = (index: number) =>
  CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length];

export const formatShare = (share: number | null | undefined) =>
  share === null || share === undefined ? '' : `${Math.round(share * 100)}%`;

export const statementsById = (statements: Statement[]) =>
  new Map(statements.map((statement) => [statement.id, statement]));

export const fieldsByKey = (fields: DemographicField[]) =>
  new Map(fields.map((field) => [field.key, field]));

// Representation index thresholds: below LOW the category is
// under-represented, above HIGH it is over-represented.
export const REPRESENTATION_LOW = 0.75;
export const REPRESENTATION_HIGH = 1.25;

export const hasEnoughData = (attributes: OpinionGroupsAttributes) =>
  attributes.points.length >= 4 && attributes.groups.length > 0;
