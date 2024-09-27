import moment, { Moment } from 'moment';

import { IPhaseData, IPhases, IUpdatedPhaseProperties } from 'api/phases/types';

export function getTimelineTab(
  phase: IPhaseData
):
  | 'setup'
  | 'ideas'
  | 'proposals'
  | 'native-survey'
  | 'polls'
  | 'survey-results'
  | 'volunteering' {
  const participationMethod = phase.attributes.participation_method;

  if (participationMethod === 'ideation' || participationMethod === 'voting') {
    return 'ideas';
  } else if (participationMethod === 'proposals') {
    return 'proposals';
  } else if (participationMethod === 'native_survey') {
    return 'native-survey';
  } else if (participationMethod === 'poll') {
    return 'polls';
  } else if (participationMethod === 'survey') {
    return 'survey-results';
  } else if (participationMethod === 'volunteering') {
    return 'volunteering';
  }

  return 'setup';
}

interface GetStartDateParams {
  phase?: IPhaseData;
  phases?: IPhases;
  formData: IUpdatedPhaseProperties;
}

export const getStartDate = ({
  phase,
  phases,
  formData,
}: GetStartDateParams) => {
  const phaseAttrs = phase
    ? { ...phase.attributes, ...formData }
    : { ...formData };
  let startDate: Moment | null = null;

  // If this is a new phase
  if (!phase) {
    const previousPhase = phases && phases.data[phases.data.length - 1];
    const previousPhaseEndDate =
      previousPhase && previousPhase.attributes.end_at
        ? moment(previousPhase.attributes.end_at)
        : null;
    const previousPhaseStartDate =
      previousPhase && previousPhase.attributes.start_at
        ? moment(previousPhase.attributes.start_at)
        : null;

    // And there's a previous phase (end date) and the phase hasn't been picked/changed
    if (previousPhaseEndDate && !phaseAttrs.start_at) {
      // Make startDate the previousEndDate + 1 day
      startDate = previousPhaseEndDate.add(1, 'day');
      // However, if there's been a manual change to this start date
    } else if (phaseAttrs.start_at) {
      // Take this date as the start date
      startDate = moment(phaseAttrs.start_at);
    } else if (!previousPhaseEndDate && previousPhaseStartDate) {
      // If there is no previous end date, then the previous phase is open ended
      // Set the default start date to the previous start date + 2 days to account for single day phases
      startDate = previousPhaseStartDate.add(2, 'day');
    } else if (!startDate) {
      // If there is no start date at this point, then set the default start date to today
      startDate = moment();
    }

    // else there is already a phase (which means we're in the edit form)
    // and we take it from the attrs
  } else {
    if (phaseAttrs.start_at) {
      startDate = moment(phaseAttrs.start_at);
    }
  }

  return startDate;
};
