require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Phase insights' do
  before { admin_header_token }

  let(:phase) { create(:volunteering_phase, start_at: 20.days.ago, end_at: 3.days.ago) }

  let!(:permission1) { create(:permission, action: 'volunteering', permission_scope: phase) }

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

  let(:cause1) { create(:cause, phase: phase) }
  let(:cause2) { create(:cause, phase: phase) }

  let(:user1) { create(:user, custom_field_values: { gender: 'female', birthyear: 1980 }) }
  let!(:volunteering1) { create(:volunteer, cause: cause1, user: user1, created_at: 15.days.ago) }
  let!(:volunteering2) { create(:volunteer, cause: cause2, user: user1, created_at: 5.days.ago) }

  let(:user2) { create(:user, custom_field_values: { gender: 'male', birthyear: 1990 }) }
  let!(:volunteering3) { create(:volunteer, cause: cause1, user: user2, created_at: 10.days.ago) }

  let!(:session1) { create(:session, user_id: user1.id) }
  let!(:pageview1) { create(:pageview, session: session1, created_at: 15.days.ago, project_id: phase.project.id) } # during phase

  let!(:session2) { create(:session, user_id: user2.id) }
  let!(:pageview2) { create(:pageview, session: session2, created_at: 15.days.ago, project_id: phase.project.id) } # during phase
  let!(:pageview3) { create(:pageview, session: session2, created_at: 5.days.ago, project_id: phase.project.id) } # during phase & last 7 days, same session

  let(:user3) { create(:user) }
  let!(:session3) { create(:session, user_id: user3.id) }
  let!(:pageview5) { create(:pageview, session: session3, created_at: 2.days.ago, project_id: phase.project.id) } # after phase

  let(:id) { phase.id }

  get 'web_api/v1/phases/:id/insights' do
    example_request 'creates insights for volunteering phase' do
      assert_status 200

      expect(json_response_body[:data][:id]).to eq(phase.id.to_s)
      expect(json_response_body[:data][:type]).to eq('phase_insights')

      metrics = json_response_body.dig(:data, :attributes, :metrics)
      expect(metrics).to eq({
        visitors: 2,
        visitors_last_7_days: 1,
        participants: 2,
        participants_last_7_days: 1,
        engagement_rate: 1.0,
        volunteering: {
          volunteerings: 3,
          volunteerings_last_7_days: 1
        }
      })
    end

    include_examples 'phase insights demographics',
      gender_blank: 0,
      birthyear_blank: 0
  end
end
