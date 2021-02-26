require 'rails_helper'
require 'rspec_api_documentation/dsl'


def time_boundary_parameters s
  s.parameter :start_at, "Date defining from where results should start", required: false
  s.parameter :end_at, "Date defining till when results should go", required: false
end

def time_series_parameters s
  time_boundary_parameters s
  s.parameter :interval, "Either day, week, month, year", required: true
end

def group_filter_parameter s
  s.parameter :group, "Group ID. Only count initiatives posted by users in the given group", required: false
end

def topic_filter_parameter s
  s.parameter :topic, "Topic ID. Only count initiatives that have the given topic assigned", required: false
end

def feedback_needed_filter_parameter s
  s.parameter :feedback_needed, "Only count initiatives that need feedback", required: false
end


resource "Stats - Initiatives" do

  explanation "The various stats endpoints can be used to show certain properties of initiatives."

  let!(:now) { Time.now.in_time_zone(@timezone) }

  before do
    @current_user = create(:admin)
    token = Knock::AuthToken.new(payload: @current_user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
    Tenant.current.update!(created_at: now - 3.year)
    @timezone = AppConfiguration.instance.settings('core','timezone')

    @threshold_reached = create(:initiative_status, code: 'threshold_reached')
    @initiatives_with_topics = []
    @initiatives_with_areas = []
    travel_to (now - 1.year).in_time_zone(@timezone).beginning_of_year - 1.months do
      i = create(:initiative, initiative_status: @threshold_reached)
      create(:official_feedback, post: i)
    end
    travel_to (now - 1.year).in_time_zone(@timezone).beginning_of_year + 2.months do
      @initiatives_with_topics += create_list(:initiative_with_topics, 2, initiative_status: @threshold_reached)
      @initiatives_with_areas += create_list(:initiative_with_areas, 3, initiative_status: @threshold_reached)
    end
    travel_to (now - 1.year).in_time_zone(@timezone).beginning_of_year + 5.months do
      @initiatives_with_topics += create_list(:initiative_with_topics, 3, initiative_status: @threshold_reached)
      @initiatives_with_areas += create_list(:initiative_with_areas, 2, initiative_status: @threshold_reached)
      create(:initiative, initiative_status: @threshold_reached)
    end
  end

  get "web_api/v1/stats/initiatives_count" do
    time_boundary_parameters self
    group_filter_parameter self
    topic_filter_parameter self
    feedback_needed_filter_parameter self

    example_request "Count all initiatives" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:count]).to eq Initiative.published.count
    end

    describe "with feedback_needed filter" do
      let(:feedback_needed) { true }

      example_request "Count all initiatives that need feedback" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:count]).to eq Initiative.published.count
      end

      example "Count all initiatives that need feedback for a specific assignee" do
        assignee = create(:admin)
        create(:initiative, initiative_status: @threshold_reached, assignee: assignee)
        do_request assignee: assignee.id
        
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:count]).to eq 1
      end
    end
  end

  get "web_api/v1/stats/initiatives_by_topic" do
    time_boundary_parameters self
    group_filter_parameter self
    feedback_needed_filter_parameter self

    describe "with time filters only" do
      let(:start_at) { (now - 1.year).in_time_zone(@timezone).beginning_of_year }
      let(:end_at) { (now - 1.year).in_time_zone(@timezone).end_of_year }

      example_request "Initiatives by topic" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expected_topics = @initiatives_with_topics.flat_map{|i| i.initiatives_topics.map(&:topic_id)}.uniq
        expect(json_response[:series][:initiatives].keys.map(&:to_s).compact.uniq - expected_topics).to eq []
        expect(json_response[:series][:initiatives].values.map(&:class).uniq).to eq [Integer]
      end
    end

    describe "with group filter" do
      let(:start_at) { (now - 1.year).in_time_zone(@timezone).beginning_of_year }
      let(:end_at) { (now - 1.year).in_time_zone(@timezone).end_of_year }

      before do
        travel_to start_at + 2.months do
          @group = create(:group)
          create(:initiative_with_topics, topics_count: 2, author: create(:user, manual_groups: [@group]))
        end
      end

      let(:group) { @group.id }

      example_request "Initiatives by topic filtered by group" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:initiatives].values.inject(&:+)).to eq 2
      end
    end
  end

  get "web_api/v1/stats/initiatives_by_area" do
    time_boundary_parameters self
    topic_filter_parameter self
    group_filter_parameter self
    feedback_needed_filter_parameter self

    let(:start_at) { (now - 1.year).in_time_zone(@timezone).beginning_of_year }
    let(:end_at) { (now - 1.year).in_time_zone(@timezone).end_of_year }

    example_request "Initiatives by area" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expected_areas = @initiatives_with_areas.flat_map{|i| i.areas_initiatives.map(&:area_id)}.uniq
      expect(json_response[:series][:initiatives].keys.map(&:to_s).compact.uniq - expected_areas).to eq []
      expect(json_response[:series][:initiatives].values.map(&:class).uniq).to eq [Integer]
    end
  end

  get "web_api/v1/stats/initiatives_by_time" do
    time_series_parameters self
    topic_filter_parameter self
    group_filter_parameter self
    feedback_needed_filter_parameter self

    let(:start_at) { (now - 1.year).in_time_zone(@timezone).beginning_of_year }
    let(:end_at) { (now - 1.year).in_time_zone(@timezone).end_of_year }
    let(:interval) { 'day' }

    example_request "Initiatives by time (published_at)" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:series][:initiatives].size).to eq end_at.yday
      expect(json_response[:series][:initiatives].values.inject(&:+)).to eq 11
    end
  end

  get "web_api/v1/stats/initiatives_by_time_cumulative" do
    time_series_parameters self
    topic_filter_parameter self
    group_filter_parameter self
    feedback_needed_filter_parameter self

    describe "without time filters" do
      let(:interval) { 'day' }

      example "Initiatives by time (published_at) cumulative without time filters", document: false do
        do_request
        expect(response_status).to eq 200
      end
    end

    describe "with time filters" do

      let(:start_at) { (now - 1.year).in_time_zone(@timezone).beginning_of_year }
      let(:end_at) { (now - 1.year).in_time_zone(@timezone).end_of_year }
      let(:interval) { 'day' }

      example_request "Initiatives by time (published_at) cumulative" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:initiatives].size).to eq end_at.yday
        # monotonically increasing
        expect(json_response[:series][:initiatives].values.uniq).to eq json_response[:series][:initiatives].values.uniq.sort
        expect(json_response[:series][:initiatives].values.last).to eq Initiative.published.count
      end
    end

  end
end
