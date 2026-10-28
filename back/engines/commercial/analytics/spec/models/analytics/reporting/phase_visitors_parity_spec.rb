# frozen_string_literal: true

require 'rails_helper'

# The reporting_phases visitor counts must give the visitors the phase insights
# show (Insights::VisitsService, as BasePhaseInsightsService builds it), with
# and without platform staff.
RSpec.describe 'reporting_phases visitors parity with the phase insights' do # rubocop:disable RSpec/DescribeClass
  let(:phase) { create(:phase, start_at: 10.days.ago.beginning_of_day, end_at: 3.days.ago.beginning_of_day) }
  let(:project) { phase.project }

  before do
    AppConfiguration.instance.update_column(:platform_start_at, 1.year.ago)
    [
      ['visitor_1', nil, project, 5.days.ago],
      ['visitor_1', nil, project, 4.days.ago], # same visitor, second session
      ['visitor_2', nil, project, phase.start_at], # first moment of the phase
      ['visitor_3', nil, project, phase.end_at], # first moment after the phase
      ['visitor_4', nil, project, 11.days.ago],
      ['visitor_5', nil, create(:project), 5.days.ago],
      ['visitor_6', 'admin', project, 5.days.ago],
      ['visitor_7', 'project_moderator', project, 5.days.ago]
    ].each do |hash, highest_role, pageview_project, pageview_created_at|
      create(
        :session, :with_pageview,
        monthly_user_hash: hash, highest_role: highest_role,
        project: pageview_project, pageview_created_at: pageview_created_at
      )
    end
  end

  where(:exclude_staff) do
    [[false], [true]]
  end

  with_them do
    it 'gives the same visitors as the phase insights' do
      row = Analytics::Reporting::Phase.find(phase.id)
      view_visitors = exclude_staff ? row.non_staff_visitors_count : row.visitors_count
      insights_visitors = Insights::VisitsService.new(
        phase.project_id, start_at: phase.start_at, end_at: phase.end_at, exclude_admins_and_moderators: exclude_staff
      ).total_visits[:visitors]

      expect(view_visitors).to eq insights_visitors
      expect(insights_visitors).to eq(exclude_staff ? 2 : 4)
    end
  end
end
