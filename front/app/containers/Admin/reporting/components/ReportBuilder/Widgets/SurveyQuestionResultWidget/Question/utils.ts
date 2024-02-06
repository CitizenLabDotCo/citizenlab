import moment from 'moment';
import messages from '../messages';
import { FormatMessage } from 'typings';
import { IPhaseData } from 'api/phases/types';

export const generateDateRange = (
  formatMessage: FormatMessage,
  startAt: string,
  endAt: string | null
) => {
  const startAtMoment = moment(startAt);

  if (!endAt) {
    return formatMessage(messages.untilNow, {
      date: startAtMoment.format('DD MMM YYYY'),
    });
  }

  const endAtMoment = moment(endAt);

  const sameYear = startAtMoment.year() === endAtMoment.year();
  const sameMonth = sameYear && startAtMoment.month() === endAtMoment.month();

  if (sameMonth) {
    return `${startAtMoment.format('DD')} - ${endAtMoment.format(
      'DD MMM YYYY'
    )}`;
  }

  if (sameYear) {
    return `${startAtMoment.format('DD MMM')} - ${endAtMoment.format(
      'DD MMM YYYY'
    )}`;
  }

  return `${startAtMoment.format('DD MMM YYYY')} - ${endAtMoment.format(
    'DD MMM YYYY'
  )}`;
};

export const getPhaseIndex = (phases: IPhaseData[], phaseId: string) => {
  return phases.findIndex((phase) => phase.id === phaseId);
};
