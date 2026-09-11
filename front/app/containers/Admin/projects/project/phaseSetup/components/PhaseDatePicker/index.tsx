import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import { IUpdatedPhaseProperties } from 'api/phases/types';

import DatePhasePicker from 'components/admin/DatePickers/DatePhasePicker';
import { isSelectedRangeOpenEnded } from 'components/admin/DatePickers/DatePhasePicker/isSelectedRangeOpenEnded';
import Error from 'components/UI/Error';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';
import { convertToTimeZoneISO } from 'utils/dateUtils';

import messages from '../../messages';
import { ValidationErrors } from '../../typings';

import { PhaseDateRanges } from './usePhaseDateRanges';

export type PhaseDates = Pick<IUpdatedPhaseProperties, 'start_at' | 'end_at'>;

interface Props {
  ranges: PhaseDateRanges;
  errors: CLErrors | null;
  validationErrors: ValidationErrors;
  onChange: (dates: PhaseDates) => void;
}

const PhaseDatePicker = ({
  ranges,
  errors,
  validationErrors,
  onChange,
}: Props) => {
  const { selectedRange, disabledRanges, defaultMonth, timeZone } = ranges;

  return (
    <>
      <DatePhasePicker
        selectedRange={selectedRange}
        disabledRanges={disabledRanges}
        defaultMonth={defaultMonth}
        startMonth={new Date(1900, 1, 1)}
        onUpdateRange={({ from, to }) =>
          onChange({
            start_at: convertToTimeZoneISO(from, timeZone),
            end_at: to ? convertToTimeZoneISO(to, timeZone) : null,
          })
        }
        className="intercom-admin-phase-date-setup"
      />
      <Error apiErrors={errors?.start_at} />
      <Error apiErrors={errors?.end_at} />
      <Error text={validationErrors.phaseDateError} />

      {isSelectedRangeOpenEnded(selectedRange, disabledRanges) && (
        <Box mt="24px">
          <Warning>
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
          </Warning>
        </Box>
      )}
    </>
  );
};

export default PhaseDatePicker;
