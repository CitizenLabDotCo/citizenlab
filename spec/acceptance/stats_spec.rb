require 'rails_helper'
require 'rspec_api_documentation/dsl'



def time_boundary_parameters s
  s.parameter :start_at, "Date defining from where results should start", required: true
  s.parameter :end_at, "Date defining till when results should go", required: true
end

def time_series_parameters s
  time_boundary_parameters s
  s.parameter :interval, "Either day, week, month, year"
end

resource "Stats" do

  before do
    @current_user = create(:user, roles: [{type: 'admin'}])
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
      create_list(:user_with_demographics, 10)
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

  get "web_api/v1/stats/votes_by_time" do

    time_series_parameters self

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
