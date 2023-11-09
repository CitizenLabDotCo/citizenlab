# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

def time_boundary_parameters(s)
  s.parameter :start_at, 'Date defining from where results should start', required: false
  s.parameter :end_at, 'Date defining till when results should go', required: false
end

def time_series_parameters(s)
  time_boundary_parameters s
  s.parameter :interval, 'Either day, week, month, year', required: true
end

def group_filter_parameter(s)
  s.parameter :group, 'Group ID. Only count initiatives posted by users in the given group', required: false
end

def topic_filter_parameter(s)
  s.parameter :topic, 'Topic ID. Only count initiatives that have the given topic assigned', required: false
end

def feedback_needed_filter_parameter(s)
  s.parameter :feedback_needed, 'Only count initiatives that need feedback', required: false
end

resource 'Stats - Initiatives' do
  explanation 'The various stats endpoints can be used to show certain properties of initiatives.'

  let_it_be(:now) { AppConfiguration.timezone.now }

  before do
    header 'Content-Type', 'application/json'
    admin_header_token

    AppConfiguration.instance.update!(created_at: now - 3.years)

    @threshold_reached = create(:initiative_status, code: 'threshold_reached')
    @initiatives_with_topics = []
    @initiatives_with_areas = []

    travel_to (now - 1.year).beginning_of_year - 1.month do
      i = create(:initiative, initiative_status: @threshold_reached)
      create(:official_feedback, post: i)
    end

    travel_to (now - 1.year).beginning_of_year + 2.months do
      @initiatives_with_topics += create_list(:initiative_with_topics, 2, initiative_status: @threshold_reached)
      @initiatives_with_areas += create_list(:initiative_with_areas, 3, initiative_status: @threshold_reached)
    end

    travel_to (now - 1.year).beginning_of_year + 5.months do
      @initiatives_with_topics += create_list(:initiative_with_topics, 3, initiative_status: @threshold_reached)
      @initiatives_with_areas += create_list(:initiative_with_areas, 2, initiative_status: @threshold_reached)
      create(:initiative, initiative_status: @threshold_reached)
    end
  end

  get 'web_api/v1/stats/initiatives_count' do
    time_boundary_parameters self
    group_filter_parameter self
    topic_filter_parameter self
    feedback_needed_filter_parameter self

    example_request 'Count all initiatives' do
      assert_status 200
      json_response = json_parse response_body
      expect(json_response.dig(:data, :type)).to eq 'initiatives_count'
      expect(json_response.dig(:data, :attributes, :count)).to eq Initiative.published.count
    end

    describe 'with feedback_needed filter' do
      let(:feedback_needed) { true }

      example_request 'Count all initiatives that need feedback' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :type)).to eq 'initiatives_count'
        expect(json_response.dig(:data, :attributes, :count)).to eq Initiative.published.count
      end

      example 'Count all initiatives that need feedback for a specific assignee' do
        assignee = create(:admin)
        create(:initiative, initiative_status: @threshold_reached, assignee: assignee)
        do_request assignee: assignee.id

        assert_status 200
        json_response = json_parse response_body
        expect(json_response.dig(:data, :type)).to eq 'initiatives_count'
        expect(json_response.dig(:data, :attributes, :count)).to eq 1
      end
    end
  end
end
