// import { parseInvitationsChartData, parseInvitationsExcelData } from './parse';
// import { InvitationsChartData } from './typings';
// import { InvitationsLabels } from './utils';
// import { XlsxData } from 'components/admin/ReportExportMenu';
//
// describe('Analytics proposals response parsing', () => {
//   const responseData = [
//     [{ count: 4 }],
//     [{ count: 3 }],
//     [{ count: 2 }],
//     [{ count: 2 }],
//     [{ count: 0 }],
//   ];
//   const [total, totalPeriod, pending, accepted, acceptedPeriod] = responseData;
//
//   it('Transforms into correct chart data', () => {
//     const expectedChartData: InvitationsChartData = {
//       totalInvites: {
//         value: '4',
//         lastPeriod: '3',
//       },
//       pendingInvites: {
//         value: '2',
//       },
//       acceptedInvites: {
//         value: '2',
//         lastPeriod: '-',
//       },
//     };
//
//     const chartData = parseInvitationsChartData(
//       total,
//       totalPeriod,
//       pending,
//       accepted,
//       acceptedPeriod
//     );
//     expect(chartData).toEqual(expectedChartData);
//   });
//
//   it('Transforms into XLS data', () => {
//     const expectedXlsData: XlsxData = {
//       CardTitle: [
//         {
//           Total: '4',
//           Total_30days: '3',
//           Pending: '2',
//           Accepted: '2',
//           Accepted_30days: '-',
//         },
//       ],
//     };
//
//     const labels: InvitationsLabels = {
//       cardTitle: 'CardTitle',
//       fileName: 'cardtitle',
//       total: 'Total',
//       pending: 'Pending',
//       accepted: 'Accepted',
//       period: '30days',
//     };
//     const xlsData = parseInvitationsExcelData(
//       total,
//       totalPeriod,
//       pending,
//       accepted,
//       acceptedPeriod,
//       labels
//     );
//     expect(xlsData).toEqual(expectedXlsData);
//   });
// });
