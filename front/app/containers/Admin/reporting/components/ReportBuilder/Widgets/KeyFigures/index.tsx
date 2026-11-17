import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import { useEditor } from '@craftjs/core';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import Settings from './Settings';

export interface Figure {
  // Already formatted for reading — "5,663", "61%", "4.5/5" — because the
  // headline number is the point, not the raw value.
  value?: string;
  label?: Multiloc;
}

export interface Props {
  // What the settings panel writes; the composer writes whatever the model gave it.
  figures?: Figure[];
}

interface Shown {
  value: string;
  label: Multiloc | undefined;
}

// The back end leaves this prop's shape unchecked on purpose, and one node that
// throws takes down the builder, the PDF and the public report together.
const readFigures = (figures: Props['figures']): Shown[] => {
  const candidates: unknown[] = Array.isArray(figures) ? figures : [];

  return candidates.flatMap((figure) => {
    if (typeof figure !== 'object' || figure === null) return [];

    const rawValue = 'value' in figure ? figure.value : undefined;
    const rawLabel = 'label' in figure ? figure.label : undefined;

    // Anything React cannot render as a child would throw.
    const value =
      typeof rawValue === 'string' || typeof rawValue === 'number'
        ? String(rawValue)
        : '';
    // localize() handles a missing or non-string locale value itself.
    const label =
      typeof rawLabel === 'object' && rawLabel !== null
        ? (rawLabel as Multiloc)
        : undefined;

    return [{ value, label }];
  });
};

// The figures sit in one bordered band, divided rather than boxed: a row of
// separate cards reads as navigation, a divided band reads as a fact table.
const Band = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  break-inside: avoid;
  border: 1px solid ${colors.divider};
  border-radius: 3px;
`;

const Cell = styled(Box)`
  flex: 1 1 120px;
  padding: 16px 20px;

  & + & {
    border-left: 1px solid ${colors.divider};
  }
`;

const KeyFigures = ({ figures }: Props) => {
  const localize = useLocalize();
  const { inBuilder } = useEditor((state) => ({
    inBuilder: state.options.enabled,
  }));
  const shown = readFigures(figures).filter(
    (figure) => figure.value || localize(figure.label)
  );

  if (shown.length === 0) {
    // The hint is addressed to the admin filling the widget in, not to a reader.
    if (!inBuilder) return null;

    return (
      <Box className="e2e-key-figures" py="8px">
        <Text m="0" color="textSecondary" fontSize="s">
          <FormattedMessage {...messages.emptyInBuilder} />
        </Text>
      </Box>
    );
  }

  return (
    <Band className="e2e-key-figures" my="8px">
      {shown.map((figure, index) => (
        <Cell key={index}>
          <Text
            m="0"
            color="tenantPrimary"
            fontWeight="bold"
            style={{ fontSize: '26px', lineHeight: 1.1 }}
          >
            {figure.value}
          </Text>
          <Text
            m="6px 0 0"
            fontSize="xs"
            color="textSecondary"
            style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            {localize(figure.label)}
          </Text>
        </Cell>
      ))}
    </Band>
  );
};

KeyFigures.craft = {
  props: {
    figures: [],
  },
  related: {
    settings: Settings,
  },
  custom: {
    title: messages.keyFigures,
  },
};

export const keyFiguresTitle = messages.keyFigures;

export default KeyFigures;
