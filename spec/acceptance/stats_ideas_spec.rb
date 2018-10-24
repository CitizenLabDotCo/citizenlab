require 'rails_helper'
require 'rspec_api_documentation/dsl'


def time_boundary_parameters s
  s.parameter :start_at, "Date defining from where results should start", required: false
  s.parameter :end_at, "Date defining till when results should go", required: false
end

def time_series_parameters s
  time_boundary_parameters s
  s.parameter :interval, "Either day, week, month, year"
end

resource "Stats - Ideas" do

  explanation "The various stats endpoints can be used to show certain properties of ideas."

  before do
    @current_user = create(:admin)
    token = Knock::AuthToken.new(payload: { sub: @current_user.id }).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
    @timezone = Tenant.settings('core','timezone')

    @project1 = create(:project)
    @project2 = create(:project)
    @project3 = create(:project)
    @ideas_with_topics = []
    @ideas_with_areas = []
    travel_to Time.now.in_time_zone(@timezone).beginning_of_year - 1.months do
      create(:idea, project: @project3)
    end
    travel_to Time.now.in_time_zone(@timezone).beginning_of_year + 2.months do
      @ideas_with_topics += create_list(:idea_with_topics, 2, project: @project1)
      @ideas_with_areas += create_list(:idea_with_areas, 3, project: @project2)
    end
    travel_to Time.now.in_time_zone(@timezone).beginning_of_year + 5.months do
      @ideas_with_topics += create_list(:idea_with_topics, 3, project: @project1)
      @ideas_with_areas += create_list(:idea_with_areas, 2, project: @project2)
      create(:idea, project: @project3)
    end
  end

  get "web_api/v1/stats/ideas_count" do
    time_boundary_parameters self

    example_request "Count all ideas" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:count]).to eq Idea.published.count
    end
  end

  get "web_api/v1/stats/ideas_by_topic" do
    time_boundary_parameters self

    let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_year }
    let(:end_at) { Time.now.in_time_zone(@timezone).end_of_year }

    example_request "Ideas by topic" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expected_topics = @ideas_with_topics.flat_map{|i| i.ideas_topics.map(&:topic_id)}.uniq
      expect(json_response[:data].keys.map(&:to_s).compact.uniq - expected_topics).to eq []
      expect(json_response[:data].values.map(&:class).uniq).to eq [Integer]
    end
  end

  get "web_api/v1/stats/ideas_by_project" do
    time_boundary_parameters self

    let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_year }
    let(:end_at) { Time.now.in_time_zone(@timezone).end_of_year }

    example_request "Ideas by project" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:data].stringify_keys).to match({
        @project1.id => 5,
        @project2.id => 5,
        @project3.id => 1
      })
      expect(json_response[:projects].keys.map(&:to_s)).to eq [@project1.id, @project2.id, @project3.id]
    end
  end

  get "web_api/v1/stats/ideas_by_area" do
    time_boundary_parameters self

    let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_year }
    let(:end_at) { Time.now.in_time_zone(@timezone).end_of_year }

    example_request "Ideas by area" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expected_areas = @ideas_with_areas.flat_map{|i| i.areas_ideas.map(&:area_id)}.uniq
      expect(json_response[:data].keys.map(&:to_s).compact.uniq - expected_areas).to eq []
      expect(json_response[:data].values.map(&:class).uniq).to eq [Integer]
    end
  end

  get "web_api/v1/stats/ideas_by_time" do
    time_series_parameters self

    let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_year }
    let(:end_at) { Time.now.in_time_zone(@timezone).end_of_year }
    let(:interval) { 'day' }

    example_request "Ideas by time (published_at)" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.size).to eq start_at.end_of_year.yday
      expect(json_response.values.map(&:class).uniq).to eq [Integer]
      expect(json_response.values.inject(&:+)).to eq 11
    end
  end

  get "web_api/v1/stats/ideas_by_time_cumulative" do
    time_series_parameters self

    let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_year }
    let(:end_at) { Time.now.in_time_zone(@timezone).end_of_year }
    let(:interval) { 'day' }

    example_request "Ideas by time (published_at) cumulative" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.size).to eq start_at.end_of_year.yday
      expect(json_response.values.map(&:class).uniq).to eq [Integer]
      # monotonically increasing
      expect(json_response.values.uniq).to eq json_response.values.uniq.sort
      expect(json_response.values.last).to eq Idea.published.count
    end
  end
end
