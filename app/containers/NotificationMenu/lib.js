import moment from 'moment';

export const parseDate = (dateIsoString, locale) => moment(dateIsoString).locale(locale).fromNow();
