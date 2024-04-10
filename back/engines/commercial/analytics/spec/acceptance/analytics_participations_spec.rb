# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Analytics - FactParticipations' do
  explanation 'Queries to summarise participations/active users.'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  post 'web_api/v1/analytics' do
    before_all do
      # Date dimensions
      dates = [Date.new(2022, 9, 2), Date.new(2022, 9, 15), Date.new(2022, 10, 2), Date.new(2022, 10, 15)]
      dates.each do |date|
        create(:dimension_date, date: date)
      end

      # Create project
      project = create(:project)

      # Create users
      male = create(:user, gender: 'male')
      female = create(:user, gender: 'female')
      unspecified = create(:user, gender: 'unspecified')

      # Create participations (3 by citizens, 1 by admin)
      create(:activity, acted_at: dates[0], user: male, project_id: project.id)
      create(
        :activity,
        item_type: 'Comment',
        action: 'created',
        acted_at: dates[2],
        user: female,
        project_id: project.id
      )
      create(
        :activity,
        item_type: 'Reaction',
        action: 'idea_liked',
        acted_at: dates[3],
        user: create(:admin, gender: 'female'),
        payload: {
          reactable_type: 'Idea',
          reactable_id: SecureRandom.uuid
        },
        project_id: project.id
      )
      create(
        :activity,
        item_type: 'Initiative',
        action: 'published',
        acted_at: dates[1],
        user: unspecified
      )
    end

    example 'group participations by month' do
      do_request({
        query: {
          fact: 'participation',
          groups: 'dimension_date_created.month',
          aggregations: {
            all: 'count'
          }
        }
      })
      assert_status 200
      expect(response_data[:attributes]).to match_array([
        { 'dimension_date_created.month': '2022-09', count: 2 },
        { 'dimension_date_created.month': '2022-10', count: 2 }
      ])
    end

    example 'filter between dates and return citizen participations only' do
      do_request({
        query: {
          fact: 'participation',
          filters: {
            'dimension_date_created.date': { from: '2022-10-01', to: '2022-10-31' },
            'dimension_user.role': ['citizen', nil]
          },
          aggregations: {
            all: 'count'
          }
        }
      })
      assert_status 200
      expect(response_data[:attributes]).to match_array([{ count: 1 }])
    end

    context 'when querying custom fields' do
      before { create(:custom_field, key: :gender, resource_type: 'User') }

      example 'filter participants by gender and group by month' do
        do_request({
          query: {
            fact: 'participation',
            groups: 'dimension_date_created.month',
            filters: {
              'dimension_user.role': ['citizen', 'admin', nil],
              'dimension_user_custom_field_values.key': 'gender',
              'dimension_user_custom_field_values.value': 'female'
            },
            aggregations: {
              'dimension_user_custom_field_values.dimension_user_id': 'count', # we count participants, not participations
              'dimension_date_created.date': 'first'
            }
          }
        })
        assert_status 200
        expect(response_data[:attributes].length).to eq(1)
        expect(response_data[:attributes].first).to include(
          count_dimension_user_custom_field_values_dimension_user_id: 2,
          'dimension_date_created.month': '2022-10'
        )
      end

      example 'group participations by gender' do
        nil_gender_user = create(:user)
        date = Date.new(2023, 11, 1)
        create(:dimension_date, date: date)

        create(
          :activity,
          item_type: 'Initiative',
          acted_at: date,
          user: nil_gender_user
        )

        do_request({
          query: {
            fact: 'participation',
            groups: 'dimension_user_custom_field_values.value',
            filters: {
              'dimension_user_custom_field_values.key': 'gender'
            },
            aggregations: {
              all: 'count'
            }
          }
        })
        expect(json_response_body).to have_key(:data)
        assert_status 200
        expect(response_data[:attributes]).to match_array([
          { 'dimension_user_custom_field_values.value': nil,      count: 1 },
          { 'dimension_user_custom_field_values.value': 'female', count: 2 },
          { 'dimension_user_custom_field_values.value': 'unspecified', count: 1 },
          { 'dimension_user_custom_field_values.value': 'male', count: 1 }
        ])
      end
    end

    example 'filter participations by project' do
      do_request({
        query: {
          fact: 'participation',
          filters: {
            'dimension_project.id': Project.first.id
          },
          aggregations: {
            all: 'count'
          }
        }
      })
      assert_status 200
      expect(response_data[:attributes]).to match_array([{ count: 3 }])
    end
  end
end
