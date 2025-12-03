require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Phase insights' do
  before { admin_header_token }

  let(:native_survey_phase) do
    create(
      :native_survey_phase,
      start_at: 20.days.ago,
      end_at: 3.days.ago,
      with_permissions: true
    )
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

  (1..5).each do |i|
    let!(:"ns_user#{i}") { create(:user) }
  end

  let!(:idea1) { create(:idea, phases: [native_survey_phase], created_at: 25.days.ago, author: ns_user1, creation_phase_id: native_survey_phase.id) } # created & published before ideation phase (not counted)

  # created and submitted during native survey phase
  let!(:idea2) do
    create(
      :idea,
      phases: [native_survey_phase],
      created_at: 15.days.ago,
      submitted_at: 15.days.ago,
      author: ns_user2,
      creation_phase_id: native_survey_phase.id,
      custom_field_values: { gender: 'female', birthyear: 1980 }
    )
  end

  let!(:idea3) { create(:idea, phases: [native_survey_phase], created_at: 5.days.ago, submitted_at: 5.days.ago, author: ns_user2, creation_phase_id: native_survey_phase.id) } # created during native survey phase, and in last 7 days
  let!(:idea4) { create(:idea, phases: [native_survey_phase], created_at: 2.days.ago, submitted_at: 2.days.ago, author: ns_user3, creation_phase_id: native_survey_phase.id) } # created & published after native survey phase (not counted)

  # created during native survey phase, not submitted
  let!(:idea5) do
    create(
      :idea,
      phases: [native_survey_phase],
      created_at: 15.days.ago,
      publication_status: 'draft', # Avoid automatic setting of submitted_at
      submitted_at: nil,
      author: ns_user4,
      creation_phase_id: native_survey_phase.id,
      custom_field_values: { gender: 'male', birthyear: 1990 }
    ) # created during native survey phase, but not submitted (considered incomplete, affecting completion rate)
  end

  let!(:session1) { create(:session, user_id: ns_user1.id) }
  let!(:pageview1) { create(:pageview, session: session1, created_at: 25.days.ago, project_id: native_survey_phase.project.id) } # before native survey phase

  let!(:session2) { create(:session, user_id: ns_user2.id) }
  let!(:pageview2) { create(:pageview, session: session2, created_at: 15.days.ago, project_id: native_survey_phase.project.id) } # in native survey phase
  let!(:pageview3) { create(:pageview, session: session2, created_at: 5.days.ago, project_id: native_survey_phase.project.id) } # in native survey phase & last 7 days, same session

  let!(:session3) { create(:session, user_id: ns_user3.id) }
  let!(:pageview5) { create(:pageview, session: session3, created_at: 2.days.ago, project_id: native_survey_phase.project.id) } # after native survey phase

  let!(:session4) { create(:session, user_id: ns_user4.id) }
  let!(:pageview6) { create(:pageview, session: session4, created_at: 15.days.ago, project_id: native_survey_phase.project.id) }

  let!(:session5) { create(:session, user_id: ns_user5.id) }
  let!(:pageview7) { create(:pageview, session: session5, created_at: 15.days.ago, project_id: native_survey_phase.project.id) } # in native survey phase, did not participate

  let(:id) { native_survey_phase.id }

  get 'web_api/v1/phases/:id/insights' do
    example_request 'creates insights for native survey phase' do
      assert_status 200

      expect(json_response_body[:data][:id]).to eq(native_survey_phase.id.to_s)
      expect(json_response_body[:data][:type]).to eq('phase_insights')

      metrics = json_response_body.dig(:data, :attributes, :metrics)
      expect(metrics).to eq({
        visitors: 3,
        visitors_last_7_days: 1,
        participants: 2,
        participants_last_7_days: 1,
        engagement_rate: 0.667,
        native_survey: {
          submitted_surveys: 2,
          submitted_surveys_last_7_days: 1,
          completion_rate: 0.667
        }
      })
    end

    include_examples 'phase insights demographics',
      gender_blank: 0,
      birthyear_blank: 0
  end
end
