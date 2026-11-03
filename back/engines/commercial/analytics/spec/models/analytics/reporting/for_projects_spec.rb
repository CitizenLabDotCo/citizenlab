# frozen_string_literal: true

require 'rails_helper'

# The project rules are what keep a moderator's reporting queries to their own
# projects, so each one is checked against real rows: two projects with their own
# people and a row in every view, and each rule must keep the rows of one project
# and none of the other's.
RSpec.describe 'Reporting view project rules' do # rubocop:disable RSpec/DescribeClass
  # The community monitor and the census data have their own examples below.
  special = [Analytics::Reporting::CommunityMonitorScore, Analytics::Reporting::ReferenceDistribution]
  views = McpServer::Tools::GetReportingSqlSchema::REPORTING_TABLES.reject(&:admin_only?) - special

  let!(:mine) { create_reporting_rows }
  let!(:other) { create_reporting_rows }

  # Whole rows, as some views have no id.
  def rows(view, projects) = view.for_projects(projects.map(&:id)).map(&:attributes)

  views.each do |view|
    it "keeps the rows of #{view.table_name} for the given projects only" do
      my_rows = rows(view, [mine])
      other_rows = rows(view, [other])

      expect(my_rows).not_to be_empty
      expect(other_rows).not_to be_empty
      expect(my_rows & other_rows).to be_empty
      expect(rows(view, [mine, other])).to match_array(my_rows + other_rows)
    end
  end

  it 'keeps the community monitor scores for the community monitor project only' do
    phase = create(:community_monitor_survey_phase)
    form = create(:custom_form, participation_context: phase)
    question = create(:custom_field_sentiment_linear_scale, resource: form, question_category: 'quality_of_life')
    response = create(:native_survey_response, project: phase.project, creation_phase: phase)
    response.custom_field_answers.create!(key: question.key, value: 4)
    scores = Analytics::Reporting::CommunityMonitorScore

    expect(scores.for_projects([phase.project_id])).not_to be_empty
    expect(scores.for_projects([mine.id])).to be_empty
  end

  it 'keeps every census row, for any projects' do
    census = Analytics::Reporting::ReferenceDistribution

    expect(census.for_projects([]).to_sql).to eq census.all.to_sql
  end
end
