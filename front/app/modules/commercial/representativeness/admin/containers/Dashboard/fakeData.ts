import moment from 'moment';

const TEST_GENDER_DATA = [
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

const TEST_DOMICILE_DATA = [
  {
    name: 'Mitte',
    actualPercentage: 4.2,
    referencePercentage: 2.2,
    actualNumber: 126,
    referenceNumber: 79000,
  },
  {
    name: 'Moabit',
    actualPercentage: 4.5,
    referencePercentage: 1.9,
    actualNumber: 135,
    referenceNumber: 69000,
  },
  {
    name: 'Hansaviertel',
    actualPercentage: 0.1,
    referencePercentage: 0.1,
    actualNumber: 3,
    referenceNumber: 5000,
  },
  {
    name: 'Tiergarten',
    actualPercentage: 0.1,
    referencePercentage: 0.3,
    actualNumber: 3,
    referenceNumber: 12000,
  },
  {
    name: 'Wedding',
    actualPercentage: 0.5,
    referencePercentage: 2.1,
    actualNumber: 15,
    referenceNumber: 76000,
  },
  {
    name: 'Gesundbrunnen',
    actualPercentage: 2.1,
    referencePercentage: 2.3,
    actualNumber: 63,
    referenceNumber: 82000,
  },
  {
    name: 'Friedrichshain',
    actualPercentage: 2.5,
    referencePercentage: 3.2,
    actualNumber: 75,
    referenceNumber: 114000,
  },
  {
    name: 'Kreuzberg',
    actualPercentage: 6.0,
    referencePercentage: 4.1,
    actualNumber: 180,
    referenceNumber: 147000,
  },
  {
    name: 'Prenzlauer Berg',
    actualPercentage: 2.4,
    referencePercentage: 1.3,
    actualNumber: 72,
    referenceNumber: 45000,
  },
  {
    name: 'Weißensee',
    actualPercentage: 2.4,
    referencePercentage: 1.3,
    actualNumber: 72,
    referenceNumber: 45000,
  },
  {
    name: 'Blankenburg',
    actualPercentage: 0.1,
    referencePercentage: 0.2,
    actualNumber: 3,
    referenceNumber: 6000,
  },
  {
    name: 'Heinersdorf',
    actualPercentage: 0.1,
    referencePercentage: 0.2,
    actualNumber: 3,
    referenceNumber: 6000,
  },
  {
    name: 'Schöneberg',
    actualPercentage: 3.2,
    referencePercentage: 3.5,
    actualNumber: 50,
    referenceNumber: 55000,
  },
];

const TEST_DOMICILE_DATA_LONG = Array(26)
  .fill(0)
  .map((_, i) => ({
    name: `Place ${i + 1}`,
    actualPercentage: (i + 1) / 100,
    referencePercentage: (i + 1) / 100,
    actualNumber: i + 1,
    referenceNumber: i + 1,
  }));

const DATA_PER_CODE = {
  gender: {
    data: TEST_GENDER_DATA,
    representativenessScore: 81,
    includedUsersPercentage: 100,
    demographicDataDate: moment('2021-09-02'),
  },
  domicile: {
    data: TEST_DOMICILE_DATA,
    representativenessScore: 70,
    includedUsersPercentage: 80,
    demographicDataDate: moment('2021-09-02'),
  },
  domicileLong: {
    data: TEST_DOMICILE_DATA_LONG,
    representativenessScore: 70,
    includedUsersPercentage: 80,
    demographicDataDate: moment('2021-09-02'),
  },
};

export default DATA_PER_CODE;
