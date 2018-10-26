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

def project_filter_parameter s
  s.parameter :project, "Project ID. Only count comments on ideas in the given project", required: false
end

def group_filter_parameter s
  s.parameter :group, "Group ID. Only count comments posted by users in the given group", required: false
end

def topic_filter_parameter s
  s.parameter :topic, "Topic ID. Only count comments on ideas that have the given topic assigned", required: false
end


resource "Stats - Comments" do

  explanation "The various stats endpoints can be used to show certain properties of comments."

  before do
    @current_user = create(:admin)
    token = Knock::AuthToken.new(payload: { sub: @current_user.id }).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
    @timezone = Tenant.settings('core','timezone')
    create(:comment, publication_status: 'deleted')
  end

  get "web_api/v1/stats/comments_count" do
    time_boundary_parameters self

    example_request "Count all comments" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:count]).to eq Comment.published.count
    end
  end

  context "with activity over time" do
    before do
      travel_to(Time.now.in_time_zone(@timezone).beginning_of_month - 1.day) do
        create(:comment)
      end
      travel_to(Time.now.in_time_zone(@timezone).beginning_of_month + 1.day) do
        create_list(:comment, 3)
      end

      travel_to(Time.now.in_time_zone(@timezone).end_of_month - 1.day) do
        create_list(:comment, 2)
      end
      travel_to(Time.now.in_time_zone(@timezone).end_of_month + 1.day) do
        create(:comment)
      end
    end

    get "web_api/v1/stats/comments_by_time" do
      time_series_parameters self

      let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { Time.now.in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      example_request "Comments by time" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.size).to eq start_at.end_of_month.day
        expect(json_response.values.map(&:class).uniq).to eq [Integer]
        expect(json_response.values.inject(&:+)).to eq 5
      end
    end

    get "web_api/v1/stats/comments_by_time_cumulative" do
      time_series_parameters self

      let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { Time.now.in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      example_request "Comments by time (cumulative)" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.size).to eq start_at.end_of_month.day
        expect(json_response.values.map(&:class).uniq).to eq [Integer]
        expect(json_response.values.uniq).to eq json_response.values.uniq.sort
        expect(json_response.values.last).to eq 6
      end
    end
  end


  get "web_api/v1/stats/comments_by_topic" do
    time_boundary_parameters self
    project_filter_parameter self
    group_filter_parameter self

    describe "with time filtering only" do
      let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { Time.now.in_time_zone(@timezone).end_of_month }

      let!(:topic1) { create(:topic) }
      let!(:topic2) { create(:topic) }
      let!(:topic3) { create(:topic) }
      let!(:idea1) { create(:idea, topics: [topic1])}
      let!(:idea2) { create(:idea, topics: [topic2])}
      let!(:idea3) { create(:idea, topics: [topic1, topic2])}
      let!(:idea4) { create(:idea)}
      let!(:comment1) { create(:comment, idea: idea1) }
      let!(:comment2) { create(:comment, idea: idea1) }
      let!(:comment3) { create(:comment, idea: idea2) }
      let!(:comment4) { create(:comment, idea: idea3) }

      example_request "Comments by topic" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:data].stringify_keys).to match({
          topic1.id => 3,
          topic2.id => 2
        })
        expect(json_response[:topics].keys.map(&:to_s)).to match_array [topic1.id, topic2.id]
      end

    end

    describe "filtered by project" do
      before do
        @project = create(:project)
        idea = create(:idea_with_topics, topics_count: 2, project: @project)
        create(:comment, idea: idea)
        create(:comment, idea: create(:idea_with_topics))
      end

      let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { Time.now.in_time_zone(@timezone).end_of_month }
      let(:project) { @project.id }

      example_request "Comments by topic filtered by project" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:data].values.inject(&:+)).to eq 2
      end
    end

    describe "filtered by group" do
      before do
        @group = create(:group)
        idea = create(:idea_with_topics, topics_count: 2)
        create(:comment, idea: idea, author: create(:user, manual_groups: [@group]))
        create(:comment, idea: create(:idea_with_topics))
      end

      let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { Time.now.in_time_zone(@timezone).end_of_month }
      let(:group) { @group.id }

      example_request "Comments by topic filtered by group" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:data].values.inject(&:+)).to eq 2
      end
    end
    
  end

  get "web_api/v1/stats/comments_by_project" do
    time_boundary_parameters self
    topic_filter_parameter self
    group_filter_parameter self

    describe "with time filtering only" do
      let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { Time.now.in_time_zone(@timezone).end_of_month }

      let!(:project1) { create(:project) }
      let!(:project2) { create(:project) }
      let!(:idea1) { create(:idea, project: project1) }
      let!(:idea2) { create(:idea, project: project1) }
      let!(:idea3) { create(:idea, project: project2) }
      let!(:idea4) { create(:idea) }
      let!(:comment1) { create(:comment, idea: idea1) }
      let!(:comment2) { create(:comment, idea: idea1) }
      let!(:comment3) { create(:comment, idea: idea2) }
      let!(:comment4) { create(:comment, idea: idea3) }

      example_request "Comments by project" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:data].stringify_keys).to match({
          project1.id => 3,
          project2.id => 1
        })
        expect(json_response[:projects].keys.map(&:to_s)).to eq [project1.id, project2.id]
      end

    end

    describe "filtered by topic" do
      before do
        @topic = create(:topic)
        idea1 = create(:idea, topics: [@topic])
        idea2 = create(:idea_with_topics)
        create(:comment, idea: idea1)
        create(:comment, idea: idea2)
      end

      let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { Time.now.in_time_zone(@timezone).end_of_month }
      let(:topic) { @topic.id }

      example_request "Comments by project filtered by topic" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:data].values.inject(&:+)).to eq 1
      end
    end

    describe "filtered by group" do
      before do
        @group = create(:group)
        project = create(:project)
        idea = create(:idea, project: project)
        create(:comment, idea: idea, author: create(:user, manual_groups: [@group]))
        create(:comment, idea: idea)
      end

      let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { Time.now.in_time_zone(@timezone).end_of_month }
      let(:group) { @group.id }

      example_request "Comments by project filtered by group" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:data].values.inject(&:+)).to eq 1
      end
    end

  end
    
end
