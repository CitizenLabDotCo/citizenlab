import moment from 'moment';

export const getCurrentPhaseId = (phases) => {
  if (!phases) return -1;
  const p = phases.filter((phase) => getPhaseType(phase.attributes.start_at, phase.attributes.end_at) === 'current')[0];

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

/* @params:
 * - Date iso: string
 * @returns
 * - date: string (day month) matching current locale
 */
export const parseDate = (dateIsoString, locale) => moment(dateIsoString).locale(locale).format('DD MMM');
