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

resource "Stats" do

  explanation "The various stats endpoints can be used to show how certain properties of users/ideas/... are distributed."

  before do
    @current_user = create(:admin)
    token = Knock::AuthToken.new(payload: { sub: @current_user.id }).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
    @timezone = Tenant.settings('core','timezone')
  end

  describe "users" do
    before do
      # we need the built in custom fields first, so lets run the base tenant template
      TenantTemplateService.new.apply_template('base')
      CustomField.find_by(code: 'education').update(enabled: true)
      create(:user, gender: nil)
      create(:user, gender: 'male')
      create(:user, gender: 'female')
      create(:user, gender: 'unspecified')
      create(:invited_user)
      create_list(:user_with_demographics, 10)
    end

    get "web_api/v1/stats/users_count" do
      time_boundary_parameters self

      example_request "Count all users" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:count]).to eq User.active.count
      end
    end

    get "web_api/v1/stats/users_by_time" do
      time_series_parameters self

      let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_month }
      let(:end_at) { Time.now.in_time_zone(@timezone).end_of_month }
      let(:interval) { 'day' }

      example_request "Users by time" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.size).to eq start_at.end_of_month.day
        expect(json_response.values.map(&:class).uniq).to eq [Integer]
      end
    end

    get "web_api/v1/stats/users_by_gender" do
      time_boundary_parameters self

      let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_year }
      let(:end_at) { Time.now.in_time_zone(@timezone).end_of_year }

      example_request "Users by gender" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.stringify_keys.keys.uniq).to match_array ['male','female','unspecified','_blank']
        expect(json_response.values.map(&:class).uniq).to eq [Integer]
      end
    end


    get "web_api/v1/stats/users_by_birthyear" do
      time_boundary_parameters self

      let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_week }
      let(:end_at) { Time.now.in_time_zone(@timezone).end_of_week }

      example_request "Users by birthyear" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.values.map(&:class).uniq).to eq [Integer]
      end
    end

    get "web_api/v1/stats/users_by_domicile" do
      time_boundary_parameters self

      let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_week }
      let(:end_at) { Time.now.in_time_zone(@timezone).end_of_week }

      example_request "Users by domicile" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:data].values.map(&:class).uniq).to eq [Integer]
      end
    end

    get "web_api/v1/stats/users_by_education" do
      time_boundary_parameters self

      let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_year }
      let(:end_at) { Time.now.in_time_zone(@timezone).end_of_year }

      example_request "Users by education" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        allowed_keys = ['0','1','2','3','4','5','6','7','8','_blank']
        expect(json_response.stringify_keys.keys.uniq - allowed_keys).to be_empty
        expect(json_response.values.map(&:class).uniq).to eq [Integer]
      end
    end
  end

  describe "ideas" do
    before do
      @ideas_with_topics = create_list(:idea_with_topics, 5)
      @ideas_with_areas = create_list(:idea_with_areas, 5)
      # Create one without areas and topics as well, for completeness
      create(:idea)
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
      end
    end
  end

  describe "comments" do

    get "web_api/v1/stats/comments_count" do
      time_boundary_parameters self

      example_request "Count all comments" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:count]).to eq Comment.published.count
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
      end
    end
  end

  describe "votes" do
    before do
      TenantTemplateService.new.apply_template('base')
      CustomField.find_by(code: 'education').update(enabled: true)
      create_list(:vote, 6)
      create_list(:vote, 2, mode: 'down')
      # @ideas_with_topics = create_list(:idea_with_topics, 5)
      # @ideas_with_areas = create_list(:idea_with_areas, 5)
      # @users = create_list(:user_with_demographics, 10)
      # @votes = ['up','up','up','up','up','up','down','down'].each do |mode| 
      #   create(:vote, mode: mode, user: User.all.shuffle.first) 
      # end
    end

    get "web_api/v1/stats/votes_count" do
      time_boundary_parameters self
      parameter :resource, "Either Idea or Comment. If not provided, all votes are taken.", required: false

      example "Count all votes" do
        create(:vote, votable: create(:comment))
        do_request resource: 'Idea'
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:up)).to eq 6
        expect(json_response.dig(:down)).to eq 2
        expect(json_response.dig(:count)).to eq Vote.count-1
      end
    end

    get "web_api/v1/stats/votes_by_birthyear" do
      before do
        @ideas = create_list(:idea, 5)
        @someone = create(:user, birthyear: '1984')
        create(:vote, mode: 'up', user: @someone, votable: @ideas.first)
        create(:vote, mode: 'down', user: @someone, votable: @ideas.last)
        [['up','1984'],['up','1992'],['down','1992'],['up',nil]].each do |mode, birthyear|
          create(:vote, mode: mode, votable: @ideas.shuffle.first,
            user: (if birthyear then create(:user, birthyear: birthyear) else create(:user) end))
        end
      end
      time_boundary_parameters self
      parameter :ideas, "Array of idea ids to get the stats for.", required: false

      let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_year }
      let(:end_at) { Time.now.in_time_zone(@timezone).end_of_year }
      let(:ideas) { @ideas.map(&:id) }

      example_request "Votes by birthyear" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response).to match({
          up: {:"1984" => 2, :"1992" => 1, :"_blank" => 1}, 
          down: {:"1984" => 1, :"1992" => 1}, 
          total: {:"1984" => 3, :"1992" => 2, :"_blank" => 1}
        })
      end
    end

    get "web_api/v1/stats/votes_by_domicile" do
      time_boundary_parameters self
      parameter :ideas, "Array of idea ids to get the stats for.", required: false

      let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_year }
      let(:end_at) { Time.now.in_time_zone(@timezone).end_of_year }

      example_request "Votes by domicile" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        # TODO
      end
    end

    get "web_api/v1/stats/votes_by_education" do
      time_boundary_parameters self
      parameter :ideas, "Array of idea ids to get the stats for.", required: false

      let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_year }
      let(:end_at) { Time.now.in_time_zone(@timezone).end_of_year }

      example_request "Votes by education" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        # TODO
      end
    end

    get "web_api/v1/stats/votes_by_gender" do
      time_boundary_parameters self
      parameter :ideas, "Array of idea ids to get the stats for.", required: false

      let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_year }
      let(:end_at) { Time.now.in_time_zone(@timezone).end_of_year }

      example_request "Votes by gender" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        # TODO
      end
    end

    get "web_api/v1/stats/votes_by_custom_field" do
      before do
        @custom_field = create(:custom_field)
      end
      time_boundary_parameters self
      parameter :ideas, "Array of idea ids to get the stats for.", required: false
      parameter :custom_field, "The custom field id which should serve as dimensions of the stats.", required: true

      let(:custom_field) { @custom_field.id }
      let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_year }
      let(:end_at) { Time.now.in_time_zone(@timezone).end_of_year }

      example_request "Votes by custom field" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        # TODO
      end
    end

    get "web_api/v1/stats/votes_by_time" do
      time_series_parameters self
      parameter :resource, "Either Idea or Comment. If not provided, all votes are taken.", required: false

      let(:start_at) { Time.now.in_time_zone(@timezone).beginning_of_week }
      let(:end_at) { Time.now.in_time_zone(@timezone).end_of_week }
      let(:interval) { 'day' }

      example_request "Votes by time" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.size).to eq 7
        expect(json_response.values.map(&:class).uniq).to eq [Integer]
      end
    end
  end
end
