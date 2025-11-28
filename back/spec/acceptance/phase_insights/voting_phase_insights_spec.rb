require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Phase insights' do
  before { admin_header_token }

  let(:ideation_phase) do
    create(
      :phase,
      participation_method: 'ideation',
      start_at: 30.days.ago,
      end_at: 15.days.ago
    )
  end

  let(:voting_phase) do
    create(
      :phase,
      participation_method: 'voting',
      voting_method: 'single_voting',
      start_at: 14.days.ago,
      end_at: 1.day.ago,
      project: ideation_phase.project,
      manual_votes_count: 3
    )
  end

  let!(:permission1) { create(:permission, action: 'voting', permission_scope: voting_phase) }
  let!(:permission2) { create(:permission, action: 'commenting_idea', permission_scope: voting_phase) }
  let!(:permission3) { create(:permission, action: 'attending_event', permission_scope: voting_phase) }

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

  # let!(:permissions_custom_field) { create(:permissions_custom_field, permission: permission1, custom_field: custom_field_gender) }

  (1..3).each do |i|
    let!(:"idea#{i}") { create(:idea, phases: [ideation_phase, voting_phase], project: ideation_phase.project, submitted_at: 20.days.ago) }
  end

  (1..4).each do |i|
    let!(:"user#{i}") { create(:user) }
  end

  let!(:user5) { create(:user, custom_field_values: { gender: 'female', birthyear: 1980 }) }
  let!(:user6) { create(:user, custom_field_values: { gender: 'male', birthyear: 1990 }) }

  # We respond with count of unique participants in last_7_days.
  # We do not count the number of NEW participants in the last 7 days.
  # Thus, user2 who participated before the last 7 days AND in last 7 days is also counted,
  # and this is modelled in the test data to document this behavior.
  let!(:comment1) { create(:comment, idea: idea1, author: user1, created_at: 25.days.ago) } # before voting phase (not counted)
  let!(:comment2) { create(:comment, idea: idea2, author: user2, created_at: 13.days.ago) } # in voting phase
  let!(:comment3) { create(:comment, idea: idea3, author: user2, created_at: 5.days.ago) } # in voting phase & last 7 days
  let!(:comment4) { create(:comment, idea: idea3, author: user3, created_at: 5.days.ago) } # in voting phase & last 7 days

  let!(:basket1) { create(:basket, phase: voting_phase, user: user4, submitted_at: 20.days.ago) } # before voting phase (still counts)
  let!(:baskets_idea1) { create(:baskets_idea, basket: basket1, idea: idea1, votes: 1) }
  let!(:baskets_idea2) { create(:baskets_idea, basket: basket1, idea: idea2, votes: 1) }

  let!(:basket2) { create(:basket, phase: voting_phase, user: user5, submitted_at: 10.days.ago) } # in voting phase
  let!(:baskets_idea3) { create(:baskets_idea, basket: basket2, idea: idea2, votes: 1) }

  let!(:basket3) { create(:basket, phase: voting_phase, user: user6, submitted_at: 5.days.ago) } # in voting phase & last 7 days
  let!(:baskets_idea4) { create(:baskets_idea, basket: basket3, idea: idea3, votes: 1) }

  let!(:session1) { create(:session, user_id: user2.id) }
  let!(:session2) { create(:session, user_id: user2.id) }
  let!(:pageview1) { create(:pageview, session: session1, created_at: 20.days.ago, project_id: voting_phase.project.id) } # before voting phase
  let!(:pageview2) { create(:pageview, session: session1, created_at: 13.days.ago, project_id: voting_phase.project.id) } # in voting phase
  let!(:pageview3) { create(:pageview, session: session2, created_at: 5.days.ago, project_id: voting_phase.project.id) } # in voting phase & last 7 days
  let!(:pageview4) { create(:pageview, session: session2, created_at: 4.days.ago, project_id: voting_phase.project.id) } # different session, but repeat visitor

  let!(:session3) { create(:session, user_id: user3.id) }
  let!(:pageview5) { create(:pageview, session: session3, created_at: 10.days.ago, project_id: voting_phase.project.id) } # in voting phase

  let!(:session4) { create(:session, user_id: user4.id) }
  let!(:pageview6) { create(:pageview, session: session4, created_at: 10.days.ago, project_id: voting_phase.project.id) } # in voting phase
  let!(:pageview7) { create(:pageview, session: session4, created_at: 5.days.ago, project_id: voting_phase.project.id) } # in voting phase & last 7 days

  let!(:session5) { create(:session, user_id: user5.id) }
  let!(:pageview8) { create(:pageview, session: session5, created_at: 5.days.ago, project_id: voting_phase.project.id) } # in voting phase & last 7 days

  let!(:session6) { create(:session, user_id: user6.id) }
  let!(:pageview9) { create(:pageview, session: session6, created_at: 5.days.ago, project_id: voting_phase.project.id) } # in voting phase & last 7 days

  let!(:session7) { create(:session, monthly_user_hash: 'fake_hash1') }
  let!(:pageview10) { create(:pageview, session: session7, created_at: 10.days.ago, project_id: voting_phase.project.id) } # in voting phase (visitor did not participate)
  let!(:pageview11) { create(:pageview, session: session7, created_at: 5.days.ago, project_id: voting_phase.project.id) } # in voting phase & last 7 days (visitor did not participate)

  let(:id) { voting_phase.id }

  get 'web_api/v1/phases/:id/insights' do
    example_request 'Get insights data for a voting phase' do
      assert_status 200

      expect(json_response_body[:data][:id]).to eq(voting_phase.id.to_s)
      expect(json_response_body[:data][:type]).to eq('phase_insights')

      metrics = json_response_body.dig(:data, :attributes, :metrics)
      expect(metrics).to eq({
        visitors: 6,
        visitors_last_7_days: 5,
        participants: 5,
        participants_last_7_days: 3,
        engagement_rate: 0.833,
        voting: {
          online_votes: 4,
          online_votes_last_7_days: 1,
          offline_votes: 3,
          voters: 3,
          voters_last_7_days: 1,
          associated_ideas: 3,
          comments_posted: 3,
          comments_posted_last_7_days: 2
        }
      })

      demographics = json_response_body.dig(:data, :attributes, :demographics)
      expect(demographics[:fields]).to match_array([
        {
          id: custom_field_gender.id,
          key: 'gender',
          code: nil,
          input_type: 'select',
          r_score: 0.0,
          title_multiloc: { en: 'Gender' },
          series: { male: 1, female: 1, unspecified: 0, _blank: 3 }, # TODO: Only the 'blank' value changes between tests, so we can use shared example
          options: {
            male: { title_multiloc: { en: 'Male' }, ordering: 0 },
            female: { title_multiloc: { en: 'Female' }, ordering: 1 },
            unspecified: { title_multiloc: { en: 'Unspecified' }, ordering: 2 }
          },
          reference_distribution: { male: 480, unspecified: 10, female: 510 }
        },
        {
          id: custom_field_birthyear.id,
          key: 'birthyear',
          code: nil,
          input_type: 'number',
          r_score: 0.0,
          title_multiloc: { en: 'Birthyear' },
          series: { '18-24': 0, '25-34': 0, '35-44': 1, '45-54': 1, '55-64': 0, '65+': 0, _blank: 3 }, # TODO: Only the 'blank' value changes between tests, so we can use shared example
          reference_distribution: { '18-24': 50, '25-34': 200, '35-44': 400, '45-54': 300, '55-64': 50, '65+': 700 }
        }
      ])
    end

    context 'when the voting method is budgeting' do
      before { voting_phase.update!(voting_method: 'budgeting') }

      example_request 'Get insights data for a budgeting voting phase' do
        assert_status 200

        expect(json_response_body[:data][:id]).to eq(voting_phase.id.to_s)
        expect(json_response_body[:data][:type]).to eq('phase_insights')

        metrics = json_response_body.dig(:data, :attributes, :metrics)
        expect(metrics).to eq({
          visitors: 6,
          visitors_last_7_days: 5,
          participants: 5,
          participants_last_7_days: 3,
          engagement_rate: 0.833,
          voting: {
            online_picks: 4,
            online_picks_last_7_days: 1,
            offline_picks: 3,
            voters: 3,
            voters_last_7_days: 1,
            associated_ideas: 3,
            comments_posted: 3,
            comments_posted_last_7_days: 2
          }
        })
      end
    end
  end
end
