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
  let!(:disabled) { create(:custom_field_sentiment_linear_scale, resource: form, question_category: 'quality_of_life', enabled: false) }

  before do
    settings = AppConfiguration.instance.settings
    settings['core']['timezone'] = 'America/New_York'
    AppConfiguration.instance.update_column(:settings, settings)
    create(:idea_status_proposed)
    [
      [Time.utc(2026, 2, 10, 12), create(:user), { quality => 2, service => 3, uncategorised => 4, disabled => 1 }],
      [Time.utc(2026, 3, 5, 12), create(:admin), { quality => 5, service => 5 }],
      [Time.utc(2026, 3, 20, 12), nil, { quality => 1, uncategorised => 2 }],
      # 31 March, 22:00 in New York: the first quarter there, the second in UTC.
      [Time.utc(2026, 4, 1, 2), create(:user), { quality => 5, service => 4 }],
      [Time.utc(2026, 5, 2, 12), create(:user), { quality => 4, service => 1 }],
      [Time.utc(2026, 5, 20, 12), create(:project_folder_moderator), { quality => 1 }],
      [Time.utc(2026, 6, 11, 12), create(:project_moderator), { service => 2, uncategorised => 5 }],
      [Time.utc(2026, 6, 15, 12), create(:space_moderator), { service => 5 }],
      [Time.utc(2026, 6, 20, 12), create(:user), { quality => 1, service => 1 }, { publication_status: 'submitted' }]
    ].each do |created_at, author, answers, attributes = {}|
      response = create(:native_survey_response, project: phase.project, creation_phase: phase, author: author, created_at: created_at, **attributes)
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
      # On a request, switching tenant sets Time.zone to the platform timezone.
      dashboard = Time.use_zone(AppConfiguration.timezone) do
        Surveys::AverageGenerator.new(
          phase, input_type: 'sentiment_linear_scale', exclude_admins_and_moderators: exclude_staff
        ).summary_averages_by_quarter
      end

      view_overall_averages = pooled(rows) { |row| "#{row.year}-#{row.quarter}" }
      dashboard_overall_averages = dashboard[:overall][:averages]
      expect(view_overall_averages).to eq dashboard_overall_averages

      dashboard[:categories][:averages].each do |category, dashboard_category_averages|
        category_rows = rows.select { |row| row.question_category == category }
        view_category_averages = pooled(category_rows) { |row| "#{row.year}-#{row.quarter}" }

        # The dashboard shows 0.0 for a category without answers in a
        # quarter; the view has no rows for it.
        expect(dashboard_category_averages.except(*view_category_averages.keys).values).to all(eq 0.0)
        expect(view_category_averages).to eq dashboard_category_averages.slice(*view_category_averages.keys)
      end
    end
  end
end
