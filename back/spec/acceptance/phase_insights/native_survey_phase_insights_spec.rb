require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Phase insights' do
  # Helper to prefix demographics custom field keys as stored in ideas
  def prefixed_custom_field_values(values)
    prefix = UserFieldsInFormService.prefix
    values.transform_keys { |k| "#{prefix}#{k}" }
  end

  before do
    admin_header_token
    # This reference time means we can expect exact dates in the chart data
    travel_to(Time.zone.parse('2025-12-02 12:00:00'))
  end

  let!(:custom_field_gender) { create(:custom_field, resource_type: 'User', key: 'gender', input_type: 'select', title_multiloc: { en: 'Gender' }) }
  let!(:custom_field_option_male) { create(:custom_field_option, custom_field: custom_field_gender, key: 'male', title_multiloc: { en: 'Male' }) }
  let!(:custom_field_option_female) { create(:custom_field_option, custom_field: custom_field_gender, key: 'female', title_multiloc: { en: 'Female' }) }
  let!(:custom_field_option_other) { create(:custom_field_option, custom_field: custom_field_gender, key: 'unspecified', title_multiloc: { en: 'Unspecified' }) }

  let!(:categorical_distribution) do
    create(
      :categorical_distribution,
      custom_field: custom_field_gender,
      population_counts: [480, 510, 10] # Male, Female, Unspecified counts
    )
  end

  let!(:custom_field_birthyear) { create(:custom_field, resource_type: 'User', key: 'birthyear', input_type: 'number', title_multiloc: { en: 'Birthyear' }) }

  let!(:binned_distribution) do
    create(
      :binned_distribution,
      custom_field: custom_field_birthyear,
      bins: [18, 25, 35, 45, 55, 65, nil], # Age ranges: <18, 18-25, 25-35, 35-45, 45-65, >65
      counts: [50, 200, 400, 300, 50, 700] # Population in each bin
    )
  end

  let(:native_survey_phase) do
    create(
      :native_survey_phase,
      start_at: 20.days.ago,
      end_at: 3.days.ago,
      with_permissions: true
    ).tap do |phase|
      # Users
      ns_user1 = create(:user)
      ns_user2 = create(:user)
      ns_user3 = create(:user)
      ns_user4 = create(:user)
      ns_user5 = create(:user)

      # Ideas
      create(:idea, phases: [phase], created_at: 25.days.ago, submitted_at: 25.days.ago, author: ns_user1, creation_phase_id: phase.id) # created & published before phase (still counted)

      # created and submitted during native survey phase (in week before last)
      create(
        :idea,
        phases: [phase],
        created_at: 12.days.ago,
        submitted_at: 12.days.ago,
        author: ns_user2,
        creation_phase_id: phase.id,
        custom_field_values: prefixed_custom_field_values(gender: 'female', birthyear: 1980)
      )

      create(:idea, phases: [phase], created_at: 5.days.ago, submitted_at: 5.days.ago, author: ns_user2, creation_phase_id: phase.id) # created during phase, and in last 7 days
      create(:idea, phases: [phase], created_at: 2.days.ago, submitted_at: 2.days.ago, author: ns_user3, creation_phase_id: phase.id, custom_field_values: prefixed_custom_field_values(gender: 'male', birthyear: 1990)) # created & published after phase (still counted), and in last 7 days
      # created during native survey phase (in week before last), not submitted (considered incomplete, affecting completion rate)
      create(
        :idea,
        phases: [phase],
        created_at: 12.days.ago,
        publication_status: 'draft', # Avoid automatic setting of submitted_at
        submitted_at: nil,
        author: ns_user4,
        creation_phase_id: phase.id,
        custom_field_values: prefixed_custom_field_values(gender: 'male', birthyear: 1990)
      )

      # Pageviews and sessions
      session1 = create(:session, user_id: ns_user1.id)
      create(:pageview, session: session1, created_at: 25.days.ago, project_id: phase.project.id) # before phase

      session2 = create(:session, user_id: ns_user2.id)
      create(:pageview, session: session2, created_at: 15.days.ago, project_id: phase.project.id) # during phase
      create(:pageview, session: session2, created_at: 5.days.ago, project_id: phase.project.id) # during phase & last 7 days, same session

      session3 = create(:session, user_id: ns_user3.id)
      create(:pageview, session: session3, created_at: 2.days.ago, project_id: phase.project.id) # after phase

      session4 = create(:session, user_id: ns_user4.id)
      create(:pageview, session: session4, created_at: 12.days.ago, project_id: phase.project.id) # during phase (in week before last)

      session5 = create(:session, user_id: ns_user5.id)
      create(:pageview, session: session5, created_at: 12.days.ago, project_id: phase.project.id) # during phase (in week before last), did not participate
    end
  end

  let(:id) { native_survey_phase.id }

  get 'web_api/v1/phases/:id/insights' do
    example_request 'returns insights data for native survey phase' do
      assert_status 200

      expect(json_response_body[:data][:id]).to eq(native_survey_phase.id.to_s)
      expect(json_response_body[:data][:type]).to eq('phase_insights')

      metrics = json_response_body.dig(:data, :attributes, :metrics)
      expect(metrics).to eq({
        visitors: 3,
        visitors_7_day_percent_change: -50.0, # from 2 (in week before last) to 1 unique visitor (in last 7 days) = -50% decrease
        participants: 3,
        participants_7_day_percent_change: 100.0, # from 1 (in week before last) to 2 unique participants (in last 7 days) = 100% increase
        participation_rate_as_percent: 100.0,
        participation_rate_7_day_percent_change: 300.0, # participation_rate_last_7_days: 1.0, participation_rate_previous_7_days: 1.0 = 0% change
        native_survey: {
          surveys_submitted: 4,
          surveys_submitted_7_day_percent_change: 100.0, # from 1 (in week before last) to 2 (in last 7 days) = +100% change
          completion_rate_as_percent: 80.0, # 4 submitted surveys out of 5 ideas
          completion_rate_7_day_percent_change: 100.0 # completion_rate_last_7_days: 1.0, completion_rate_previous_7_days: 0.5 = (((1.0 - 0.5).to_f / 0.5) * 100.0).round(1) = +100% change
        }
      })

      participants_and_visitors_chart_data = json_response_body.dig(:data, :attributes, :participants_and_visitors_chart_data)
      expect(participants_and_visitors_chart_data).to eq({
        resolution: 'day',
        timeseries: [
          { participants: 1, visitors: 0, date_group: '2025-11-07' },
          { participants: 0, visitors: 1, date_group: '2025-11-17' },
          { participants: 1, visitors: 2, date_group: '2025-11-20' },
          { participants: 1, visitors: 1, date_group: '2025-11-27' },
          { participants: 1, visitors: 0, date_group: '2025-11-30' }
        ]
      })
    end

    include_examples 'phase insights demographics',
      gender_blank: 1,
      birthyear_blank: 1
  end
end
