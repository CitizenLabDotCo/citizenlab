export const spamReportData = {
  id: 'e728fcde-785b-4835-8e7e-8881206f2056',
  type: 'spam_report',
  attributes: {
    reason_code: 'other',
    other_reason: 'Gibberish',
    reported_at: '2023-03-02T09:12:53.162Z',
  },
};

export default jest.fn(() => {
  return { data: { data: spamReportData } };
});
