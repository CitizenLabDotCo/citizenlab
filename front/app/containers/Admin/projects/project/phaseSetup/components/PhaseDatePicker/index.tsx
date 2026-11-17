import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import { IUpdatedPhaseProperties } from 'api/phases/types';

import { DateRange } from 'components/admin/DatePickers/_shared/typings';
import DatePhasePicker from 'components/admin/DatePickers/DatePhasePicker';
import DesignSystemPicker from 'components/admin/DatePickers/DatePhasePicker/DesignSystemPicker';
import { isSelectedRangeOpenEnded } from 'components/admin/DatePickers/DatePhasePicker/isSelectedRangeOpenEnded';
import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';
import Error from 'components/UI/Error';
import Warning from 'components/UI/Warning';

import Banner from 'design-system/Banner';
import { fieldStyles } from 'design-system/Field';

import { FormattedMessage } from 'utils/cl-intl';
import { convertToTimeZoneISO } from 'utils/dateUtils';

import messages from '../../messages';
import { ValidationErrors } from '../../typings';

import styles from './PhaseDatePicker.module.css';
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
        // The field-error slot lets the workspace scroll to these after a failed save.
        <>
          {startError && (
            <p slot="errorMessage" className={fieldStyles.error}>
              {startError}
            </p>
          )}
          {endError && (
            <p slot="errorMessage" className={fieldStyles.error}>
              {endError}
            </p>
          )}
          {validationErrors.phaseDateError && (
            <p slot="errorMessage" className={fieldStyles.error}>
              {validationErrors.phaseDateError}
            </p>
          )}
        </>
      ) : (
        <>
          <Error apiErrors={errors?.start_at} />
          <Error apiErrors={errors?.end_at} />
          <Error text={validationErrors.phaseDateError} />
        </>
      )}

      {isSelectedRangeOpenEnded(selectedRange, disabledRanges) &&
        (isPanel ? (
          <div className={styles.openEndedWarning}>
            <Banner tone="warning">{openEndedWarning}</Banner>
          </div>
        ) : (
          <Box mt="24px">
            <Warning>{openEndedWarning}</Warning>
          </Box>
        ))}
    </>
  );
};

export default PhaseDatePicker;
