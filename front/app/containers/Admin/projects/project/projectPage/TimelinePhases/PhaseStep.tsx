import React from 'react';

import {
  Box,
  Color,
  Text,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import { getLocale } from 'components/admin/DatePickers/_shared/locales';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from '../messages';
import {
  PhaseStatus,
  StepDot,
  StepLine,
  StepMeta,
  StepRow,
  StepTitle,
  formatDatePair,
  phaseStatus,
} from '../phaseRowUtils';

const STATUS_STYLES: Record<
  PhaseStatus,
  {
    label: MessageDescriptor;
    labelColor: Color;
    labelWeight: number;
    titleColor: string;
  }
> = {
  past: {
    label: messages.phaseDone,
    labelColor: 'green600',
    labelWeight: 400,
    titleColor: bo.colors.textHeadingStrong,
  },
  present: {
    label: messages.phaseInProgress,
    labelColor: 'primary',
    labelWeight: 500,
    titleColor: bo.colors.textHeadingStrong,
  },
  future: {
    label: messages.phaseUpcoming,
    labelColor: 'textSecondary',
    labelWeight: 400,
    titleColor: colors.coolGrey700,
  },
};

interface Props {
  phase: IPhaseData;
  selected: boolean;
  isLast: boolean;
  withOptions: boolean;
}

const PhaseStep = ({ phase, selected, isLast, withOptions }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const dateLocale = getLocale(useLocale());
  const status = phaseStatus(phase);
  const { label, labelColor, labelWeight, titleColor } = STATUS_STYLES[status];

  return (
    <StepRow selected={selected}>
      {!isLast && <StepLine status={status} />}
      <StepDot status={status} />
      <Box flexGrow={1} pr={withOptions ? '24px' : '0'}>
        <StepTitle style={{ color: titleColor }}>
          {localize(phase.attributes.title_multiloc)}
        </StepTitle>
        <StepMeta color="textSecondary">
          <Text
            as="span"
            m="0"
            color={labelColor}
            style={{ fontWeight: labelWeight }}
          >
            {formatMessage(label)}
          </Text>
          {' · '}
          {formatDatePair(
            phase.attributes.start_at,
            phase.attributes.end_at,
            'd MMMM',
            dateLocale,
            formatMessage(messages.phaseNoEndDate)
          )}
        </StepMeta>
      </Box>
    </StepRow>
  );
};

export default PhaseStep;
