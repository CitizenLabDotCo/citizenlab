/**
 * Toggle for using dummy data for method-specific insights (e.g., Common Ground, Participants Timeline)
 * These endpoints are separate from the consolidated /phases/:id/insights endpoint
 * Set to false when the method-specific backend endpoints are ready
 */
export const USE_DUMMY_METHOD_SPECIFIC_DATA: boolean = true;

/**
 * Returns dummy participants data with visitors for phase insights
 * Matches ParticipantsResponse structure with timeseries and summary stats
 */
export const getDummyParticipants = () => {
  const timeseries = [
    { date_group: '2024-02-01', visitors: 1500, participants: 156 },
    { date_group: '2024-03-01', visitors: 1200, participants: 198 },
    { date_group: '2024-04-01', visitors: 800, participants: 145 },
    { date_group: '2024-05-01', visitors: 450, participants: 120 },
    { date_group: '2024-06-01', visitors: 320, participants: 98 },
    { date_group: '2024-07-01', visitors: 280, participants: 85 },
    { date_group: '2024-08-01', visitors: 350, participants: 112 },
    { date_group: '2024-09-01', visitors: 420, participants: 134 },
    { date_group: '2024-10-01', visitors: 480, participants: 156 },
    { date_group: '2024-11-01', visitors: 520, participants: 178 },
  ];

  const totalParticipants = timeseries.reduce(
    (sum, row) => sum + row.participants,
    0
  );
  const totalVisitors = timeseries.reduce((sum, row) => sum + row.visitors, 0);
  const participationRate = (totalParticipants / totalVisitors) * 100;

  return {
    data: {
      type: 'report_builder_data_units' as const,
      attributes: {
        participants_timeseries: timeseries,
        participants_whole_period: totalParticipants,
        participation_rate_whole_period: participationRate,
      },
    },
  };
};
