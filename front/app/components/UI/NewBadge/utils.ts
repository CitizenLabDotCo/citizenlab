import moment from 'moment';

export const isExpired = (expiryDate: string) => {
  const now = moment();
  const expiry = moment(expiryDate);
  return expiry.isAfter(now);
};
