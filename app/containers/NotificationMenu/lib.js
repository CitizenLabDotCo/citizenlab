import moment from 'moment';

export const parseDate = (dateIsoString, locale) => moment().locale(locale).fromNow();
