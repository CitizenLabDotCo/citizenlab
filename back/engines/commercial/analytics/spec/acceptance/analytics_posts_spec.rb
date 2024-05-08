# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Analytics - FactPosts model' do
  explanation 'Queries to summarise posts - ideas & initiatives/proposals.'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  post 'web_api/v1/analytics' do
    before do
      # Setup date dimensions
      @dates = [
        Date.new(2022, 9, 1),
        Date.new(2022, 9, 15),
        Date.new(2022, 10, 1),
        Date.new(2022, 10, 15)
      ]
      @dates.each do |date|
        create(:dimension_date, date: date)
      end

      # Set up type dimensions
      [{ name: 'idea', parent: 'post' }, { name: 'initiative', parent: 'post' }].each do |type|
        create(:dimension_type, name: type[:name], parent: type[:parent])
      end
    end

    example 'returns posts by month' do
      # Create 3 posts in 2 months
      create(:idea, created_at: @dates[0])
      create(:initiative, created_at: @dates[1])
      create(:idea, created_at: @dates[2])
      do_request({
        query: {
          fact: 'post',
          groups: 'dimension_date_created.month',
          aggregations: {
            all: 'count'
          }
        }
      })
      assert_status 200
      expect(response_data[:attributes]).to match_array([
        { 'dimension_date_created.month': '2022-09', count: 2 },
        { 'dimension_date_created.month': '2022-10', count: 1 }
      ])
    end

    example 'does not return survey responses', document: false do
      # Create 2 posts inc 1 ignored survey
      project = create(:project_with_past_ideation_and_current_native_survey_phase)
      create(:idea, created_at: @dates[0], project: project, phases: [project.phases.first])
      create(:native_survey_response, created_at: @dates[0], project: project, phases: [project.phases.last], creation_phase: project.phases.last)

      do_request({
        query: {
          fact: 'post',
          groups: 'dimension_date_created.month',
          aggregations: {
            all: 'count'
          }
        }
      })
      assert_status 200
      expect(response_data[:attributes]).to match_array([
        { 'dimension_date_created.month': '2022-09', count: 1 }
      ])
    end

    example 'correctly filters initiatives by status', document: false do
      create(:initiative, created_at: @dates[0])
      create(:initiative, created_at: @dates[1])
      create(:initiative, created_at: @dates[2])

      do_request({
        query: {
          fact: 'post',
          filters: {
            'dimension_type.name': 'initiative',
            publication_status: 'published',
            'dimension_status.code': 'threshold_reached'
          },
          aggregations: {
            all: 'count'
          }
        }
      })
      assert_status 200
      expect(response_data[:attributes]).to match_array([
        { count: 0 }
      ])
    end
  end
end
