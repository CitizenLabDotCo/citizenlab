import React from 'react';

import DemographicCard, {
  CATEGORICAL_COLORS,
  SEQUENTIAL_COLORS,
} from 'design-system/DemographicCard';

import { DemographicField } from 'api/phase_insights/types';

interface Props {
  field: DemographicField;
}

// Age groups run from young to old, so they read as one scale; other
// answers get a colour each.
const DemographicFieldCard = ({ field }: Props) => {
  const isOrdered =
    field.field_code === 'birthyear' &&
    field.data_points.length <= SEQUENTIAL_COLORS.length;
  const colors = isOrdered ? SEQUENTIAL_COLORS : CATEGORICAL_COLORS;

  return (
    <DemographicCard
      title={field.field_name}
      segments={field.data_points.map((point, index) => ({
        label: point.label,
        share: point.percentage / 100,
        value: `${point.percentage}%`,
        color: colors[index % colors.length],
      }))}
    />
  );
};

export default DemographicFieldCard;
