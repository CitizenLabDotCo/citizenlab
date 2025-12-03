require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Phase insights' do
  before { admin_header_token }

  let(:common_ground_phase) do
    create(
      :phase,
      participation_method: 'common_ground',
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

  let!(:user1) { create(:user) }
  let!(:user2) { create(:user, custom_field_values: { gender: 'female', birthyear: 1980 }) }
  let!(:user3) { create(:user) }
  let!(:user4) { create(:user, custom_field_values: { gender: 'male', birthyear: 1990 }) }

  let!(:idea1) { create(:idea, phases: [common_ground_phase], author: user1, created_at: 25.days.ago, published_at: 25.days.ago, creation_phase_id: common_ground_phase.id) } # published before ideation phase (not counted)
  let!(:idea2) { create(:idea, phases: [common_ground_phase], author: user2, created_at: 15.days.ago, published_at: 15.days.ago, creation_phase_id: common_ground_phase.id) } # published during ideation phase
  let!(:idea3) { create(:idea, phases: [common_ground_phase], author: user2, created_at: 5.days.ago, published_at: 5.days.ago, creation_phase_id: common_ground_phase.id) } # published during ideation phase, and in last 7 days
  let!(:idea4) { create(:idea, phases: [common_ground_phase], author: user3, created_at: 2.days.ago, published_at: 2.days.ago, creation_phase_id: common_ground_phase.id) } # published after ideation phase (not counted)

  let!(:reaction1) { create(:reaction, reactable: idea1, user: user4, created_at: 5.days.ago) } # in ideation phase, and in last 7 days

  let!(:session1) { create(:session, user_id: user1.id) }
  let!(:pageview1) { create(:pageview, session: session1, created_at: 25.days.ago, project_id: common_ground_phase.project.id) } # before ideation phase

  let!(:session2) { create(:session, user_id: user2.id) }
  let!(:pageview2) { create(:pageview, session: session2, created_at: 15.days.ago, project_id: common_ground_phase.project.id) } # in ideation phase
  let!(:pageview3) { create(:pageview, session: session2, created_at: 5.days.ago, project_id: common_ground_phase.project.id) } # in ideation phase & last 7 days, same session

  let!(:session3) { create(:session, user_id: user3.id) }
  let!(:pageview5) { create(:pageview, session: session3, created_at: 2.days.ago, project_id: common_ground_phase.project.id) } # after ideation phase

  let!(:session4) { create(:session) }
  let!(:pageview6) { create(:pageview, session: session4, created_at: 15.days.ago, project_id: common_ground_phase.project.id) } # in ideation phase, did not participate

  let!(:session5) { create(:session, user_id: user4.id) }
  let!(:pageview7) { create(:pageview, session: session5, created_at: 5.days.ago, project_id: common_ground_phase.project.id) } # in ideation phase, and in last 7 days

  let(:id) { common_ground_phase.id }

  get 'web_api/v1/phases/:id/insights' do
    example_request 'creates insights for common_ground phase' do
      assert_status 200

      expect(json_response_body[:data][:id]).to eq(common_ground_phase.id.to_s)
      expect(json_response_body[:data][:type]).to eq('phase_insights')

      metrics = json_response_body.dig(:data, :attributes, :metrics)
      expect(metrics).to eq({
        visitors: 3,
        visitors_last_7_days: 2,
        participants: 2,
        participants_last_7_days: 2,
        engagement_rate: 0.667,
        common_ground: {
          associated_ideas: 4,
          ideas_posted: 2,
          ideas_posted_last_7_days: 1,
          reactions: 1,
          reactions_last_7_days: 1
        }
      })
    end

    include_examples 'phase insights demographics',
      gender_blank: 0,
      birthyear_blank: 0
  end
end
