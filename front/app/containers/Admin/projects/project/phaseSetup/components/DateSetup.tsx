import React, { useState, useEffect } from 'react';

import { Text, CheckboxWithLabel } from '@citizenlab/cl2-component-library';
import moment, { Moment } from 'moment';
import { useParams } from 'react-router-dom';
import { CLErrors } from 'typings';

import { IUpdatedPhaseProperties } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';

import DateRangePicker from 'components/admin/DateRangePicker';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';
import { SubmitStateType } from '../typings';
import { getStartDate, getExcludedDates, getMaxEndDate } from '../utils';

interface Props {
  formData: IUpdatedPhaseProperties;
  errors: CLErrors | null;
  setSubmitState: React.Dispatch<React.SetStateAction<SubmitStateType>>;
  setFormData: React.Dispatch<React.SetStateAction<IUpdatedPhaseProperties>>;
}

const DateSetup = ({
  formData,
  errors,
  setSubmitState,
  setFormData,
}: Props) => {
  const { formatMessage } = useIntl();
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };
  const { data: phase } = usePhase(phaseId);
  const { data: phases } = usePhases(projectId);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [disableNoEndDate, setDisableNoEndDate] = useState(false);

  useEffect(() => {
    setHasEndDate(!!phase?.data.attributes.end_at);
  }, [phase?.data.attributes.end_at]);

  const startDate = getStartDate({
    phase: phase?.data,
    phases,
    formData,
  });

  const endAt = formData.end_at ?? phase?.data.attributes.end_at;
  const endDate = endAt ? moment(endAt) : null;

  const phasesWithOutCurrentPhase = phases
    ? phases.data.filter((iteratedPhase) => iteratedPhase.id !== phase?.data.id)
    : [];
  const excludeDates = getExcludedDates(phasesWithOutCurrentPhase);
  const maxEndDate = getMaxEndDate(phasesWithOutCurrentPhase, startDate, phase);

  const handleDateUpdate = ({
    startDate,
    endDate,
  }: {
    startDate: Moment | null;
    endDate: Moment | null;
  }) => {
    setSubmitState('enabled');
    setFormData({
      ...formData,
      start_at: startDate ? startDate.locale('en').format('YYYY-MM-DD') : '',
      end_at: endDate ? endDate.locale('en').format('YYYY-MM-DD') : '',
    });
    setHasEndDate(!!endDate);

    if (startDate && phases) {
      const hasPhaseWithLaterStartDate = phases.data.some((iteratedPhase) => {
        const iteratedPhaseStartDate = moment(
          iteratedPhase.attributes.start_at
        );
        return iteratedPhaseStartDate.isAfter(startDate);
      });

      setDisableNoEndDate(hasPhaseWithLaterStartDate);

      if (hasPhaseWithLaterStartDate) {
        setHasEndDate(true);
      }
    }
  };

  const setNoEndDate = () => {
    if (endDate) {
      setSubmitState('enabled');
      setFormData({
        ...formData,
        end_at: '',
      });
    }
    setHasEndDate((prevValue) => !prevValue);
  };

  return (
    <SectionField>
      <SubSectionTitle>
        <FormattedMessage {...messages.datesLabel} />
      </SubSectionTitle>
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onDatesChange={handleDateUpdate}
        startDatePlaceholderText={formatMessage(messages.startDate)}
        endDatePlaceholderText={formatMessage(messages.endDate)}
        excludeDates={excludeDates}
        maxDate={maxEndDate}
      />
      <Error apiErrors={errors && errors.start_at} />
      <Error apiErrors={errors && errors.end_at} />
      <CheckboxWithLabel
        checked={!hasEndDate}
        onChange={setNoEndDate}
        disabled={disableNoEndDate}
        size="21px"
        label={
          <Text>
            <FormattedMessage {...messages.noEndDateCheckbox} />
          </Text>
        }
      />
      {!hasEndDate && (
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
      )}
    </SectionField>
  );
};

export default DateSetup;
