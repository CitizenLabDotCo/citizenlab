import moment from 'moment';

export const getCurrentPhaseId = (items) => {
  if (!items) return -1;
  const p = items.filter((item) => {
    return getPhaseType(item.getIn(['attributes', 'start_at']), item.getIn(['attributes', 'end_at'])) === 'current';
  })[0];

  return p && p.id;
};

/* @params:
 * - Date iso: string
 * - Date iso: string
 * @returns
 * - phase type: string (past|current|coming)
 */
export const getPhaseType = (startingDate, endingDate) => {
  const nowM = moment();
  const startingDateMDiff = moment(startingDate) - nowM;
  const endingDateMDiff = moment(endingDate) - nowM;

  if (endingDateMDiff < 0) return 'past';
  else if (startingDateMDiff > 0) return 'coming';
  return 'current';
};

export const getEventType = getPhaseType;

export const getComingEventId = (items) => {
  if (!items) return -1;
  const p = items.filter((item) => getEventType(item.getIn(['attributes', 'start_at']), item.getIn(['attributes', 'end_at'])) === 'current' || getEventType(item.getIn(['attributes', 'start_at']), item.getIn(['attributes', 'end_at'])) === 'coming')[0];

  return p && p.id;
};


/* @params:
 * - Date iso: string
 * @returns
 * - date: string (day month) matching current locale
 */
export const parseDate = (dateIsoString, locale) => moment(dateIsoString).locale(locale).format('DD MMM');

/* @params:
 * - Date iso: string
 * @returns
 * - intl & human-readable Date: object
 */
export const getDateObject = (dateIsoString, locale) => {
  const momentDate = moment(dateIsoString).locale(locale);
  return {
    day: momentDate.format('DD'),
    month: momentDate.format('MMM'),
    year: momentDate.format('YYYY'),
  };
};

export const parseTime = (dateIsoString) => moment(dateIsoString).format('HH:mm');
