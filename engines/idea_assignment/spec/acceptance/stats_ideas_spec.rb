require 'rails_helper'
require 'rspec_api_documentation/dsl'

multiloc_service = MultilocService.new

def time_boundary_parameters s
  s.parameter :start_at, "Date defining from where results should start", required: false
  s.parameter :end_at, "Date defining till when results should go", required: false
end

def time_series_parameters s
  time_boundary_parameters s
  s.parameter :interval, "Either day, week, month, year", required: true
end

def project_filter_parameter s
  s.parameter :project, "Project ID. Only count ideas that are in the given project", required: false
end

def group_filter_parameter s
  s.parameter :group, "Group ID. Only count ideas posted by users in the given group", required: false
end

def topic_filter_parameter s
  s.parameter :topic, "Topic ID. Only count ideas that have the given topic assigned", required: false
end

def feedback_needed_filter_parameter s
  s.parameter :feedback_needed, "Only count ideas that need feedback", required: false
end


resource "Stats - Ideas" do

  explanation "The various stats endpoints can be used to show certain properties of ideas."

  let!(:now) { Time.now.in_time_zone(@timezone) }

  before do
    @current_user = create(:admin)
    token = Knock::AuthToken.new(payload: @current_user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
    Tenant.current.update!(created_at: now - 3.year)
    @timezone = AppConfiguration.instance.settings('core','timezone')

    @project1 = create(:project)
    @project2 = create(:project)
    @project3 = create(:project)
    @proposed = create(:idea_status, code: 'proposed')
    @ideas_with_topics = []
    @ideas_with_status = []
    @ideas_with_areas = []
    travel_to (now - 1.year).in_time_zone(@timezone).beginning_of_year - 1.months do
      i = create(:idea, project: @project3, idea_status: @proposed)
      create(:official_feedback, post: i)
    end
    travel_to (now - 1.year).in_time_zone(@timezone).beginning_of_year + 2.months do
      @ideas_with_topics += create_list(:idea_with_topics, 2, project: @project1, idea_status: @proposed)
      @ideas_with_areas += create_list(:idea_with_areas, 3, project: @project2, idea_status: @proposed)
    end
    travel_to (now - 1.year).in_time_zone(@timezone).beginning_of_year + 5.months do
      @ideas_with_topics += create_list(:idea_with_topics, 3, project: @project1, idea_status: @proposed)
      @ideas_with_areas += create_list(:idea_with_areas, 2, project: @project2, idea_status: @proposed)
      create(:idea, project: @project3, idea_status: @proposed)
    end
  end

  get "web_api/v1/stats/ideas_count" do
    time_boundary_parameters self
    project_filter_parameter self
    group_filter_parameter self
    topic_filter_parameter self
    feedback_needed_filter_parameter self

    example_request "Count all ideas" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:count]).to eq Idea.published.count
    end

    describe "with feedback_needed filter" do
      let(:feedback_needed) { true }

      example_request "Count all ideas that need feedback" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:count]).to eq Idea.published.count - 1
      end

      example "Count all ideas that need feedback for a specific assignee" do
        assignee = create(:admin)
        create(:idea, idea_status: @proposed, assignee: assignee)
        do_request assignee: assignee.id

        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:count]).to eq 1
      end
    end
  end
end
