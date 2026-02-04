require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Phase insights' do
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

  let(:ideation_phase) do
    create(
      :phase,
      participation_method: 'ideation',
      start_at: 20.days.ago,
      end_at: 3.days.ago,
      with_permissions: true
    ).tap do |phase|
      # Users
      user1 = create(:user)
      user2 = create(:user)
      user3 = create(:user)
      user4 = create(:user, custom_field_values: { gender: 'female', birthyear: 1980 })
      user5 = create(:user, custom_field_values: { gender: 'male', birthyear: 1990 })

      # Ideas
      create(:idea, phases: [phase], author: user1, created_at: 25.days.ago, published_at: 25.days.ago) # published before ideation phase (not counted)
      idea2 = create(:idea, phases: [phase], author: user2, created_at: 15.days.ago, published_at: 15.days.ago) # published during ideation phase
      create(:idea, phases: [phase], author: user2, created_at: 5.days.ago, published_at: 5.days.ago) # published during ideation phase, and in last 7 days
      create(:idea, phases: [phase], author: user3, created_at: 2.days.ago, published_at: 2.days.ago) # published after ideation phase (not counted)

      # Comments
      create(:comment, idea: idea2, author: user4, created_at: 10.days.ago) # in ideation phase (in week before last)

      # Reactions
      create(:reaction, reactable: idea2, user: user5, created_at: 5.days.ago) # in ideation phase, and in last 7 days

      # Pageviews and sessions
      session1 = create(:session, user_id: user1.id)
      create(:pageview, session: session1, created_at: 25.days.ago, project_id: phase.project.id) # before ideation phase

      session2 = create(:session, user_id: user2.id)
      create(:pageview, session: session2, created_at: 15.days.ago, project_id: phase.project.id) # in ideation phase
      create(:pageview, session: session2, created_at: 5.days.ago, project_id: phase.project.id) # in ideation phase & last 7 days, same session

      session3 = create(:session, user_id: user3.id)
      create(:pageview, session: session3, created_at: 2.days.ago, project_id: phase.project.id) # after ideation phase

      session4 = create(:session)
      create(:pageview, session: session4, created_at: 15.days.ago, project_id: phase.project.id) # in ideation phase, did not participate

      session5 = create(:session, user_id: user4.id)
      create(:pageview, session: session5, created_at: 10.days.ago, project_id: phase.project.id) # in ideation phase (in week before last)

      session6 = create(:session, user_id: user5.id)
      create(:pageview, session: session6, created_at: 5.days.ago, project_id: phase.project.id) # in ideation phase, and in last 7 days
    end
  end

  let(:id) { ideation_phase.id }

  get 'web_api/v1/phases/:id/insights' do
    example_request 'returns insights data for ideation phase' do
      assert_status 200

      expect(json_response_body[:data][:id]).to eq(ideation_phase.id.to_s)
      expect(json_response_body[:data][:type]).to eq('phase_insights')

      metrics = json_response_body.dig(:data, :attributes, :metrics)
      expect(metrics).to eq({
        visitors: 4,
        visitors_7_day_percent_change: 100.0, # from 1 (in week before last) to 2 unique visitors (in last 7 days) = 100% increase
        participants: 3,
        participants_7_day_percent_change: 100.0, # from 1 (in week before last) to 2 unique participants (in last 7 days) = 100% increase
        participation_rate_as_percent: 75.0,
        participation_rate_7_day_percent_change: 0.0, # participation_rate_last_7_days: 1.0, participation_rate_previous_7_days: 1.0 = 0% change
        ideation: {
          ideas_posted: 2,
          ideas_posted_7_day_percent_change: 'last_7_days_compared_with_zero', # from 0 (in week before last) to 1 (in last 7 days) => avoid division by zero
          comments_posted: 1,
          comments_posted_7_day_percent_change: -100.0, # from 1 (in week before last) to 0 (in last 7 days) = -100% decrease
          reactions: 1,
          reactions_7_day_percent_change: 'last_7_days_compared_with_zero' # from 0 (in week before last) to 1 (in last 7 days) => avoid division by zero
        }
      })

      participants_and_visitors_chart_data = json_response_body.dig(:data, :attributes, :participants_and_visitors_chart_data)
      expect(participants_and_visitors_chart_data).to eq({
        resolution: 'day',
        timeseries: [
          { participants: 1, visitors: 2, date_group: '2025-11-17' },
          { participants: 1, visitors: 1, date_group: '2025-11-22' },
          { participants: 2, visitors: 2, date_group: '2025-11-27' }
        ]
      })
    end

    include_examples 'phase insights demographics',
      gender_blank: 1,
      birthyear_blank: 1
  end
end
