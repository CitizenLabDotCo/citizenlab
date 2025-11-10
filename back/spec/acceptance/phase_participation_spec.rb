require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Phase participation' do
  before { admin_header_token }

  context 'voting phase' do
    # rubocop:disable RSpec/ScatteredLet
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
        project: ideation_phase.project
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

    let!(:permissions_custom_field) { create(:permissions_custom_field, permission: permission1, custom_field: custom_field_gender) }

    (1..3).each do |i|
      let!(:"idea#{i}") { create(:idea, phases: [ideation_phase, voting_phase], project: ideation_phase.project, submitted_at: 20.days.ago) }
    end

    (1..4).each do |i|
      let!(:"user#{i}") { create(:user) }
    end

    let!(:user5) { create(:user, custom_field_values: { gender: 'female', birthyear: 1980 }) }
    let!(:user6) { create(:user, custom_field_values: { gender: 'male', birthyear: 1990 }) }

    let!(:comment1) { create(:comment, idea: idea1, author: user1, created_at: 25.days.ago) } # before voting phase (not counted)
    let!(:comment2) { create(:comment, idea: idea2, author: user2, created_at: 13.days.ago) } # in voting phase
    let!(:comment3) { create(:comment, idea: idea3, author: user2, created_at: 5.days.ago) } # in voting phase & last 7 days
    let!(:comment4) { create(:comment, idea: idea3, author: user3, created_at: 5.days.ago) } # in voting phase & last 7 days

    let!(:basket1) { create(:basket, phase: voting_phase, user: user4, submitted_at: 20.days.ago) } # before voting phase (still counts)
    let!(:basket2) { create(:basket, phase: voting_phase, user: user5, submitted_at: 10.days.ago) } # in voting phase
    let!(:basket3) { create(:basket, phase: voting_phase, user: user5, submitted_at: 5.days.ago) } # in voting phase & last 7 days
    let!(:basket4) { create(:basket, phase: voting_phase, user: user6, submitted_at: 5.days.ago) } # in voting phase & last 7 days
    let!(:basket5) { create(:basket, phase: voting_phase, user: user3, submitted_at: 5.days.ago) } # in voting phase & last 7 days

    let(:id) { voting_phase.id }
    # rubocop:enable RSpec/ScatteredLet

    get 'web_api/v1/phases/:id/participation' do
      example_request 'Get participation data for a phase' do
        assert_status 200

        participations = json_response_body.dig(:data, :attributes, :participation)
        expect(participations).to eq({
          participations: {
            count: 8,
            change_last_7_days: 5
          },
          participants: {
            count: 5, # unique users: user2, user3, user4, user5, user6
            change_last_7_days: 2 # NEW unique users in last 7 days: user3, user6
          }
        })
      end
    end

    get 'web_api/v1/phases/:id/demographics' do
      example_request 'Get demographics data for a phase' do
        assert_status 200

        demographics = json_response_body.dig(:data, :attributes, :demographics)
        pp demographics
        expect(demographics).to match({
          gender: {
            series: {
              users: {
                male: 1, female: 1, unspecified: 0, _blank: 3
              },
              reference_population: {
                female: 510,
                male: 480,
                unspecified: 10
              },
            },
            title_multiloc: { en: 'Gender' },
            options: {
              male: {
                title_multiloc: { en: 'Male' },
                ordering: 0
              },
              female: {
                title_multiloc: { en: 'Female' },
                ordering: 1
              },
              unspecified: {
                title_multiloc: { en: 'Unspecified' },
                ordering: 2
              }
            }
          },
          users_by_age: {
            total_user_count: 5,
            unknown_age_count: 3,
            series: {
              user_counts: [0, 0, 1, 1, 0, 0],
              reference_population: [50, 200, 400, 300, 50, 700],
              bins: [18, 25, 35, 45, 55, 65, nil]
            }
          }
        })
      end
    end
  end
end
