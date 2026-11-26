import React, { useId } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import { FieldError } from 'design-system/Field';

import { IUpdatedPhaseProperties } from 'api/phases/types';

import { DateRange } from 'components/admin/DatePickers/_shared/typings';
import DatePhasePicker from 'components/admin/DatePickers/DatePhasePicker';
import DesignSystemPicker from 'components/admin/DatePickers/DatePhasePicker/DesignSystemPicker';
import { isSelectedRangeOpenEnded } from 'components/admin/DatePickers/DatePhasePicker/isSelectedRangeOpenEnded';
import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';
import Error from 'components/UI/Error';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';
import { convertToTimeZoneISO } from 'utils/dateUtils';

import messages from '../../messages';
import { ValidationErrors } from '../../typings';

import { PhaseDateRanges } from './usePhaseDateRanges';

const START_MONTH = new Date(1900, 1, 1);
const CLASS_NAME = 'intercom-admin-phase-date-setup';

export type PhaseDates = Pick<IUpdatedPhaseProperties, 'start_at' | 'end_at'>;

type VariantProps =
  | { variant?: 'default'; label?: undefined }
  // The redesign names the picker in a card title, so it needs the label.
  | { variant: 'panel'; label: string };

type Props = VariantProps & {
  ranges: PhaseDateRanges;
  errors: CLErrors | null;
  validationErrors: ValidationErrors;
  onChange: (dates: PhaseDates) => void;
};

const PhaseDatePicker = ({
  ranges,
  errors,
  validationErrors,
  onChange,
  variant,
  label,
}: Props) => {
  const { selectedRange, disabledRanges, defaultMonth, timeZone } = ranges;
  const isPanel = variant === 'panel';
  const getApiErrorText = useApiErrorText();
  const startError = getApiErrorText(errors?.start_at);
  const endError = getApiErrorText(errors?.end_at);
  const errorId = useId();
  const hasError = !!(
    startError ||
    endError ||
    validationErrors.phaseDateError
  );

  const handleUpdateRange = ({ from, to }: Partial<DateRange>) =>
    onChange({
      start_at: convertToTimeZoneISO(from, timeZone),
      end_at: to ? convertToTimeZoneISO(to, timeZone) : null,
    });

  const openEndedWarning = (
    <>
      <FormattedMessage {...messages.noEndDateWarningTitle} />
      <ul>
        <li>
          <FormattedMessage {...messages.noEndDateWarningBullet1} />
        </li>
        <li>
          <FormattedMessage {...messages.noEndDateWarningBullet2} />
        </li>
      </ul>
    </>
  );

  return (
    <>
      {variant === 'panel' ? (
        <DesignSystemPicker
          label={label}
          aria-describedby={hasError ? errorId : undefined}
          isInvalid={hasError}
          selectedRange={selectedRange}
          disabledRanges={disabledRanges}
          defaultMonth={defaultMonth}
          startMonth={START_MONTH}
          onUpdateRange={handleUpdateRange}
          className={CLASS_NAME}
        />
      ) : (
        <DatePhasePicker
          selectedRange={selectedRange}
          disabledRanges={disabledRanges}
          defaultMonth={defaultMonth}
          startMonth={START_MONTH}
          onUpdateRange={handleUpdateRange}
          className={CLASS_NAME}
        />
      )}
      {isPanel ? (
        hasError && (
          <div id={errorId}>
            <FieldError>{startError}</FieldError>
            <FieldError>{endError}</FieldError>
            <FieldError>{validationErrors.phaseDateError}</FieldError>
          </div>
        )
      ) : (
        <>
          <Error apiErrors={errors?.start_at} />
          <Error apiErrors={errors?.end_at} />
          <Error text={validationErrors.phaseDateError} />
        </>
      )}

      {/* The redesign says it in the status line under the dates instead. */}
      {!isPanel && isSelectedRangeOpenEnded(selectedRange, disabledRanges) && (
        <Box mt="24px">
          <Warning>{openEndedWarning}</Warning>
        </Box>
      )}
    </>
  );
};

export default PhaseDatePicker;
