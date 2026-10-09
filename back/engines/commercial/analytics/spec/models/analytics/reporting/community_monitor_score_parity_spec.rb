# frozen_string_literal: true

require 'rails_helper'

# The scores must agree with Surveys::AverageGenerator, which powers the
# community monitor dashboard, with and without the setting that leaves out
# admins' and moderators' answers.
RSpec.describe 'reporting_community_monitor_scores parity with Surveys::AverageGenerator' do # rubocop:disable RSpec/DescribeClass
  let(:phase) { create(:community_monitor_survey_phase) }
  let(:form) { create(:custom_form, participation_context: phase) }
  let!(:quality) { create(:custom_field_sentiment_linear_scale, resource: form, question_category: 'quality_of_life') }
  let!(:service) { create(:custom_field_sentiment_linear_scale, resource: form, question_category: 'service_delivery') }
  let!(:uncategorised) { create(:custom_field_sentiment_linear_scale, resource: form) }

  before do
    create(:idea_status_proposed)
    [
      ['2026-02-10', create(:user), { quality => 2, service => 3, uncategorised => 4 }],
      ['2026-03-05', create(:admin), { quality => 5, service => 5 }],
      ['2026-03-20', nil, { quality => 1, uncategorised => 2 }],
      ['2026-05-02', create(:user), { quality => 4, service => 1 }],
      ['2026-06-11', create(:project_moderator), { service => 2, uncategorised => 5 }]
    ].each do |date, author, answers|
      response = create(:native_survey_response, project: phase.project, creation_phase: phase, author: author, created_at: Time.zone.parse("#{date} 12:00"))
      answers.each { |field, value| response.custom_field_answers.create!(key: field.key, value: value) }
    end
  end

  # Pools the view's rows the way its description tells the LLM to.
  def pooled(rows, &)
    rows.group_by(&).transform_values do |group|
      (group.sum(&:answer_sum) / group.sum(&:answer_count)).round(1).to_f
    end
  end

  # exclude_staff mirrors the setting that leaves out admins' and moderators' answers.
  where(:exclude_staff) do
    [[false], [true]]
  end

  with_them do
    it 'gives the same overall and per-category averages as the dashboard' do
      rows = Analytics::Reporting::CommunityMonitorScore.where(phase_id: phase.id).to_a
      rows = rows.reject(&:staff) if exclude_staff
      product = Surveys::AverageGenerator.new(
        phase, input_type: 'sentiment_linear_scale', exclude_admins_and_moderators: exclude_staff
      ).summary_averages_by_quarter

      overall = pooled(rows) { |row| "#{row.year}-#{row.quarter}" }
      expect(overall).to eq product[:overall][:averages]

      product[:categories][:averages].each do |category, by_quarter|
        category_rows = rows.select { |row| row.question_category == category }
        scores = pooled(category_rows) { |row| "#{row.year}-#{row.quarter}" }

        # The dashboard shows 0.0 for a category without answers in a
        # quarter; the view has no rows for it.
        expect(by_quarter.except(*scores.keys).values).to all(eq 0.0)
        expect(scores).to eq by_quarter.slice(*scores.keys)
      end
    end
  end
end
