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

// const generateData = (n: number) => {
//   const data: any = [];

//   for (let i = 0; i < n; i++) {
//     data.push({
//       name: `label ${i}`,
//       actualPercentage: i,
//       referencePercentage: i,
//       actualNumber: i,
//       referenceNumber: i,
//     });
//   }

//   return data;
// };

// const TEST_GENDER_DATA = generateData(50);

const DATA_PER_CODE = {
  gender: {
    data: TEST_GENDER_DATA,
    representativenessScore: 81,
    includedUsersPercentage: 100,
    demographicDataDate: moment('2021-09-02'),
  },
};

export default DATA_PER_CODE;
