import moment from 'moment';

export const TEST_GENDER_DATA = [
  {
    name: 'Female',
    actualPercentage: 42,
    referencePercentage: 47,
    actualNumber: 420,
    referenceNumber: 4700,
  },
  {
    name: 'Male',
    actualPercentage: 49,
    referencePercentage: 45,
    actualNumber: 490,
    referenceNumber: 4500,
  },
  {
    name: 'Non-binary',
    actualPercentage: 1.2,
    referencePercentage: 1.4,
    actualNumber: 12,
    referenceNumber: 140,
  },
  {
    name: 'Rather not say',
    actualPercentage: 7.8,
    referencePercentage: 6.6,
    actualNumber: 78,
    referenceNumber: 660,
  },
];

export const GENDER_INCLUDED_USERS_PERCENTAGE = '100%';

export const GENDER_DEMO_DATA_DATE = moment('2021-09-02');
